import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("DEBUG: send-newsletter function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody = await req.json();
    console.log("DEBUG: Request body received:", JSON.stringify(requestBody));
    
    const { newsletterId } = requestBody;
    
    if (!newsletterId) {
      console.error("DEBUG: Missing newsletterId in request");
      throw new Error("Newsletter ID is required");
    }
    
    console.log(`DEBUG: Processing newsletter ID: ${newsletterId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("DEBUG: Missing environment variables");
      throw new Error("Server configuration error: Missing environment variables");
    }
    
    console.log("DEBUG: Creating Supabase client");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, let's check the table structure
    console.log("DEBUG: Checking table structure");
    
    try {
      // Try to get the first subscriber to see structure
      const { data: firstSubscriber, error: structError } = await supabase
        .from("subscribers")
        .select("*")
        .limit(1)
        .maybeSingle();
        
      if (structError) {
        console.error("DEBUG: Error fetching subscriber structure:", structError.message);
      } else if (firstSubscriber) {
        console.log("DEBUG: Subscriber columns:", Object.keys(firstSubscriber));
        console.log("DEBUG: Sample subscriber data:", JSON.stringify(firstSubscriber));
      } else {
        console.log("DEBUG: No subscribers found for structure check");
      }
    } catch (structCheckError) {
      console.error("DEBUG: Error during structure check:", structCheckError);
    }
    
    // Get the newsletter content
    console.log("DEBUG: Fetching newsletter content");
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("subject, content")
      .eq("id", newsletterId)
      .single();
      
    if (newsletterError) {
      console.error(`DEBUG: Newsletter fetch error: ${newsletterError.message}`);
      throw new Error(`Failed to fetch newsletter: ${newsletterError.message}`);
    }
    
    if (!newsletter) {
      console.error("DEBUG: Newsletter not found");
      throw new Error("Newsletter not found");
    }
    
    // Attempt to get subscribers with only email field
    console.log("DEBUG: Fetching subscribers with email field only");
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email");
      
    if (subscribersError) {
      console.error(`DEBUG: Subscribers fetch error with email only: ${subscribersError.message}`);
      // Don't throw yet, try another approach
    } else {
      console.log(`DEBUG: Successfully fetched ${subscribers?.length || 0} subscribers with email only`);
    }
    
    // If there was an error or no subscribers found, return error response
    if (subscribersError || !subscribers || subscribers.length === 0) {
      console.log("DEBUG: No subscribers found or error occurred");
      return new Response(
        JSON.stringify({ 
          message: subscribersError ? subscribersError.message : "No subscribers found", 
          success: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Update newsletter as sent
    console.log("DEBUG: Marking newsletter as sent");
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({ 
        sent_at: new Date().toISOString(),
        recipients_count: subscribers.length,
        status: 'sent' 
      })
      .eq("id", newsletterId);
      
    if (updateError) {
      console.error(`DEBUG: Update error: ${updateError.message}`);
    } else {
      console.log("DEBUG: Newsletter marked as sent successfully");
    }
    
    // Return success response
    console.log("DEBUG: Returning success response");
    return new Response(
      JSON.stringify({ 
        message: `Newsletter would be sent to ${subscribers.length} subscribers`,
        subscribers: subscribers.length,
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("DEBUG: Error sending newsletter:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}); 
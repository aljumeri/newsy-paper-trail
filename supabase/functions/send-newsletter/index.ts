
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { newsletterId } = await req.json();
    
    if (!newsletterId) {
      throw new Error("Newsletter ID is required");
    }

    // Initialize Supabase client with Deno.env
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the newsletter content
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("subject, content")
      .eq("id", newsletterId)
      .single();
      
    if (newsletterError || !newsletter) {
      throw new Error(`Failed to fetch newsletter: ${newsletterError?.message || "Newsletter not found"}`);
    }
    
    // Get all subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email");
      
    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }
    
    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Update newsletter as sent
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", newsletterId);
      
    if (updateError) {
      console.error("Failed to mark newsletter as sent:", updateError);
    }
    
    // In a real application, you would use an email service API here
    // to actually send emails to all subscribers
    // For this example, we'll just return a success message
    console.log(`Newsletter "${newsletter.subject}" would be sent to ${subscribers.length} subscribers`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        message: `Newsletter would be sent to ${subscribers.length} subscribers`,
        subscribers: subscribers.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error sending newsletter:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

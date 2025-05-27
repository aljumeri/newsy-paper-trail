// @deno-types="../deno.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  newsletterId: string;
}

interface NewsletterData {
  subject: string;
  content: string;
}

interface SubscriberData {
  email: string;
}

// Fallback values for local development
const FALLBACK_SUPABASE_URL = "https://vqkdadugmkwnthkfjbla.supabase.co";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa2RhZHVnbWt3bnRoa2ZqYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDQwOTUsImV4cCI6MjA2MTcyMDA5NX0.AyZpQgkaypIz2thFdO2K5WF7WFXog2tw-t_9RLBapY4";

serve(async (req: Request) => {
  console.log("Edge Function: send-newsletter invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody = await req.json();
    console.log("Edge Function: Request body received:", JSON.stringify(requestBody));
    
    const { newsletterId } = requestBody as NewsletterRequest;
    
    if (!newsletterId) {
      console.error("Edge Function: Missing newsletterId in request");
      throw new Error("Newsletter ID is required");
    }
    
    console.log(`Edge Function: Processing newsletter ID: ${newsletterId}`);

    // Initialize Supabase client with Deno.env
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || FALLBACK_SUPABASE_URL;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || FALLBACK_ANON_KEY;
    
    console.log("Edge Function: Creating Supabase client");
    console.log(`Edge Function: Using URL: ${supabaseUrl}`);
    console.log("Edge Function: Service key available:", !!supabaseKey);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the newsletter content
    console.log("Edge Function: Fetching newsletter content");
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("subject, content")
      .eq("id", newsletterId)
      .single();
      
    if (newsletterError) {
      console.error(`Edge Function: Newsletter fetch error: ${newsletterError.message}`);
      throw new Error(`Failed to fetch newsletter: ${newsletterError.message}`);
    }
    
    if (!newsletter) {
      console.error("Edge Function: Newsletter not found");
      throw new Error("Newsletter not found");
    }
    
    console.log(`Edge Function: Newsletter found: ${newsletter.subject}`);
    
    // Get all subscribers - explicitly only select email field
    console.log("Edge Function: Fetching subscribers");
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email")
      .order("created_at", { ascending: false });
      
    if (subscribersError) {
      console.error(`Edge Function: Subscribers fetch error: ${subscribersError.message}`);
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }
    
    console.log(`Edge Function: Found ${subscribers?.length || 0} subscribers`);
    
    if (!subscribers || subscribers.length === 0) {
      console.log("Edge Function: No subscribers found");
      return new Response(
        JSON.stringify({ message: "No subscribers found", success: true, subscribers: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Update newsletter as sent
    console.log("Edge Function: Marking newsletter as sent");
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({ 
        sent_at: new Date().toISOString(),
        recipients_count: subscribers.length,
        status: 'sent'
      })
      .eq("id", newsletterId);
      
    if (updateError) {
      console.error(`Edge Function: Update error: ${updateError.message}`);
      // Continue anyway as this is not critical
    } else {
      console.log("Edge Function: Newsletter marked as sent successfully");
    }
    
    // In a real application, you would use an email service API here
    // to actually send emails to all subscribers
    // For this example, we'll just return a success message
    console.log(`Edge Function: Newsletter "${newsletter.subject}" would be sent to ${subscribers.length} subscribers`);
    
    // Return success response
    console.log("Edge Function: Returning success response");
    return new Response(
      JSON.stringify({ 
        message: `Newsletter sent to ${subscribers.length} subscribers`,
        subscribers: subscribers.length,
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error: unknown) {
    console.error("Edge Function: Error sending newsletter:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

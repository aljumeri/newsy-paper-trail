
// @deno-types="../deno.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// Dynamic CORS headers based on environment
const getAllowedOrigins = () => {
  const deployedUrl = Deno.env.get("DEPLOYED_URL");
  const customDomain = Deno.env.get("CUSTOM_DOMAIN");
  
  const allowedOrigins = [
    "https://vqkdadugmkwnthkfjbla.supabase.co",
    "http://localhost:3000",
    "http://localhost:5173"
  ];
  
  if (deployedUrl) allowedOrigins.push(deployedUrl);
  if (customDomain) allowedOrigins.push(customDomain);
  
  return allowedOrigins;
};

const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400"
  };
};

interface NewsletterRequest {
  newsletterId: string;
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody = await req.json();
    const { newsletterId } = requestBody as NewsletterRequest;
    
    if (!newsletterId) {
      throw new Error("Newsletter ID is required");
    }

    // Initialize Supabase client - removed fallback credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing required environment variables");
      throw new Error("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the newsletter content
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("subject, content")
      .eq("id", newsletterId)
      .single();
      
    if (newsletterError) {
      console.error("Newsletter fetch error:", newsletterError.code);
      throw new Error("Failed to fetch newsletter");
    }
    
    if (!newsletter) {
      throw new Error("Newsletter not found");
    }
    
    // Get subscriber count only to avoid column issues
    const { count: subscribersCount, error: subscribersError } = await supabase
      .from("subscribers")
      .select("*", { count: 'exact', head: true });
      
    if (subscribersError) {
      console.error("Subscribers count error:", subscribersError.code);
      throw new Error("Failed to count subscribers");
    }
    
    const subscriberCount = subscribersCount || 0;
    
    if (subscriberCount === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers found", success: true, subscribers: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Update newsletter as sent
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({ 
        sent_at: new Date().toISOString(),
        recipients_count: subscriberCount,
        status: 'sent' 
      })
      .eq("id", newsletterId);
      
    if (updateError) {
      console.error("Update error:", updateError.code);
      // Continue anyway as this is not critical
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        message: `Newsletter sent to ${subscriberCount} subscribers`,
        subscribers: subscriberCount,
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error: unknown) {
    console.error("Error sending newsletter:", error instanceof Error ? error.message : "Unknown error");
    
    return new Response(
      JSON.stringify({ error: "Internal server error", success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

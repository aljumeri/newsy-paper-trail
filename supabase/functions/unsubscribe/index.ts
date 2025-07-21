import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UnsubscribeRequest {
  email: string;
  token: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, token } = await req.json() as UnsubscribeRequest;

    if (!email || !token) {
      throw new Error("Email and token are required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the unsubscribe token
    const { data: subscriber, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("id, email, unsubscribe_token")
      .eq("email", email)
      .single();

    if (subscriberError || !subscriber) {
      throw new Error("Subscriber not found");
    }

    if (subscriber.unsubscribe_token !== token) {
      throw new Error("Invalid unsubscribe token");
    }

    // Delete the subscriber
    const { error: deleteError } = await supabaseClient
      .from("subscribers")
      .delete()
      .eq("id", subscriber.id);

    if (deleteError) {
      throw new Error("Failed to unsubscribe");
    }

    // Remove from Sendy list
    const sendyUrl = Deno.env.get('SENDY_URL');
    const sendyApiKey = Deno.env.get('SENDY_API_KEY');
    const sendyListId = Deno.env.get('SENDY_LIST_ID');
    if (!sendyUrl || !sendyApiKey || !sendyListId) {
      throw new Error('Sendy configuration missing');
    }
    const sendyForm = new URLSearchParams();
    sendyForm.append('api_key', sendyApiKey);
    sendyForm.append('list_id', sendyListId);
    sendyForm.append('email', email);
    const sendyResp = await fetch(`${sendyUrl}/unsubscribe`, {
      method: 'POST',
      body: sendyForm,
    });
    const sendyText = await sendyResp.text();
    if (!sendyResp.ok || !/1|successfully unsubscribed|not subscribed/i.test(sendyText)) {
      throw new Error('Sendy unsubscribe failed: ' + sendyText);
    }

    return new Response(
      JSON.stringify({ 
        message: "Successfully unsubscribed",
        success: true 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Unsubscribe Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
}); 
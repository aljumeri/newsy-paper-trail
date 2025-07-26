import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-domain",
};

interface UnsubscribeRequest {
  email: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json() as UnsubscribeRequest;

    if (!email) {
      throw new Error("Email is required");
    }

    // Remove from Sendy list
    const sendyUrl = Deno.env.get('SENDY_URL');
    const sendyApiKey = Deno.env.get('SENDY_API_KEY');
    const sendyListId = Deno.env.get('SENDY_LIST_ID');
    
    if (!sendyUrl || !sendyApiKey || !sendyListId) {
      throw new Error('Sendy configuration missing');
    }

    console.log("Edge Function: Unsubscribing from Sendy:", email);

    const sendyForm = new URLSearchParams();
    sendyForm.append('api_key', sendyApiKey);
    sendyForm.append('list', sendyListId);
    sendyForm.append('email', email);

    console.log("Edge Function: Sendy credentials:", sendyUrl, sendyApiKey, sendyListId, email);

    const sendyResp = await fetch(`${sendyUrl}/unsubscribe`, {
      method: 'POST',
      body: sendyForm,
    });

    const sendyText = await sendyResp.text();
    console.log("Edge Function: Sendy unsubscribe response:", sendyText);

    // Helper function to delete subscriber from list
    const deleteSubscriber = async (): Promise<{ success: boolean; message: string }> => {
      console.log("Edge Function: Proceeding to delete subscriber from list");
      
      const deleteForm = new URLSearchParams();
      deleteForm.append('api_key', sendyApiKey);
      deleteForm.append('list_id', sendyListId);
      deleteForm.append('email', email);

      console.log("Edge Function: Calling delete API for:", email);

      const deleteResp = await fetch(`${sendyUrl}/api/subscribers/delete.php`, {
        method: 'POST',
        body: deleteForm,
      });

      const deleteText = await deleteResp.text();
      console.log("Edge Function: Delete API response:", deleteText);

      // Check if delete was successful
      if (deleteResp.ok && (deleteText.includes('1') || deleteText.includes('success') || deleteText.includes('deleted'))) {
        console.log("Edge Function: Subscriber successfully deleted from list");
        return { success: true, message: "Successfully unsubscribed and removed from list" };
      } else {
        console.log("Edge Function: Delete API failed, but unsubscribe was successful");
        return { success: true, message: "Successfully unsubscribed (delete failed)" };
      }
    };

    // Check if the response is HTML (indicating an error page)
    if (sendyText.includes('<!DOCTYPE html>') || sendyText.includes('<html>')) {
      // Extract error message from HTML if possible
      let errorMessage = 'Unknown error';
      if (sendyText.includes('Email does not exist')) {
        errorMessage = 'Email does not exist in the list';
      } else if (sendyText.includes('Unsubscribed')) {
        errorMessage = 'Successfully unsubscribed';
      }
      
      console.log("Edge Function: HTML response detected, message:", errorMessage);
      
      // If it's a success message, proceed to delete
      if (errorMessage === 'Successfully unsubscribed') {
        const deleteResult = await deleteSubscriber();
        return new Response(
          JSON.stringify({ 
            message: deleteResult.message,
            success: deleteResult.success 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      } else {
        throw new Error('Sendy unsubscribe failed: ' + errorMessage);
      }
    }

    // Check for simple text responses
    if (!sendyResp.ok || !/1|successfully unsubscribed|not subscribed/i.test(sendyText)) {
      throw new Error('Sendy unsubscribe failed: ' + sendyText);
    }

    // If we reach here, unsubscribe was successful, now delete
    const deleteResult = await deleteSubscriber();
    return new Response(
      JSON.stringify({ 
        message: deleteResult.message,
        success: deleteResult.success 
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
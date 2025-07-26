// @deno-types="../deno.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-domain",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface SubscriberRequest {
  email: string;
}

Deno.serve(async (req: Request) => {
  console.log("Edge Function: add-subscriber invoked with method:", req.method);
  
  if (req.method === "OPTIONS") {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const requestBody = await req.json();
    console.log("Edge Function: Request body received:", JSON.stringify(requestBody));
    
    const { email } = requestBody as SubscriberRequest;

    if (!email || typeof email !== "string" || !email.trim()) {
      console.error("Edge Function: Invalid email provided:", email);
      return new Response(JSON.stringify({
        success: false,
        message: "يرجى إدخال بريد إلكتروني صالح"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }

    // Validate email format - more comprehensive regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      console.error("Edge Function: Invalid email format:", email);
      return new Response(JSON.stringify({
        success: false,
        message: "يرجى إدخال بريد إلكتروني صالح"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }

    // Add to Sendy list
    const sendyUrl = Deno.env.get('SENDY_URL');
    const sendyApiKey = Deno.env.get('SENDY_API_KEY');
    const sendyListId = Deno.env.get('SENDY_LIST_ID');
    
    if (!sendyUrl || !sendyApiKey || !sendyListId) {
      console.error('Sendy configuration missing');
      return new Response(JSON.stringify({
        success: false,
        message: 'خطأ في إعدادات الخادم (Sendy)'
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }

    console.log("Edge Function: Adding subscriber to Sendy:", email.trim());
    console.log("Edge Function: Sendy URL:", sendyUrl);
    console.log("Edge Function: Sendy List ID:", sendyListId);

    const sendyForm = new URLSearchParams();
    sendyForm.append('api_key', sendyApiKey);
    sendyForm.append('list', sendyListId);
    sendyForm.append('email', email.trim());

    console.log("Edge Function: Sendy form data:", sendyForm.toString());

    const sendyResp = await fetch(`${sendyUrl}/subscribe`, {
      method: 'POST',
      body: sendyForm,
    });

    const sendyText = await sendyResp.text();
    console.log("Edge Function: Sendy response:", sendyText);
    console.log("Edge Function: Sendy response status:", sendyResp.status);
    console.log("Edge Function: Sendy response ok:", sendyResp.ok);

    // Check if the response is HTML
    if (sendyText.includes('<!DOCTYPE html>') || sendyText.includes('<html>')) {
      console.log('Sendy returned HTML response:', sendyText);
      
      // Check for success messages in HTML
      if (sendyText.includes("You're subscribed!") || sendyText.includes('subscribed') || sendyText.includes('success')) {
        console.log('Sendy subscription successful - detected from HTML');
        return new Response(JSON.stringify({
          success: true,
          message: "تم اشتراكك بنجاح في النشرة الإخبارية."
        }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      
      // Check for already subscribed messages
      if (sendyText.includes('already subscribed') || sendyText.includes('Already subscribed')) {
        console.log('Sendy user already subscribed - detected from HTML');
        return new Response(JSON.stringify({
          success: true,
          message: "تم إعادة اشتراك البريد الإلكتروني بنجاح"
        }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      
      // If it's HTML but no success message found, treat as error
      console.error('Sendy subscribe failed - HTML response with no success message:', sendyText);
      return new Response(JSON.stringify({
        success: false,
        message: 'فشل الاشتراك في القائمة البريدية. يرجى المحاولة لاحقًا.'
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }

    // Check for success or already subscribed
    if (!sendyResp.ok || !/1|already subscribed|success/i.test(sendyText)) {
      console.error('Sendy subscribe failed:', sendyText);
      console.error('Sendy response status:', sendyResp.status);
      console.error('Sendy response ok:', sendyResp.ok);
      return new Response(JSON.stringify({
        success: false,
        message: 'فشل الاشتراك في القائمة البريدية. يرجى المحاولة لاحقًا.'
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }

    console.log("Edge Function: Subscriber added successfully to Sendy");

    return new Response(JSON.stringify({
      success: true,
      message: sendyText.includes('already subscribed') 
        ? "تم إعادة اشتراك البريد الإلكتروني بنجاح"
        : "تم اشتراكك بنجاح في النشرة الإخبارية."
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Unexpected error in add-subscriber function:", err);
    return new Response(JSON.stringify({
      success: false,
      message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا."
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
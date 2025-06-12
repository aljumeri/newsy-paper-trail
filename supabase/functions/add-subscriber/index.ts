// @deno-types="../deno.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-domain",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface SubscriberRequest {
  email: string;
}

// Function to generate a random unsubscribe token
function generateUnsubscribeToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Edge Function: Missing Supabase configuration");
      return new Response(JSON.stringify({
        success: false,
        message: "خطأ في إعدادات الخادم"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if email already exists
    console.log("Edge Function: Checking if email exists:", email.trim());
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("email", email.trim())
      .maybeSingle();

    if (checkError) {
      console.error("Edge Function: Error checking existing subscriber:", checkError);
      return new Response(JSON.stringify({
        success: false,
        message: "حدث خطأ أثناء التحقق من البريد الإلكتروني"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }

    if (existingSubscriber) {
      console.log("Edge Function: Email already exists:", email.trim());
      return new Response(JSON.stringify({
        success: false,
        message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }

    // Generate unsubscribe token
    const unsubscribeToken = generateUnsubscribeToken();
    console.log("Edge Function: Generated unsubscribe token:", unsubscribeToken.substring(0, 8) + "...");

    // Prepare the data to insert
    const subscriberData = {
      email: email.trim(),
      created_at: new Date().toISOString(),
      vendor: req.headers.get("origin") || null,
      unsubscribe_token: unsubscribeToken
    };

    console.log("Edge Function: Inserting subscriber data:", {
      ...subscriberData,
      unsubscribe_token: subscriberData.unsubscribe_token.substring(0, 8) + "..."
    });

    // Insert new subscriber
    const { data, error } = await supabase
      .from("subscribers")
      .insert([subscriberData])
      .select();

    if (error) {
      console.error("Error adding subscriber:", error);
      
      // Handle duplicate key error specifically
      if (error.code === '23505') {
        return new Response(JSON.stringify({
          success: false,
          message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين"
        }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          },
          status: 400
        });
      }
      
      return new Response(JSON.stringify({
        success: false,
        message: "حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى لاحقًا."
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }

    console.log("Edge Function: Subscriber added successfully:", {
      ...data[0],
      unsubscribe_token: data[0]?.unsubscribe_token ? data[0].unsubscribe_token.substring(0, 8) + "..." : "NULL"
    });

    return new Response(JSON.stringify({
      success: true,
      subscriber: data[0],
      message: "تم اشتراكك بنجاح في النشرة الإخبارية."
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
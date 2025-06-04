// @deno-types="../deno.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins for testing
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-domain",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface SubscriberRequest {
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { email } = await req.json() as SubscriberRequest;

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({
        error: "Email is required and must be a string"
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
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: existingSubscriber } = await supabase
      .from("subscribers")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingSubscriber) {
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

    const { data, error } = await supabase
      .from("subscribers")
      .insert([{ 
        email,
        created_at: new Date().toISOString(),
        vendor: req.headers.get("origin") || null
      }])
      .select();

    if (error) {
      console.error("Error adding subscriber:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }

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
      error: "Unexpected error occurred"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});

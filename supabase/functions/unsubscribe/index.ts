// @deno-types="../deno.d.ts"
// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import * as crypto from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-domain",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface UnsubscribeRequest {
  email: string;
  token?: string; // Optional token for verification
}

// Simple hash function to generate/verify tokens
async function generateEmailToken(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = Deno.env.get("UNSUBSCRIBE_SECRET") || "default-secret-key";
  const data = encoder.encode(email + secretKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

serve(async (req) => {
  console.log("Edge Function: unsubscribe invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json() as UnsubscribeRequest;
    console.log("Edge Function: Request body received");
    
    const { email, token } = requestBody;
    
    if (!email) {
      console.error("Edge Function: Missing email in request");
      throw new Error("Email is required");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Edge Function: Missing environment variables");
      throw new Error("Server configuration error: Missing environment variables");
    }
    
    console.log("Edge Function: Creating Supabase client");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify token if provided
    if (token) {
      const expectedToken = await generateEmailToken(email);
      if (token !== expectedToken) {
        console.error("Edge Function: Invalid token");
        throw new Error("رمز التحقق غير صالح. يرجى استخدام الرابط المرسل إلى بريدك الإلكتروني.");
      }
    }
    
    // Check if subscriber exists
    const { data: subscriber, error: checkError } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Edge Function: Check error: ${checkError.message}`);
      throw new Error("حدث خطأ أثناء التحقق من البريد الإلكتروني");
    }
    
    if (!subscriber) {
      console.log("Edge Function: Subscriber not found");
      return new Response(
        JSON.stringify({ 
          message: "البريد الإلكتروني غير مشترك في النشرة الإخبارية", 
          success: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Delete the subscriber
    console.log(`Edge Function: Removing subscriber: ${email}`);
    const { error: deleteError } = await supabase
      .from("subscribers")
      .delete()
      .eq("email", email);
    
    if (deleteError) {
      console.error(`Edge Function: Delete error: ${deleteError.message}`);
      throw new Error("فشل إلغاء الاشتراك. يرجى المحاولة مرة أخرى لاحقًا.");
    }
    
    console.log("Edge Function: Subscriber removed successfully");
    
    // Create a log of this action
    try {
      await supabase
        .from("security_logs")
        .insert({
          action: "unsubscribe",
          resource_type: "subscriber",
          resource_id: email,
          user_agent: req.headers.get("user-agent") || null
        });
    } catch (logErr) {
      console.error("Edge Function: Error logging action:", logErr);
      // Don't throw, just log the error
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        message: "تم إلغاء الاشتراك بنجاح", 
        success: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Edge Function: Error unsubscribing:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف";
    
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}); 
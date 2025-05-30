// Enhanced add-subscriber Edge Function for deployment
// @ts-nocheck
// deno-lint-ignore-file

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins for testing
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-domain",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface SubscriberRequest {
  email: string;
}

// Enhanced Edge Function with better error handling and logging
Deno.serve(async (req) => {
  console.log("Edge Function: add-subscriber invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody = await req.json();
    console.log("Edge Function: Request body received");
    
    const { email } = requestBody as SubscriberRequest;
    
    if (!email) {
      console.error("Edge Function: Missing email in request");
      throw new Error("Email is required");
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Edge Function: Invalid email format");
      throw new Error("Invalid email format");
    }
    
    console.log(`Edge Function: Processing email subscription: ${email.substring(0, 3)}...`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Edge Function: Missing environment variables");
      console.error(`SUPABASE_URL: ${supabaseUrl ? "set" : "missing"}`);
      console.error(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? "set" : "missing"}`);
      throw new Error("Server configuration error: Missing environment variables");
    }
    
    console.log("Edge Function: Creating Supabase client");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First try using the secure RPC function
    console.log("Edge Function: Attempting to add subscriber via RPC function");
    const { data: rpcData, error: rpcError } = await supabase.rpc('add_subscriber', {
      subscriber_email: email
    });
    
    if (!rpcError && rpcData && rpcData.success) {
      console.log("Edge Function: Subscriber added successfully via RPC");
      return new Response(
        JSON.stringify({ 
          message: "تم اشتراكك بنجاح في النشرة الإخبارية.", 
          success: true,
          subscriber_id: rpcData.subscriber_id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // If RPC failed, fall back to direct insert with error handling
    console.log("Edge Function: RPC failed, falling back to direct insert");
    
    // Check if email already exists
    console.log("Edge Function: Checking if email already exists");
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Edge Function: Check error: ${checkError.message}`);
      // Continue anyway, we'll get a unique constraint error if it exists
    } else if (existingSubscriber) {
      console.log("Edge Function: Email already exists");
      return new Response(
        JSON.stringify({ message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين", success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Insert new subscriber
    console.log("Edge Function: Inserting new subscriber");
    const { data, error } = await supabase
      .from("subscribers")
      .insert({ email })
      .select()
      .maybeSingle();
    
    if (error) {
      if (error.code === '23505') {
        console.log("Edge Function: Email already exists (constraint error)");
        return new Response(
          JSON.stringify({ message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين", success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      console.error(`Edge Function: Insert error: ${error.message}`);
      throw new Error(`Failed to add subscriber: ${error.message}`);
    }
    
    console.log("Edge Function: Subscriber added successfully");
    return new Response(
      JSON.stringify({ 
        message: "تم اشتراكك بنجاح في النشرة الإخبارية.", 
        success: true,
        subscriber_id: data?.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Edge Function: Error adding subscriber:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}); 
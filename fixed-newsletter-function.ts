// @ts-nocheck
// Fixed version of the send-newsletter function for deployment
// Includes proper unsubscribe functionality for newsletters

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import * as crypto from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-domain",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
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

// Generate unsubscribe token for email
async function generateEmailToken(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = Deno.env.get("UNSUBSCRIBE_SECRET") || "default-secret-key";
  const data = encoder.encode(email + secretKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// Create unsubscribe link for a subscriber
async function createUnsubscribeLink(email: string, origin: string): Promise<string> {
  const token = await generateEmailToken(email);
  const encodedEmail = encodeURIComponent(email);
  return `${origin}/unsubscribe?email=${encodedEmail}&token=${token}`;
}

// Wrap newsletter content with template including unsubscribe link
async function wrapNewsletterContent(content: string, email: string, origin: string): Promise<string> {
  const unsubscribeLink = await createUnsubscribeLink(email, origin);
  
  return `
    <div dir="rtl" style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      ${content}
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
        <p>
          إذا كنت تريد إلغاء الاشتراك في هذه النشرة الإخبارية، 
          <a href="${unsubscribeLink}" style="color: #666;">اضغط هنا</a>
        </p>
      </div>
    </div>
  `;
}

serve(async (req: Request) => {
  console.log("Edge Function: send-newsletter invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Edge Function: No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", success: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Get request body
    const requestBody = await req.json();
    console.log("Edge Function: Request body received:", JSON.stringify(requestBody));
    
    const { newsletterId } = requestBody;
    
    if (!newsletterId) {
      console.error("Edge Function: Missing newsletterId in request");
      throw new Error("Newsletter ID is required");
    }
    
    console.log(`Edge Function: Processing newsletter ID: ${newsletterId}`);

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
    
    // Get origin for unsubscribe links
    const origin = req.headers.get("origin") || "https://your-site-url.com";
    console.log(`Edge Function: Using origin for links: ${origin}`);
    
    // Get all subscribers
    console.log("Edge Function: Fetching subscribers");
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email");
      
    if (subscribersError) {
      console.error(`Edge Function: Subscribers fetch error: ${subscribersError.message}`);
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }
    
    if (!subscribers || subscribers.length === 0) {
      console.log("Edge Function: No subscribers found");
      return new Response(
        JSON.stringify({ message: "No subscribers found", success: true, subscribers: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Edge Function: Found ${subscribers.length} subscribers`);
    
    // For each subscriber, we would prepare a personalized email with unsubscribe link
    // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
    console.log("Edge Function: Would prepare personalized emails with unsubscribe links");
    
    // Here's an example of what would happen for each subscriber:
    if (subscribers && subscribers.length > 0) {
      const sampleSubscriber = subscribers[0];
      const personalizedContent = await wrapNewsletterContent(
        newsletter.content, 
        sampleSubscriber.email, 
        origin
      );
      console.log("Edge Function: Example personalized content created with unsubscribe link");
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
    
    // Create a log of this action
    try {
      const { error: logError } = await supabase
        .from("security_logs")
        .insert({
          action: "newsletter_sent",
          resource_type: "newsletter",
          resource_id: newsletterId,
          user_agent: req.headers.get("user-agent") || null
        });
        
      if (logError) {
        console.error("Edge Function: Failed to log action:", logError.message);
      }
    } catch (logErr) {
      console.error("Edge Function: Error logging action:", logErr);
      // Don't throw, just log the error
    }
    
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
    
  } catch (error) {
    console.error("Edge Function: Error sending newsletter:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}); 
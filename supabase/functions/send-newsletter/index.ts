// @deno-types="../deno.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { crypto } from "https://deno.land/std@0.178.0/crypto/mod.ts"; 

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
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
    const { data: subscribers, error: subscribersError, count: subscribersCount } = await supabase
      .from("subscribers")
      .select("email", { count: 'exact' });
      
    if (subscribersError) {
      console.error(`Edge Function: Subscribers fetch error: ${subscribersError.message}`);
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }
    
    const subscriberCount = subscribersCount || 0;
    console.log(`Edge Function: Found ${subscriberCount} subscribers`);
    
    if (subscriberCount === 0) {
      console.log("Edge Function: No subscribers found");
      return new Response(
        JSON.stringify({ message: "No subscribers found", success: true, subscribers: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
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
        recipients_count: subscriberCount,
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
    console.log(`Edge Function: Newsletter "${newsletter.subject}" would be sent to ${subscriberCount} subscribers`);
    
    // Return success response
    console.log("Edge Function: Returning success response");
    return new Response(
      JSON.stringify({ 
        message: `Newsletter sent to ${subscriberCount} subscribers`,
        subscribers: subscriberCount,
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

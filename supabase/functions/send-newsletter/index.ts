// @deno-types="../deno.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

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

async function sendEmail(to: string, from: string, subject: string, html: string) {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set");
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: from },
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      }),
    });

    const responseText = await response.text();
    console.log("SendGrid Response Status:", response.status);
    console.log("SendGrid Response Headers:", {
      "content-type": response.headers.get("content-type"),
      "x-request-id": response.headers.get("x-request-id"),
    });
    console.log("SendGrid Response Body:", responseText);

    if (!response.ok) {
      let errorMessage;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = `SendGrid API error: ${JSON.stringify(errorJson)}`;
      } catch (e) {
        errorMessage = `SendGrid API error: Status ${response.status}, Response: ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    // If response is empty, return success
    if (!responseText) {
      return { success: true };
    }

    // Try to parse JSON response if it exists
    try {
      return JSON.parse(responseText);
    } catch (e) {
      return { success: true, message: "Email sent successfully" };
    }
  } catch (error) {
    console.error("SendGrid Error Details:", error);
    throw error;
  }
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Edge Function: Missing environment variables");
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
    
    // Get all subscribers
    console.log("Edge Function: Fetching subscribers");
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email")
      .order("created_at", { ascending: false });
      
    if (subscribersError) {
      console.error(`Edge Function: Subscribers fetch error: ${subscribersError.message}`);
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }
    
    console.log(`Edge Function: Found ${subscribers?.length || 0} subscribers`);
    
    if (!subscribers || subscribers.length === 0) {
      console.log("Edge Function: No subscribers found");
      return new Response(
        JSON.stringify({ message: "No subscribers found", success: true, subscribers: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Send emails to all subscribers
    console.log("Edge Function: Sending emails to subscribers");
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        console.log(`Attempting to send email to: ${subscriber.email}`);
        await sendEmail(
          subscriber.email,
          "hhhassanhafeez91@gmail.com",
          newsletter.subject,
          newsletter.content
        );
        console.log(`Successfully sent email to ${subscriber.email}`);
        return true;
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        throw error;
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    console.log("Email sending results:", results);
    
    const successfulSends = results.filter(r => r.status === 'fulfilled').length;
    const failedSends = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Successfully sent: ${successfulSends}, Failed: ${failedSends}`);
    
    if (failedSends > 0) {
      console.error("Some emails failed to send:", results.filter(r => r.status === 'rejected').map(r => r.reason));
    }
    
    // Update newsletter as sent
    console.log("Edge Function: Marking newsletter as sent");
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({ 
        sent_at: new Date().toISOString(),
        recipients_count: successfulSends,
        status: successfulSends > 0 ? 'sent' : 'failed'
      })
      .eq("id", newsletterId);
      
    if (updateError) {
      console.error(`Edge Function: Update error: ${updateError.message}`);
      // Continue anyway as this is not critical
    } else {
      console.log("Edge Function: Newsletter marked as sent successfully");
    }
    
    // Return success response
    console.log("Edge Function: Returning success response");
    return new Response(
      JSON.stringify({ 
        message: `Newsletter sent to ${successfulSends} subscribers`,
        subscribers: successfulSends,
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

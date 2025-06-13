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
  unsubscribe_token: string;
}

async function sendEmail(to: string, from: string, subject: string, html: string, unsubscribeToken: string) {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set");
  }

  // Add unsubscribe link to the email
  const siteUrl = Deno.env.get("SITE_URL");
  if (!siteUrl) {
    console.warn("SITE_URL not set, using default");
  }
  
  const unsubscribeLink = `${siteUrl || 'https://solo4ai.com'}/unsubscribe?email=${encodeURIComponent(to)}&token=${unsubscribeToken}`;
  
  // Create a properly formatted email template
const emailTemplate = `
  <!DOCTYPE html>
  <html lang="ar">
  <head><meta charset="UTF-8"></head>
  <body dir="rtl" style="direction: rtl; text-align: right; margin:0; padding:20px;">
    <div style="direction: rtl; text-align: right;">
      ${html
        .split('\n')
        .map(line => `<p style="margin-bottom:1em;">${line}</p>`)
        .join('')}
    </div>
    <div style="direction: rtl; text-align: right; margin-top:30px; padding-top:20px; border-top:1px solid #eee; font-size:12px; color:#666;">
      <p>إذا كنت ترغب في إلغاء الاشتراك… <a href="${unsubscribeLink}">النقر هنا</a>.</p>
    </div>
  </body>
  </html>
`;


  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Lovable-Newsletter/1.0"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { 
          email: from,
          name: "Solo4AI Newsletter"
        },
        content: [
          {
            type: "text/html",
            value: emailTemplate,
          },
        ],
        // Add tracking settings to help with deliverability
        tracking_settings: {
          click_tracking: {
            enable: true,
            enable_text: false
          },
          open_tracking: {
            enable: true
          }
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log("SendGrid Response Status:", response.status);
    console.log("SendGrid Response Headers:", {
      "content-type": response.headers.get("content-type"),
      "x-request-id": response.headers.get("x-request-id"),
    });
    
    // Only log response body if there's an error or it's not empty
    if (!response.ok || responseText) {
      console.log("SendGrid Response Body:", responseText);
    }

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

    // SendGrid returns 202 for successful requests with empty body
    if (response.status === 202) {
      return { success: true, message: "Email queued successfully" };
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
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error("SendGrid request timed out");
      throw new Error("Email sending timed out");
    }
    
    console.error("SendGrid Error Details:", error);
    throw error;
  }
}

serve(async (req: Request) => {
  console.log("Edge Function: send-newsletter invoked");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables early
    const requiredEnvVars = ["SENDGRID_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
    const missingEnvVars = requiredEnvVars.filter(envVar => !Deno.env.get(envVar));
    
    if (missingEnvVars.length > 0) {
      console.error("Missing environment variables:", missingEnvVars);
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
    }

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
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
    
    // Get all subscribers with their unsubscribe tokens
    console.log("Edge Function: Fetching subscribers");
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email, unsubscribe_token")
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
    
    // Send emails to all subscribers with rate limiting
    console.log("Edge Function: Sending emails to subscribers");
    const fromEmail = "info@solo4ai.com";
    let successfulSends = 0;
    let failedSends = 0;
    const errors: string[] = [];

    // Process emails in smaller batches to avoid overwhelming the service
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const emailPromises = batch.map(async (subscriber) => {
        try {
          console.log(`Attempting to send email to: ${subscriber.email}`);
          await sendEmail(
            subscriber.email,
            fromEmail,
            newsletter.subject,
            newsletter.content,
            subscriber.unsubscribe_token
          );
          console.log(`Successfully sent email to ${subscriber.email}`);
          successfulSends++;
          return { success: true, email: subscriber.email };
        } catch (error) {
          const errorMsg = `Failed to send email to ${subscriber.email}: ${error.message}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          failedSends++;
          return { success: false, email: subscriber.email, error: error.message };
        }
      });

      // Wait for current batch to complete before starting next batch
      const batchResults = await Promise.allSettled(emailPromises);
      console.log(`Batch completed. Successful: ${batchResults.filter(r => r.status === 'fulfilled').length}, Failed: ${batchResults.filter(r => r.status === 'rejected').length}`);
      
      // Add a small delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Email sending completed. Successful: ${successfulSends}, Failed: ${failedSends}`);
    
    if (errors.length > 0) {
      console.error("Errors encountered:", errors);
    }
    
    // Return success response with details
    const responseData = { 
      message: `Newsletter sent to ${successfulSends} subscribers${failedSends > 0 ? ` (${failedSends} failed)` : ''}`,
      subscribers: successfulSends,
      failed: failedSends,
      success: successfulSends > 0,
      errors: failedSends > 0 ? errors.slice(0, 5) : [] // Limit error details in response
    };
    
    console.log("Edge Function: Returning response:", responseData);
    return new Response(
      JSON.stringify(responseData),
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
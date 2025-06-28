
// @deno-types="../deno.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NewsletterRequest {
  newsletterId: string;
}

// Function to process HTML content for better email display
function processHtmlForEmail(html: string): string {
  let processedHtml = html
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>')
    .replace(/<br\s*\/?>/gi, '</p><p>')
    .replace(/<p>\s*<\/p>/gi, '')
    .trim();
  
  if (!processedHtml.startsWith('<')) {
    processedHtml = '<p>' + processedHtml;
  }
  if (!processedHtml.endsWith('>')) {
    processedHtml = processedHtml + '</p>';
  }
  
  if (!processedHtml.startsWith('<p>') && !processedHtml.startsWith('<div>') && !processedHtml.startsWith('<h')) {
    processedHtml = '<p>' + processedHtml + '</p>';
  }
  
  return processedHtml;
}

async function sendEmail(to: string, from: string, subject: string, html: string, unsubscribeToken: string) {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  if (!apiKey) {
    console.log("SENDGRID_API_KEY not found, simulating email send");
    return { success: true, message: "Email simulated (no API key)" };
  }

  const siteUrl = Deno.env.get("SITE_URL") || 'https://solo4ai.com';
  const unsubscribeLink = `${siteUrl}/unsubscribe?email=${encodeURIComponent(to)}&token=${unsubscribeToken}`;
  
  const processedContent = processHtmlForEmail(html);
  
  const emailTemplate = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Noto Naskh Arabic', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .email-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .email-content {
            direction: rtl;
            text-align: right;
            font-size: 16px;
            line-height: 1.8;
        }
        .email-content p {
            margin: 0 0 20px 0;
            line-height: 1.8;
            direction: rtl;
            text-align: right;
            font-size: 16px;
        }
        .unsubscribe-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
            direction: rtl;
        }
        .unsubscribe-section a {
            color: #0066cc;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1 style="color: #333; margin: 0; font-size: 24px; direction: rtl; text-align: center;">${subject}</h1>
        </div>
        <div class="email-content">
            ${processedContent}
        </div>
        <div class="unsubscribe-section">
            <p>إذا كنت ترغب في إلغاء الاشتراك في النشرة الإخبارية، يمكنك <a href="${unsubscribeLink}">النقر هنا</a>.</p>
            <p>نشرة سولو للذكاء الاصطناعي</p>
        </div>
    </div>
</body>
</html>`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Solo4AI-Newsletter/1.0"
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

    if (!response.ok) {
      const responseText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = `SendGrid API error: ${JSON.stringify(errorJson)}`;
      } catch (e) {
        errorMessage = `SendGrid API error: Status ${response.status}, Response: ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    return { success: true, message: "Email sent successfully" };
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
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Edge Function: Handling OPTIONS request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    console.log(`Edge Function: Method ${req.method} not allowed`);
    return new Response(
      JSON.stringify({ error: "Method not allowed", success: false }),
      { 
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Get request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("Edge Function: Raw request body:", bodyText);
      requestBody = JSON.parse(bodyText);
    } catch (e) {
      console.error("Edge Function: Failed to parse request body:", e);
      throw new Error("Invalid JSON in request body");
    }
    
    console.log("Edge Function: Parsed request body:", JSON.stringify(requestBody));
    
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
    } else {
      console.log("Edge Function: Newsletter marked as sent successfully");
    }
    
    // Send emails to all subscribers
    console.log("Edge Function: Sending emails to subscribers");
    const fromEmail = "info@solo4ai.com";
    let successfulSends = 0;
    let failedSends = 0;
    const errors: string[] = [];

    const hasApiKey = !!Deno.env.get("SENDGRID_API_KEY");
    if (!hasApiKey) {
      console.log("No SendGrid API key found, simulating email sending");
    }

    // Process emails in smaller batches
    const batchSize = 5;
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

      await Promise.allSettled(emailPromises);
      console.log(`Batch completed. Current totals - Successful: ${successfulSends}, Failed: ${failedSends}`);
      
      // Add delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`Email sending completed. Final totals - Successful: ${successfulSends}, Failed: ${failedSends}`);
    
    const responseData = { 
      message: hasApiKey 
        ? `Newsletter sent to ${successfulSends} subscribers${failedSends > 0 ? ` (${failedSends} failed)` : ''}`
        : `Newsletter marked as sent to ${subscribers.length} subscribers (simulated - no API key)`,
      subscribers: successfulSends,
      failed: failedSends,
      success: true,
      errors: failedSends > 0 ? errors.slice(0, 3) : []
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

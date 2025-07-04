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
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set");
  }

  // Add unsubscribe link to the email
  const siteUrl = Deno.env.get("SITE_URL");
  const unsubscribeLink = `${siteUrl || 'https://solo4ai.com'}/unsubscribe?email=${encodeURIComponent(to)}&token=${unsubscribeToken}`;

  // Compose the email body (HTML)
  const emailHtml = `
    ${html}
    <div style="direction: rtl; margin-top:30px; padding-top:20px; border-top:1px solid #eee; font-size:12px; color:#666;">
      <p>إذا كنت ترغب في إلغاء الاشتراك… <a href="${unsubscribeLink}">النقر هنا</a>.</p>
    </div>
  `;

  // Brevo API endpoint
  const url = "https://api.brevo.com/v3/smtp/email";

  // Prepare JSON payload
  const payload = {
    sender: {
      email: from,
      name: "Solo4AI Newsletter"
    },
    to: [
      { email: to }
    ],
    subject: subject,
    htmlContent: emailHtml,
    headers: {
      "List-Unsubscribe": `<${unsubscribeLink}>`
    }
  };

  // Send the email via Brevo
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!response.ok) {
    let errorMessage = `Brevo API error: Status ${response.status}, Response: ${responseText}`;
    throw new Error(errorMessage);
  }
  return { success: true, message: "Email sent via Brevo" };
}

// Helper: Render newsletter JSON to HTML for email
function renderNewsletterHtml(newsletter: any): string {
  let html = '';
  // Header
  html += `<div style="background: linear-gradient(90deg,#3b82f6,#ec4899,#38bdf8); padding: 24px 16px; border-radius: 12px 12px 0 0; text-align: center; color: #fff;">
    <h1 style="margin: 0; font-size: 2em; font-weight: bold;">${newsletter.main_title || ''}</h1>
    ${newsletter.sub_title ? `<div style='font-size:1.1em; margin-top:8px;'>${newsletter.sub_title}</div>` : ''}
    ${newsletter.date ? `<div style='font-size:0.95em; margin-top:8px; color:#e0e0e0;'>${newsletter.date}</div>` : ''}
  </div>`;
  // Sections
  try {
    const sections = JSON.parse(newsletter.content);
    if (Array.isArray(sections)) {
      for (const section of sections) {
        html += `<div style="background:#fff; margin:24px 0; border-radius:12px; box-shadow:0 2px 8px #0001; padding:24px;">
          <h2 style="color:#3b82f6; margin-top:0;">${section.title || ''}</h2>
          <div style="margin-bottom:12px; color:#333;">${section.content || ''}</div>`;
        // Subsections
        if (section.subsections && section.subsections.length) {
          html += '<ul style="margin:0 0 12px 0; padding:0 0 0 24px;">';
          for (const sub of section.subsections) {
            html += `<li><strong>${sub.title}:</strong> ${sub.content}</li>`;
          }
          html += '</ul>';
        }
        html += '</div>';
      }
    } else {
      html += `<div>${newsletter.content}</div>`;
    }
  } catch (e) {
    html += `<div>${newsletter.content}</div>`;
  }
  // Wrap all content in RTL container
  return `<div dir="rtl" style="text-align: right; font-family: Tahoma, Arial, sans-serif;">${html}</div>`;
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
    const requiredEnvVars = ["BREVO_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
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
      .select("main_title, sub_title, date, content")
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
    
    console.log(`Edge Function: Newsletter found: ${newsletter.main_title}`);
    
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
          // Render HTML for email
          const htmlBody = renderNewsletterHtml(newsletter);
          await sendEmail(
            subscriber.email,
            fromEmail,
            newsletter.main_title,
            htmlBody,
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
// @deno-types="../deno.d.ts"
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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

async function sendEmail(
  to: string,
  from: string,
  subject: string,
  html: string,
  unsubscribeToken: string
) {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not set');
  }

  // Add unsubscribe link to the email
  const siteUrl = Deno.env.get('SITE_URL');
  const unsubscribeLink = `${
    siteUrl || 'https://solo4ai.com'
  }/unsubscribe?email=${encodeURIComponent(to)}&token=${unsubscribeToken}`;

  // Compose the email body (HTML)
  const emailHtml = `
    ${html}
    <div style="direction: rtl; margin-top:30px; padding-top:20px; border-top:1px solid #eee; font-size:12px; color:#666;">
      <p>إذا كنت ترغب في إلغاء الاشتراك… <a href="${unsubscribeLink}">النقر هنا</a>.</p>
    </div>
  `;

  // Brevo API endpoint
  const url = 'https://api.brevo.com/v3/smtp/email';

  // Prepare JSON payload
  const payload = {
    sender: {
      email: from,
      name: 'Solo4AI Newsletter',
    },
            to: [{ email: to }],
            subject: subject,
    htmlContent: emailHtml,
    headers: {
      'List-Unsubscribe': `<${unsubscribeLink}>`,
    },
  };

  // Send the email via Brevo
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

    const responseText = await response.text();
  if (!response.ok) {
    let errorMessage = `Brevo API error: Status ${response.status}, Response: ${responseText}`;
    throw new Error(errorMessage);
  }
  return { success: true, message: 'Email sent via Brevo' };
}

// Helper: Convert markdown links to HTML links
function convertMarkdownLinks(text: string): string {
  if (!text) return '';
  
  // Process bold text first: **text** -> <strong>text</strong>
  let processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Simple markdown link regex: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return processedText.replace(linkRegex, '<a href="$2" target="_blank" style="color: #0066cc; text-decoration: underline;">$1</a>');
}

// Helper: Render newsletter JSON to HTML for email
function renderNewsletterHtml(newsletter: any): string {
  const fontStyle = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic&display=swap');
      * {
        font-family: 'Noto Naskh Arabic', serif;
        box-sizing: border-box;
      }
      @media only screen and (max-width: 600px) {
        .newsletter-container {
          padding: 12px !important;
        }
        .section-container {
          padding: 16px !important;
          margin: 16px 0 !important;
        }
        .media-item {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
        }
        .media-container {
          text-align: center !important;
        }
        .link-container {
          width: 100% !important;
          max-width: 100% !important;
        }
      }
    </style>
  `;
  let html = '';
  // Header
  html += `<div style="background: linear-gradient(90deg,#3b82f6,#ec4899,#38bdf8); padding: 24px 16px; border-radius: 12px 12px 0 0; text-align: center; color: #fff;">
    <h1 style="margin: 0; font-size: 2em; font-weight: bold;">${
      newsletter.main_title || ''
    }</h1>
    ${
      newsletter.sub_title
        ? `<div style='font-size:1.1em; margin-top:8px;'>${newsletter.sub_title}</div>`
        : ''
    }
    ${
      newsletter.date
        ? `<div style='font-size:0.95em; margin-top:8px; color:#e0e0e0;'>${newsletter.date}</div>`
        : ''
    }
  </div>`;
  // Sections
  try {
    const sections = JSON.parse(newsletter.content);
    if (Array.isArray(sections)) {
      for (const section of sections) {
        // Section background and side line
        html += `<div class="section-container" style="background:${section.backgroundColor?.includes('white') ? '#fff' : section.backgroundColor?.includes('pink') ? '#fde4ec' : section.backgroundColor?.includes('green') ? '#e9fbe5' : section.backgroundColor?.includes('blue') ? '#e6f0fa' : section.backgroundColor?.includes('cyan') ? '#e0f7fa' : section.backgroundColor?.includes('purple') ? '#f3e8ff' : '#fff'}; margin:24px 0; border-radius:12px; box-shadow:0 2px 8px #0001; padding:24px; position:relative;">
          <div style="position:absolute; right:0; top:0; bottom:0; width:8px; border-radius:8px; background:${section.sideLineColor || '#3b82f6'};"></div>
          <h2 style="color:#3b82f6; margin-top:0; margin-bottom:16px; font-size:${section.titleFontSize === 'text-xs' ? '12px' : section.titleFontSize === 'text-sm' ? '14px' : section.titleFontSize === 'text-base' ? '16px' : section.titleFontSize === 'text-lg' ? '18px' : section.titleFontSize === 'text-xl' ? '20px' : section.titleFontSize === 'text-2xl' ? '24px' : section.titleFontSize === 'text-3xl' ? '30px' : section.titleFontSize === 'text-4xl' ? '36px' : '24px'}; font-weight:bold;">${convertMarkdownLinks(section.title || '')}</h2>
          <div style="margin-bottom:12px; color:#333; font-size:${section.contentFontSize === 'text-xs' ? '12px' : section.contentFontSize === 'text-sm' ? '14px' : section.contentFontSize === 'text-base' ? '16px' : section.contentFontSize === 'text-lg' ? '18px' : section.contentFontSize === 'text-xl' ? '20px' : section.contentFontSize === 'text-2xl' ? '24px' : section.contentFontSize === 'text-3xl' ? '30px' : section.contentFontSize === 'text-4xl' ? '36px' : '18px'}; line-height:1.6; white-space:pre-line;">${convertMarkdownLinks(section.content || '')}</div>`;
        // Media Items
        if (section.mediaItems && section.mediaItems.length) {
          for (const item of section.mediaItems) {
            // Alignment and size
            let align = 'center';
            let size = 'medium';
            if (item.alignment) align = item.alignment;
            if (item.size) size = item.size;
            
            // Responsive width calculation
            let width = '100%';
            let maxWidth = '100%';
            if (size === 'small') {
              width = '25%';
              maxWidth = '200px';
            } else if (size === 'medium') {
              width = '50%';
              maxWidth = '400px';
            } else if (size === 'large') {
              width = '75%';
              maxWidth = '600px';
            } else if (size === 'full') {
              width = '100%';
              maxWidth = '100%';
            }
            
            // Responsive alignment
            let containerAlign = 'center';
            if (align === 'left') containerAlign = 'left';
            else if (align === 'right') containerAlign = 'right';
            
            if (item.type === 'image') {
              html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px;">
                <img class="media-item" src="${item.url}" alt="" style="display:inline-block; width:${width}; max-width:${maxWidth}; height:auto; object-fit:cover; border-radius:8px;" />
              </div>`;
              if (item.textContent) {
                html += `<div style="margin-bottom:16px; color:#333; font-size:16px; line-height:1.6; white-space:pre-line;">${convertMarkdownLinks(item.textContent)}</div>`;
              }
            } else if (item.type === 'video') {
              html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px;">
                <a href="${item.url}" target="_blank">
                  <img class="media-item" src="https://vqkdadugmkwnthkfjbla.supabase.co/storage/v1/object/public/newsletter-assets/newsletter_images/video-placeholder/video-placeholder.jpeg" alt="" style="display:inline-block; width:${width}; max-width:${maxWidth}; height:auto; object-fit:cover; border-radius:8px;" />
                </a>
              </div>`;
              if (item.textContent) {
                html += `<div style="margin-bottom:16px; color:#333; font-size:16px; line-height:1.6; white-space:pre-line;">${convertMarkdownLinks(item.textContent)}</div>`;
              }
            } else if (item.type === 'youtube') {
              let videoId = '';
              let ytThumb = 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
              const ytMatch = item.url.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
              if (ytMatch && ytMatch[1]) {
                videoId = ytMatch[1];
                ytThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
              html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px; position:relative; display:inline-block;">
                <a href="${item.url}" target="_blank" style="position:relative; display:inline-block;">
                  <img class="media-item" src="${ytThumb}" alt="" style="display:inline-block; width:${width}; max-width:${maxWidth}; height:auto; object-fit:cover; border-radius:8px; position:relative; z-index:1;" />
                </a>
              </div>`;
              if (item.textContent) {
                html += `<div style="margin-bottom:16px; color:#333; font-size:16px; line-height:1.6; white-space:pre-line;">${convertMarkdownLinks(item.textContent)}</div>`;
              }
            } else if (item.type === 'link') {
              html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px;">
                <a href="${item.url}" target="_blank" class="link-container" style="display:inline-block; width:${width}; max-width:${maxWidth};">
                  <div style="display:flex;align-items:center;gap:8px;padding:12px;background:#e0f2fe;border-radius:8px;border-right:4px solid #3b82f6;width:100%;">
                    <span style="color:#3b82f6;font-size:18px;">🔗</span><span style="color:#2563eb;font-size:18px;text-decoration:underline;">${item.title || item.url}</span>
                  </div>
                </a>
              </div>`;
            }
          }
        }
        // Lists
        if (section.lists && section.lists.length) {
          for (const list of section.lists) {
            if (list.type === 'bullet') {
              html += '<div style="margin-bottom:16px;">';
              for (const item of list.items) {
                html += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${item.color};"></span><span style="font-size:16px;color:#333;">${convertMarkdownLinks(item.text)}</span></div>`;
              }
              html += '</div>';
            } else if (list.type === 'numbered') {
              html += '<div style="margin-bottom:16px;">';
              list.items.forEach((item, idx) => {
                html += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="font-weight:bold;font-size:18px;color:${item.color};width:24px;display:inline-block;">${String(idx + 1).padStart(2, '0')}</span><span style="font-size:16px;color:#333;">${convertMarkdownLinks(item.text)}</span></div>`;
              });
              html += '</div>';
            }
          }
        }
        // Subsections
        if (section.subsections && section.subsections.length) {
          html += '<div style="margin-top:18px;">';
          for (const sub of section.subsections) {
            html += `<div style="margin-bottom:16px;"><div style="font-weight:bold;color:#3b82f6; font-size:${sub.titleFontSize === 'text-xs' ? '12px' : sub.titleFontSize === 'text-sm' ? '14px' : sub.titleFontSize === 'text-base' ? '16px' : sub.titleFontSize === 'text-lg' ? '18px' : sub.titleFontSize === 'text-xl' ? '20px' : sub.titleFontSize === 'text-2xl' ? '24px' : sub.titleFontSize === 'text-3xl' ? '30px' : sub.titleFontSize === 'text-4xl' ? '36px' : '18px'}; margin-bottom:8px;">${convertMarkdownLinks(sub.title)}</div><div style="color:#333; font-size:${sub.contentFontSize === 'text-xs' ? '12px' : sub.contentFontSize === 'text-sm' ? '14px' : sub.contentFontSize === 'text-base' ? '16px' : sub.contentFontSize === 'text-lg' ? '18px' : sub.contentFontSize === 'text-xl' ? '20px' : sub.contentFontSize === 'text-2xl' ? '24px' : sub.contentFontSize === 'text-3xl' ? '30px' : sub.contentFontSize === 'text-4xl' ? '36px' : '16px'}; line-height:1.5; white-space:pre-line;">${convertMarkdownLinks(sub.content)}</div></div>`;
            
            // Subsection Media Items
            if (sub.mediaItems && sub.mediaItems.length) {
              for (const item of sub.mediaItems) {
                // Alignment and size
                let align = 'center';
                let size = 'medium';
                if (item.alignment) align = item.alignment;
                if (item.size) size = item.size;
                
                // Responsive width calculation
                let width = '100%';
                let maxWidth = '100%';
                if (size === 'small') {
                  width = '25%';
                  maxWidth = '200px';
                } else if (size === 'medium') {
                  width = '50%';
                  maxWidth = '400px';
                } else if (size === 'large') {
                  width = '75%';
                  maxWidth = '600px';
                } else if (size === 'full') {
                  width = '100%';
                  maxWidth = '100%';
                }
                
                // Responsive alignment
                let containerAlign = 'center';
                if (align === 'left') containerAlign = 'left';
                else if (align === 'right') containerAlign = 'right';
                
                if (item.type === 'image') {
                  html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px;">
                    <img class="media-item" src="${item.url}" alt="" style="display:inline-block; width:${width}; max-width:${maxWidth}; height:auto; object-fit:cover; border-radius:8px;" />
                  </div>`;
                  if (item.textContent) {
                    html += `<div style="margin-bottom:16px; color:#333; font-size:16px; line-height:1.6; white-space:pre-line;">${convertMarkdownLinks(item.textContent)}</div>`;
                  }
                } else if (item.type === 'video') {
                  html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px;">
                    <a href="${item.url}" target="_blank">
                      <img class="media-item" src="https://vqkdadugmkwnthkfjbla.supabase.co/storage/v1/object/public/newsletter-assets/newsletter_images/video-placeholder/video-placeholder.jpeg" alt="" style="display:inline-block; width:${width}; max-width:${maxWidth}; height:auto; object-fit:cover; border-radius:8px;" />
                    </a>
                  </div>`;
                  if (item.textContent) {
                    html += `<div style="margin-bottom:16px; color:#333; font-size:16px; line-height:1.6; white-space:pre-line;">${convertMarkdownLinks(item.textContent)}</div>`;
                  }
                } else if (item.type === 'youtube') {
                  let marginStyle = align === 'left' ? 'margin-right:auto;margin-left:0;' : align === 'right' ? 'margin-left:auto;margin-right:0;' : 'margin-left:auto;margin-right:auto;';
                  let videoId = '';
                  let ytThumb = 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
                  const ytMatch = item.url.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                  if (ytMatch && ytMatch[1]) {
                    videoId = ytMatch[1];
                    ytThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }
                  html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px; position:relative; display:inline-block;">
                    <a href="${item.url}" target="_blank" style="position:relative; display:inline-block;">
                      <img class="media-item" src="${ytThumb}" alt="" style="display:inline-block; width:${width}; max-width:${maxWidth}; height:auto; object-fit:cover; border-radius:8px; position:relative; z-index:1;" />
                    </a>
                  </div>`;
                  if (item.textContent) {
                    html += `<div style="margin-bottom:16px; color:#333; font-size:16px; line-height:1.6; white-space:pre-line;">${convertMarkdownLinks(item.textContent)}</div>`;
                  }
                } else if (item.type === 'link') {
                  html += `<div class="media-container" style="text-align:${containerAlign}; margin-bottom:16px;">
                    <a href="${item.url}" target="_blank" class="link-container" style="display:inline-block; width:${width}; max-width:${maxWidth};">
                      <div style="display:flex;align-items:center;gap:8px;padding:12px;background:#e0f2fe;border-radius:8px;border-right:4px solid #3b82f6;width:100%;">
                        <span style="color:#3b82f6;font-size:18px;">🔗</span><span style="color:#2563eb;font-size:18px;text-decoration:underline;">${item.title || item.url}</span>
                      </div>
                    </a>
                  </div>`;
                }
              }
            }
          }
          html += '</div>';
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
  return ` ${fontStyle}<div class="newsletter-container" dir="rtl" style="text-align: right; font-family: 'Noto Naskh Arabic', serif; max-width: 100%; width: 100%;">${html}</div>`;
}

serve(async (req: Request) => {
  console.log('Edge Function: send-newsletter invoked');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Edge Function: Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables early
    const requiredEnvVars = [
      'BREVO_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !Deno.env.get(envVar)
    );
    
    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars);
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }

    // Get request body
    const requestBody = await req.json();
    console.log(
      'Edge Function: Request body received:',
      JSON.stringify(requestBody)
    );
    
    const { newsletterId } = requestBody as NewsletterRequest;
    
    if (!newsletterId) {
      console.error('Edge Function: Missing newsletterId in request');
      throw new Error('Newsletter ID is required');
    }
    
    console.log(`Edge Function: Processing newsletter ID: ${newsletterId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('Edge Function: Creating Supabase client');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the newsletter content
    console.log('Edge Function: Fetching newsletter content');
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('main_title, sub_title, date, content')
      .eq('id', newsletterId)
      .single();
      
    if (newsletterError) {
      console.error(
        `Edge Function: Newsletter fetch error: ${newsletterError.message}`
      );
      throw new Error(`Failed to fetch newsletter: ${newsletterError.message}`);
    }
    
    if (!newsletter) {
      console.error('Edge Function: Newsletter not found');
      throw new Error('Newsletter not found');
    }
    
    console.log(`Edge Function: Newsletter found: ${newsletter.main_title}`);
    
    // Get all subscribers with their unsubscribe tokens
    console.log('Edge Function: Fetching subscribers');
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email, unsubscribe_token')
      .order('created_at', { ascending: false });
      
    if (subscribersError) {
      console.error(
        `Edge Function: Subscribers fetch error: ${subscribersError.message}`
      );
      throw new Error(
        `Failed to fetch subscribers: ${subscribersError.message}`
      );
    }
    
    console.log(`Edge Function: Found ${subscribers?.length || 0} subscribers`);
    
    if (!subscribers || subscribers.length === 0) {
      console.log('Edge Function: No subscribers found');
      return new Response(
        JSON.stringify({
          message: 'No subscribers found',
          success: true,
          subscribers: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update newsletter as sent
    console.log('Edge Function: Marking newsletter as sent');
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({ 
        sent_at: new Date().toISOString(),
        recipients_count: subscribers.length,
        status: 'sent',
      })
      .eq('id', newsletterId);
      
    if (updateError) {
      console.error(`Edge Function: Update error: ${updateError.message}`);
      // Continue anyway as this is not critical
    } else {
      console.log('Edge Function: Newsletter marked as sent successfully');
    }
    
    // Send emails to all subscribers with rate limiting
    console.log('Edge Function: Sending emails to subscribers');
    const fromEmail = 'info@solo4ai.com';
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
      const emailPromises = batch.map(async subscriber => {
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
          return {
            success: false,
            email: subscriber.email,
            error: error.message,
          };
        }
      });

      // Wait for current batch to complete before starting next batch
      const batchResults = await Promise.allSettled(emailPromises);
      console.log(
        `Batch completed. Successful: ${
          batchResults.filter(r => r.status === 'fulfilled').length
        }, Failed: ${batchResults.filter(r => r.status === 'rejected').length}`
      );
      
      // Add a small delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(
      `Email sending completed. Successful: ${successfulSends}, Failed: ${failedSends}`
    );
    
    if (errors.length > 0) {
      console.error('Errors encountered:', errors);
    }
    
    // Return success response with details
    const responseData = { 
      message: `Newsletter sent to ${successfulSends} subscribers${
        failedSends > 0 ? ` (${failedSends} failed)` : ''
      }`,
      subscribers: successfulSends,
      failed: failedSends,
      success: successfulSends > 0,
      errors: failedSends > 0 ? errors.slice(0, 5) : [], // Limit error details in response
    };

    console.log('Edge Function: Returning response:', responseData);
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Edge Function: Error sending newsletter:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

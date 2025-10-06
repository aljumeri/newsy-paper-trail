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
  mode?: 'all' | 'single';
  email?: string; // Required when mode is 'single'
}

interface SubscriberData {
  email: string;
}

// Sendy campaign creation function
async function sendEmailWithSendy({
  subject,
  html,
  listId,
  fromName,
  fromEmail,
  replyTo,
}: {
  subject: string;
  html: string;
  listId: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
}) {
  const sendyUrl = Deno.env.get('SENDY_URL');
  const sendyApiKey = Deno.env.get('SENDY_API_KEY');
  if (!sendyUrl || !sendyApiKey) {
    throw new Error('SENDY_URL or SENDY_API_KEY is not set');
  }

  const formData = new URLSearchParams();
  formData.append('api_key', sendyApiKey);
  formData.append('from_name', fromName);
  formData.append('from_email', fromEmail);
  formData.append('reply_to', replyTo);
  formData.append('subject', subject);
  formData.append('html_text', html);
  formData.append('list_ids', listId);
  formData.append('send_campaign', '1');

  const response = await fetch(`${sendyUrl}/api/campaigns/create.php`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.text();
  if (!response.ok) {
    throw new Error(
      `Sendy API error: Status ${response.status}, Response: ${result}`
    );
  }
  return { success: true, message: 'Campaign created in Sendy', result };
}

// Helper: Convert markdown links to HTML links
function convertMarkdownLinks(text: string): string {
  if (!text) return '';

  // Process bold text first: **text** -> <strong>text</strong>
  const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Simple markdown link regex: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return processedText.replace(
    linkRegex,
    '<a href="$2" target="_blank" style="color: #0066cc; text-decoration: underline;">$1</a>'
  );
}

// Helper: Convert font size class to CSS value
function fontSizeToCss(fontSize: string): string {
  switch (fontSize) {
    case 'text-xs':
      return '12px';
    case 'text-sm':
      return '14px';
    case 'text-base':
      return '16px';
    case 'text-lg':
      return '18px';
    case 'text-xl':
      return '20px';
    case 'text-2xl':
      return '24px';
    case 'text-3xl':
      return '30px';
    case 'text-4xl':
      return '36px';
    default:
      return '16px';
  }
}

// Helper: Get bullet size based on font size
function getBulletSize(fontSize: string): string {
  switch (fontSize) {
    case 'text-xs':
      return '8px';
    case 'text-sm':
      return '10px';
    case 'text-base':
      return '12px';
    case 'text-lg':
      return '14px';
    case 'text-xl':
      return '16px';
    case 'text-2xl':
      return '20px';
    case 'text-3xl':
      return '24px';
    case 'text-4xl':
      return '32px';
    default:
      return '14px';
  }
}

// Helper: Render newsletter JSON to HTML for email
async function renderNewsletterHtml(
  newsletter: any,
  unsubscribeLink: string,
  supabase: any
): Promise<string> {
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
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${
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
  // Add gap between header and first section
  html += '<div style="height:32px;"></div>';
  // Sections
  try {
    const sections = JSON.parse(newsletter.content);
    if (Array.isArray(sections)) {
      for (const section of sections) {
        html += `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;border-collapse:separate;"><tr><td>
  <div class="section-container" style="background:${
    section.backgroundColor?.includes('white')
      ? '#fff'
      : section.backgroundColor?.includes('pink')
      ? '#fde4ec'
      : section.backgroundColor?.includes('green')
      ? '#e9fbe5'
      : section.backgroundColor?.includes('blue')
      ? '#e6f0fa'
      : section.backgroundColor?.includes('cyan')
      ? '#e0f7fa'
      : section.backgroundColor?.includes('purple')
      ? '#f3e8ff'
      : '#ffffff'
  };
  border-radius:12px;
  box-shadow:0 2px 8px #0001;
  padding:24px;
  position:relative;
  background-clip:padding-box;
  border-right-width:8px;
  border-right-style:solid;
  border-top-right-radius:8px;
  border-bottom-right-radius:8px;
  border-right-color:${section.sideLineColor || '#3b82f6'};
  ">
    <div style="position:absolute; right:0; top:0; bottom:0; width:8px; border-radius:8px; background:${
      section.sideLineColor || '#3b82f6'
    };"></div>
    <h2 style="color:${
      section.titleColor || '#000000'
    }; margin-top:0; margin-bottom:16px; font-size:${fontSizeToCss(
          section.titleFontSize || 'text-2xl'
        )}; font-weight:bold; text-align:justify;">${convertMarkdownLinks(
          section.title || ''
        )}</h2>
    <div style="margin-bottom:12px; color:${
      section.contentColor || '#000000'
    }; font-size:${fontSizeToCss(
          section.contentFontSize || 'text-base'
        )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
          section.content || ''
        )}</div>`;
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
            if (size === 'small') {
              width = '25%';
            } else if (size === 'medium') {
              width = '50%';
            } else if (size === 'large') {
              width = '75%';
            } else if (size === 'full') {
              width = '100%';
            }

            // Responsive alignment
            let containerAlign = 'center';
            if (align === 'left') containerAlign = 'left';
            else if (align === 'right') containerAlign = 'right';

            if (item.type === 'image') {
              html += `<div class="media-container" style="width:100%;text-align:${containerAlign}; margin:16px 0;">
                <img class="media-item" src="${
                  item.url
                }" alt="" style="margin-left:${
                containerAlign === 'left' ? '0' : 'auto'
              }; margin-right:${
                containerAlign === 'right' ? '0' : 'auto'
              }; display:block; width:${width}; height:auto; object-fit:cover; border-radius:8px;" />
              </div>`;
              if (item.textContent) {
                html += `<div style="margin-bottom:16px; color:#000000; font-size:${fontSizeToCss(
                  item.textFontSize || 'text-base'
                )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
                  item.textContent
                )}</div>`;
              }
            } else if (item.type === 'video') {
              html += `<div class="media-container" style="width:100%;text-align:${containerAlign}; margin:16px 0;">
                <a href="${
                  item.url
                }" target="_blank" style="display:block; width:100%;">
                  <img class="media-item" src="https://vqkdadugmkwnthkfjbla.supabase.co/storage/v1/object/public/newsletter-assets/newsletter_images/video-placeholder/video-placeholder.jpeg" alt="" style="margin-left:${
                    containerAlign === 'left' ? '0' : 'auto'
                  }; margin-right:${
                containerAlign === 'right' ? '0' : 'auto'
              }; display:block; width:${width}; height:auto; object-fit:cover; border-radius:8px;" />
                </a>
              </div>`;
              if (item.textContent) {
                html += `<div style="margin-bottom:16px; color:#000000; font-size:${fontSizeToCss(
                  item.textFontSize || 'text-base'
                )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
                  item.textContent
                )}</div>`;
              }
            } else if (item.type === 'youtube') {
              let videoId = '';
              let ytThumb =
                'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
              const ytMatch = item.url.match(
                /(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/
              );
              if (ytMatch && ytMatch[1]) {
                videoId = ytMatch[1];
                ytThumb =
                  item.previewUrl ||
                  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
              html += `<div class="media-container" style="width:100%;text-align:${containerAlign}; margin:16px 0; position:relative; display:block;">
                <a href="${
                  item.url
                }" target="_blank" style="position:relative; display:block; width:100%;">
                  <img class="media-item" src="${ytThumb}" alt="" style="margin-left:${
                containerAlign === 'left' ? '0' : 'auto'
              }; margin-right:${
                containerAlign === 'right' ? '0' : 'auto'
              }; display:block; width:${width}; height:auto; object-fit:cover; border-radius:8px; position:relative; z-index:1;" />
                </a>
              </div>`;
              if (item.textContent) {
                html += `<div style="margin-bottom:16px; color:#000000; font-size:${fontSizeToCss(
                  item.textFontSize || 'text-base'
                )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
                  item.textContent
                )}</div>`;
              }
            } else if (item.type === 'link') {
              html += `<div class="media-container" style="text-align:${containerAlign}; margin:16px 0;">
                <a href="${
                  item.url
                }" target="_blank" class="link-container" style="display:inline-block;">
                  <div style="display:flex;align-items:center;gap:8px;padding:12px;background:#e0f2fe;border-radius:8px;width:100%;">
                    <span style="color:#3b82f6;font-size:16px;">🔗</span><span style="color:#2563eb;font-size:16px;text-decoration:underline;">${
                      item.title || item.url
                    }</span>
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
                const itemFontSize = item.fontSize || 'text-base';
                const bulletSize = getBulletSize(itemFontSize);
                html += `<div style="margin-bottom:8px;"><span style="margin-left:8px;display:inline-block;width:${bulletSize};height:${bulletSize};border-radius:50%;background:${
                  item.color
                };vertical-align:middle;"></span><span style="font-size:${fontSizeToCss(
                  itemFontSize
                )};color:#000000; text-align:justify;vertical-align:middle;line-height:1.6;">${convertMarkdownLinks(
                  item.text
                )}</span></div>`;
              }
              html += '</div>';
            } else if (list.type === 'numbered') {
              html += '<div style="margin-bottom:16px;">';
              list.items.forEach((item, idx) => {
                const itemFontSize = item.fontSize || 'text-lg';
                html += `<div style="margin-bottom:8px;"><span style="margin-left:8px;font-weight:bold;font-size:${fontSizeToCss(
                  itemFontSize
                )};color:${
                  item.color
                };display:inline-block;vertical-align:middle;">${String(
                  idx + 1
                ).padStart(
                  2,
                  '0'
                )}</span><span style="font-size:${fontSizeToCss(
                  itemFontSize
                )};color:#000000; text-align:justify;vertical-align:middle;line-height:1.6;">${convertMarkdownLinks(
                  item.text
                )}</span></div>`;
              });
              html += '</div>';
            }
          }
        }
        // Content after lists
        if (section.afterListContent) {
          html += `<div style="margin-bottom:16px; color:${
            section.contentColor || '#000000'
          }; font-size:${fontSizeToCss(
            section.afterListContentFontSize ||
              section.contentFontSize ||
              'text-base'
          )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
            section.afterListContent
          )}</div>`;
        }
        // Subsections
        if (section.subsections && section.subsections.length) {
          html += '<div style="margin-top:18px;">';
          for (const sub of section.subsections) {
            html += `<div style="margin-bottom:16px;">
              <div style="font-weight:bold;color:${
                sub.titleColor || '#3b82f6'
              }; font-size:${fontSizeToCss(
              sub.titleFontSize || 'text-lg'
            )}; margin-bottom:8px;">${convertMarkdownLinks(sub.title)}</div>
              <div style="color:#000000; font-size:${fontSizeToCss(
                sub.contentFontSize || 'text-base'
              )}; line-height:1.5; white-space:pre-line;">${convertMarkdownLinks(
              sub.content
            )}</div>`;

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
                if (size === 'small') {
                  width = '25%';
                } else if (size === 'medium') {
                  width = '50%';
                } else if (size === 'large') {
                  width = '75%';
                } else if (size === 'full') {
                  width = '100%';
                }

                // Responsive alignment
                let containerAlign = 'center';
                if (align === 'left') containerAlign = 'left';
                else if (align === 'right') containerAlign = 'right';

                if (item.type === 'image') {
                  html += `<div class="media-container" style="display:block;width:100%;text-align:${containerAlign}; margin:16px 0;">
                    <img class="media-item" src="${
                      item.url
                    }" alt="" style="margin-left:${
                    containerAlign === 'left' ? '0' : 'auto'
                  }; margin-right:${
                    containerAlign === 'right' ? '0' : 'auto'
                  }; display:block; width:${width}; height:auto; object-fit:cover; border-radius:8px;" />
                  </div>`;
                  if (item.textContent) {
                    html += `<div style="margin-bottom:16px; color:#000000; font-size:${fontSizeToCss(
                      item.textFontSize || 'text-base'
                    )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
                      item.textContent
                    )}</div>`;
                  }
                } else if (item.type === 'video') {
                  html += `<div class="media-container" style="display:block; width:100%; text-align:${containerAlign}; margin:16px 0;">
                    <a href="${
                      item.url
                    }" target="_blank" style="display:block; width:100%;">
                      <img class="media-item" src="https://vqkdadugmkwnthkfjbla.supabase.co/storage/v1/object/public/newsletter-assets/newsletter_images/video-placeholder/video-placeholder.jpeg" alt="" style="margin-left:${
                        containerAlign === 'left' ? '0' : 'auto'
                      }; margin-right:${
                    containerAlign === 'right' ? '0' : 'auto'
                  }; display:block; width:${width}; height:auto; object-fit:cover; border-radius:8px;" />
                    </a>
                  </div>`;
                  if (item.textContent) {
                    html += `<div style="margin-bottom:16px; color:#000000; font-size:${fontSizeToCss(
                      item.textFontSize || 'text-base'
                    )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
                      item.textContent
                    )}</div>`;
                  }
                } else if (item.type === 'youtube') {
                  let videoId = '';
                  let ytThumb =
                    'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
                  const ytMatch = item.url.match(
                    /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
                  );
                  if (ytMatch && ytMatch[1]) {
                    videoId = ytMatch[1];
                    ytThumb =
                      item.previewUrl ||
                      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }
                  html += `<div class="media-container" style="text-align:${containerAlign}; margin:16px 0; position:relative; display:block; width:100%;">
                    <a href="${
                      item.url
                    }" target="_blank" style="position:relative; display:block; width:100%;">
                      <img class="media-item" src="${ytThumb}" alt="" style="margin-left:${
                    containerAlign === 'left' ? '0' : 'auto'
                  }; margin-right:${
                    containerAlign === 'right' ? '0' : 'auto'
                  }; display:block; width:${width}; height:auto; object-fit:cover; border-radius:8px; position:relative; z-index:1;" />
                    </a>
                  </div>`;
                  if (item.textContent) {
                    html += `<div style="margin-bottom:16px; color:#000000; font-size:${fontSizeToCss(
                      item.textFontSize || 'text-base'
                    )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
                      item.textContent
                    )}</div>`;
                  }
                } else if (item.type === 'link') {
                  html += `<div class="media-container" style="text-align:${containerAlign}; margin:16px 0;">
                    <a href="${
                      item.url
                    }" target="_blank" class="link-container" style="display:inline-block;">
                      <div style="display:flex;align-items:center;gap:8px;padding:12px;background:#e0f2fe;border-radius:8px;width:100%;">
                        <span style="color:#3b82f6;font-size:18px;">🔗</span><span style="color:#2563eb;font-size:18px;text-decoration:underline;">${
                          item.title || item.url
                        }</span>
                      </div>
                    </a>
                  </div>`;
                }
              }
            }

            // Subsection Lists
            if (sub.lists && sub.lists.length) {
              for (const list of sub.lists) {
                if (list.type === 'bullet') {
                  html +=
                    '<div style="margin-bottom:16px; border-right-width: 2px; border-right-color: #D1D5DB; border-right-style: solid;">';
                  for (const item of list.items) {
                    const itemFontSize = item.fontSize || 'text-base';
                    const bulletSize = getBulletSize(itemFontSize);
                    html += `<div style="margin-bottom:8px;padding-right:8px;"><span style="margin-left:8px;display:inline-block;width:${bulletSize};height:${bulletSize};border-radius:50%;background:${
                      item.color
                    };vertical-align:middle;"></span><span style="font-size:${fontSizeToCss(
                      itemFontSize
                    )};color:#000000; text-align:justify;vertical-align:middle;line-height:1.6;">${convertMarkdownLinks(
                      item.text
                    )}</span></div>`;
                  }
                  html += '</div>';
                } else if (list.type === 'numbered') {
                  html +=
                    '<div style="margin-bottom:16px; border-right-width: 2px; border-right-color: #D1D5DB; border-right-style: solid;">';
                  list.items.forEach((item, idx) => {
                    const itemFontSize = item.fontSize || 'text-base';
                    html += `<div style="margin-bottom:8px;padding-right:8px;"><span style="margin-left:8px;font-weight:bold;font-size:${fontSizeToCss(
                      itemFontSize
                    )};color:${
                      item.color
                    };display:inline-block;vertical-align:middle;line-height:1.6;">${String(
                      idx + 1
                    ).padStart(
                      2,
                      '0'
                    )}</span><span style="font-size:${fontSizeToCss(
                      itemFontSize
                    )};color:#000000; text-align:justify;vertical-align:middle;line-height:1.6;">${convertMarkdownLinks(
                      item.text
                    )}</span></div>`;
                  });
                  html += '</div>';
                }
              }
            }

            // Subsection content after lists
            if (sub.afterListContent) {
              html += `<div style="margin-bottom:16px; color:#000000; font-size:${fontSizeToCss(
                sub.afterListContentFontSize ||
                  sub.contentFontSize ||
                  'text-base'
              )}; line-height:1.6; white-space:pre-line; text-align:justify;">${convertMarkdownLinks(
                sub.afterListContent
              )}</div>`;
            }
          }
          html += '</div>';
        }
        html += '</div></td></tr>';
        // Add spacing row between sections
        html += '<tr><td height="32"></td></tr></table>';
      }
    } else {
      html += `<div>${newsletter.content}</div>`;
    }
  } catch (e) {
    html += `<div>${newsletter.content}</div>`;
  }
  // Wrap all content in RTL container
  html += `
    <div style="text-align:center; padding:32px 0 0 0; border-top:1px solid #eee; margin-top:40px;">
      <div class="footer-social-icons" style="margin-bottom:18px;">
        <a href="https://x.com/solo4ai?s=11" style="display:inline-block;margin:0 8px 8px 8px;"><img src='https://cdn-icons-png.flaticon.com/512/5968/5968830.png' alt='X' style='width:28px;height:28px;vertical-align:middle;'/></a>
        <a href="https://www.facebook.com/profile.php?id=61576451549251&mibextid=wwXIfr&mibextid=wwXIfr" style="display:inline-block;margin:0 8px 8px 8px;"><img src='https://cdn-icons-png.flaticon.com/512/733/733547.png' alt='Facebook' style='width:28px;height:28px;vertical-align:middle;'/></a>
      </div>
      <style>
        @media only screen and (max-width: 600px) {
          .footer-social-icons a {
            display: block !important;
            margin: 0 auto 12px auto !important;
          }
          .footer-social-icons img {
            margin: 0 auto !important;
          }
        }
      </style>
      <div style="color:#666;font-size:14px;margin-bottom:10px;">
        هل وصلتك هذه النشرة عبر صديق؟
        <a href="#" style="color:#2563eb;text-decoration:underline;font-weight:500;margin:0 4px;">اشترك من هنا</a>
        ، ليصلك جديدنا
      </div>
      <div style="color:#888;font-size:13px;margin-bottom:10px;">
        <a href="${unsubscribeLink}" style="color:#888;text-decoration:underline;">لإلغاء الاشتراك هنا</a>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding-top:12px;border-top:1px solid #f3f3f3;margin-top:18px;">
        <img src="https://solo4ai.com/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png" alt="Solo for AI Logo" style="height:32px;width:32px;" />
        <span style="color:#aaa;font-size:13px;text-align:center;display:block;">© 2025 جميع الحقوق محفوظة لـ سولو للذكاء الاصطناعي</span>
      </div>
    </div>
  `;
  // Replace {UNSUBSCRIBE_LINK} with the actual link if available
  return ` ${fontStyle}<div class="newsletter-container" dir="rtl" style="max-width: 800px; width: 100%; margin: 0 auto; text-align: right; font-family: 'Noto Naskh Arabic', serif;">${html}</div>`;
}

// Note: Sendy doesn't have list creation API, so we use individual email sending for new subscribers

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

    const { newsletterId, mode, email } = requestBody as NewsletterRequest;

    if (!newsletterId) {
      console.error('Edge Function: Missing newsletterId in request');
      throw new Error('Newsletter ID is required');
    }

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

    // Determine sending mode and get recipients
    const sendMode = mode || 'all';
    console.log(`Edge Function: Sending mode: ${sendMode}`);

    let recipients: SubscriberData[] = [];

    if (sendMode === 'single') {
      // Single email mode - create a temporary subscriber object
      if (!email) {
        throw new Error('Email is required for single mode');
      }

      recipients = [
        {
          email: email,
        },
      ];

      console.log(`Edge Function: Single email mode - sending to: ${email}`);
    } else {
      // All subscribers mode - fetch from database
      console.log('Edge Function: Fetching all subscribers');
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('email')
        .order('created_at', { ascending: false });

      if (subscribersError) {
        console.error(
          `Edge Function: Subscribers fetch error: ${subscribersError.message}`
        );
        throw new Error(
          `Failed to fetch subscribers: ${subscribersError.message}`
        );
      }

      console.log(
        `Edge Function: Found ${subscribers?.length || 0} subscribers`
      );

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

      recipients = subscribers;
    }

    // Update newsletter as sent (but only for 'all' and 'new' modes, not 'single')
    if (sendMode !== 'single') {
      console.log('Edge Function: Marking newsletter as sent');
      const updateData: any = {
        sent_at: new Date().toISOString(),
        recipients_count: recipients.length,
        status: 'sent',
      };

      // For 'all' mode, set last_sent_to to recipients_count
      updateData.last_sent_to = recipients.length;

      const { error: updateError } = await supabase
        .from('newsletters')
        .update(updateData)
        .eq('id', newsletterId);

      if (updateError) {
        console.error(`Edge Function: Update error: ${updateError.message}`);
        // Continue anyway as this is not critical
      } else {
        console.log('Edge Function: Newsletter marked as sent successfully');
      }
    }

    // Send emails to all subscribers with rate limiting
    console.log('Edge Function: Sending emails to subscribers');
    const fromEmail = 'info@solo4ai.com';
    const fromName = 'Solo4AI Newsletter';
    const replyTo = 'info@solo4ai.com';
    let successfulSends = 0;
    let failedSends = 0;
    const errors: string[] = [];

    if (sendMode === 'all' || sendMode === 'single') {
      try {
        // Use simple email-only unsubscribe link for Sendy
        const unsubscribeLink = `${
          Deno.env.get('SITE_URL') || 'https://solo4ai.com'
        }/unsubscribe?email=[Email]`;
        const htmlBody = await renderNewsletterHtml(
          newsletter,
          unsubscribeLink,
          supabase
        );
        let sendyListId;

        if (sendMode === 'all') {
          sendyListId = Deno.env.get('SENDY_LIST_ID');
        } else if (sendMode === 'single') {
          sendyListId = Deno.env.get('SENDY_TEST_LIST_ID');
        }

        if (!sendyListId)
          throw new Error('SENDY_LIST_ID (or SENDY_TEST_LIST_ID) is not set');

        await sendEmailWithSendy({
          subject: newsletter.main_title,
          html: htmlBody,
          listId: sendyListId,
          fromName,
          fromEmail,
          replyTo,
        });

        successfulSends = recipients.length;
      } catch (error) {
        const errorMsg = `Failed to create Sendy campaign: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        failedSends = recipients.length;
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
      message:
        sendMode === 'single'
          ? `Newsletter sent to ${email} successfully`
          : `Newsletter sent to ${successfulSends} subscribers${
              failedSends > 0 ? ` (${failedSends} failed)` : ''
            }`,
      subscribers: successfulSends,
      failed: failedSends,
      success: successfulSends > 0,
      mode: sendMode,
      email: sendMode === 'single' ? email : undefined,
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

/**
 * Pull a homepage card out of a sent newsletter's stored content.
 * Issues are a JSON array of sections (sometimes a JSON string), with
 * images on media items and the lead story in the first real heading.
 */

export interface IssueCardContent {
  imageUrl: string | null;
  leadHeading: string;
  excerpt: string;
}

interface StoryBlock {
  title: string;
  rawBody: string;
}

const EXCERPT_LIMIT = 280;

export function buildIssuePreview(content: unknown): IssueCardContent {
  const value = unwrapContent(content);

  if (Array.isArray(value)) {
    const images: string[] = [];
    const blocks: StoryBlock[] = [];
    for (const section of value) {
      collectSection(section, images, blocks);
    }
    const lead = chooseLead(blocks);
    return { imageUrl: images[0] ?? null, ...lead };
  }

  if (typeof value === 'string') {
    return previewFromHtml(value);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.sections)) {
      return buildIssuePreview(record.sections);
    }
  }

  return { imageUrl: null, leadHeading: '', excerpt: '' };
}

function unwrapContent(content: unknown): unknown {
  let value = content;
  for (let i = 0; i < 3 && typeof value === 'string'; i++) {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const looksStructured =
      trimmed.startsWith('[') ||
      trimmed.startsWith('{') ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'));
    if (!looksStructured) return trimmed;
    try {
      value = JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return value;
}

function collectSection(
  node: unknown,
  images: string[],
  blocks: StoryBlock[]
): void {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  const section = node as Record<string, unknown>;
  const title = typeof section.title === 'string' ? section.title : '';
  const content = typeof section.content === 'string' ? section.content : '';
  const afterList =
    typeof section.afterListContent === 'string' ? section.afterListContent : '';

  pushImagesFromText(title, images);
  pushImagesFromText(content, images);
  pushMediaImages(section.mediaItems, images);
  pushImagesFromText(afterList, images);

  if (title.trim() || content.trim() || afterList.trim()) {
    blocks.push({
      title,
      rawBody: [content, afterList].filter(Boolean).join('\n'),
    });
  }

  if (Array.isArray(section.subsections)) {
    for (const subsection of section.subsections) {
      collectSection(subsection, images, blocks);
    }
  }
}

function previewFromHtml(html: string): IssueCardContent {
  const images: string[] = [];
  pushImagesFromText(html, images);
  const headingMatch = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
  const heading = headingMatch ? toPlainText(headingMatch[1]) : '';
  const text = toPlainText(html);
  const excerptSource = heading && text.startsWith(heading)
    ? text.slice(heading.length).trim()
    : text;

  if (heading) {
    return {
      imageUrl: images[0] ?? null,
      leadHeading: heading,
      excerpt: distinctExcerpt(heading, excerptSource),
    };
  }

  return {
    imageUrl: images[0] ?? null,
    leadHeading: truncate(text, 180),
    excerpt: '',
  };
}

function chooseLead(blocks: StoryBlock[]): {
  leadHeading: string;
  excerpt: string;
} {
  let pendingLabel = '';

  for (const block of blocks) {
    if (isWelcome(block.title)) continue;

    const label = isSectionLabel(block.title) ? cleanLabel(block.title) : '';
    const storyTitle = label ? '' : cleanBullet(toPlainText(block.title));
    const story = splitStory(block.rawBody);

    if (label && !story.headline) {
      pendingLabel = label;
      continue;
    }

    if (label && story.headline) {
      return {
        leadHeading: label,
        excerpt: joinDistinct(story.headline, story.excerpt),
      };
    }

    if (storyTitle) {
      const excerpt = distinctExcerpt(storyTitle, story.excerpt || story.headline);
      return {
        leadHeading: pendingLabel || storyTitle,
        excerpt: pendingLabel ? joinDistinct(storyTitle, excerpt) : excerpt,
      };
    }

    if (story.headline) {
      return {
        leadHeading: pendingLabel || story.headline,
        excerpt: pendingLabel
          ? joinDistinct(story.headline, story.excerpt)
          : story.excerpt,
      };
    }
  }

  return { leadHeading: '', excerpt: '' };
}

function splitStory(raw: string): { headline: string; excerpt: string } {
  const bold = raw.match(/\*\*\s*([^*]+?)\s*\*\*/);
  if (bold) {
    const headline = cleanBullet(toPlainText(bold[1]));
    const rest = toPlainText(raw.replace(bold[0], ' '));
    return {
      headline,
      excerpt: distinctExcerpt(headline, rest),
    };
  }

  const text = cleanBullet(toPlainText(raw));
  if (!text) return { headline: '', excerpt: '' };

  const sentence = text.match(/^(.+?[.!?؟])\s+(\S[\s\S]+)$/);
  if (sentence && sentence[1].length <= 140) {
    return {
      headline: sentence[1].trim(),
      excerpt: truncate(sentence[2].trim()),
    };
  }

  return { headline: text, excerpt: '' };
}

function isWelcome(title: string): boolean {
  return /أهلًا بك|اهلا بك|العناوين التالية/.test(title);
}

function isSectionLabel(title: string): boolean {
  return /^\s*\d+\s*[.)\-:]/.test(title);
}

function cleanLabel(title: string): string {
  return cleanBullet(toPlainText(title)).replace(/^\d+\s*[.)\-:]+\s*/, '').trim();
}

function cleanBullet(text: string): string {
  return text.replace(/^[\s•·▪◦*\-–—]+/, '').trim();
}

function toPlainText(text: string): string {
  return text
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function distinctExcerpt(headline: string, excerpt: string): string {
  const cleanExcerpt = truncate(cleanBullet(excerpt));
  if (!cleanExcerpt || sameText(cleanExcerpt, headline)) return '';
  if (headline && cleanExcerpt.startsWith(headline)) {
    const rest = cleanExcerpt.slice(headline.length).trim();
    return rest && !sameText(rest, headline) ? rest : '';
  }
  return cleanExcerpt;
}

function joinDistinct(headline: string, excerpt: string): string {
  const head = cleanBullet(headline);
  const tail = distinctExcerpt(head, excerpt);
  if (!head) return truncate(tail);
  if (!tail) return truncate(head);
  return truncate(`${head} ${tail}`);
}

function sameText(a: string, b: string): boolean {
  const normalize = (value: string) =>
    value.replace(/[\s•·.,،؛:!?؟\-–—"'«»]/g, '').toLowerCase();
  return normalize(a) === normalize(b);
}

function truncate(text: string, limit = EXCERPT_LIMIT): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const slice = clean.slice(0, limit);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > limit * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[،,.…\s]+$/, '')}…`;
}

function pushMediaImages(mediaItems: unknown, images: string[]): void {
  if (!Array.isArray(mediaItems)) return;
  for (const item of mediaItems) {
    if (!item || typeof item !== 'object') continue;
    const media = item as { type?: unknown; url?: unknown };
    const type = typeof media.type === 'string' ? media.type.toLowerCase() : '';
    const url = typeof media.url === 'string' ? media.url : '';
    if (!url || type === 'video' || type === 'youtube' || type === 'link') continue;
    if (type === 'image' || looksLikeImage(url)) {
      const safe = safeHttpUrl(url);
      if (safe) images.push(safe);
    }
  }
}

function pushImagesFromText(text: string, images: string[]): void {
  if (!text) return;
  const htmlImg = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const markdownImg = /!\[[^\]]*]\(\s*<?([^)\s>]+)>?\s*\)/g;
  for (const match of text.matchAll(htmlImg)) {
    const safe = safeHttpUrl(match[1]);
    if (safe) images.push(safe);
  }
  for (const match of text.matchAll(markdownImg)) {
    const safe = safeHttpUrl(match[1]);
    if (safe) images.push(safe);
  }
}

function looksLikeImage(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(url);
}

function safeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('data:')) return null;
  try {
    const url = new URL(trimmed, 'https://solo4ai.com');
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

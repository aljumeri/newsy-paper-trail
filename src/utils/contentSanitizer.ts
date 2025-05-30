
import DOMPurify from 'dompurify';

/**
 * Security utility for sanitizing HTML content to prevent XSS attacks
 */
export const contentSanitizer = {
  /**
   * Sanitize HTML content for safe display
   */
  sanitizeHtml(content: string): string {
    if (!content) return '';
    
    // Configure DOMPurify for newsletter content
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'style'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false
    };
    
    return DOMPurify.sanitize(content, config);
  },

  /**
   * Sanitize text content (strip all HTML)
   */
  sanitizeText(content: string): string {
    if (!content) return '';
    
    return DOMPurify.sanitize(content, { 
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true 
    });
  },

  /**
   * Validate and sanitize email addresses
   */
  sanitizeEmail(email: string): string {
    if (!email) return '';
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Invalid email format');
    }
    
    // Additional security: prevent email injection
    if (cleanEmail.includes('\n') || cleanEmail.includes('\r') || 
        cleanEmail.includes('\t') || cleanEmail.includes('\0')) {
      throw new Error('Invalid characters in email');
    }
    
    return cleanEmail;
  },

  /**
   * Sanitize subject lines
   */
  sanitizeSubject(subject: string): string {
    if (!subject) return '';
    
    // Remove HTML and limit length
    const sanitized = this.sanitizeText(subject).trim();
    
    if (sanitized.length > 200) {
      throw new Error('Subject line too long');
    }
    
    return sanitized;
  }
};

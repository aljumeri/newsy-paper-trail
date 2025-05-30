
import { supabase } from "@/integrations/supabase/client";

/**
 * Secure admin utilities using the new role-based system
 */
export const adminUtils = {
  /**
   * Check if current user has admin role using the secure database function
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return false;

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: session.session.user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin status');
        return false;
      }

      return Boolean(data);
    } catch (error) {
      console.error('Error in admin check');
      return false;
    }
  },

  /**
   * Log security events for audit trail with sanitized data
   */
  async logSecurityEvent(
    action: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<void> {
    try {
      // Sanitize resource ID to prevent injection
      const sanitizedResourceId = resourceId ? 
        resourceId.replace(/[<>'"&]/g, '').substring(0, 255) : null;
      
      const { error } = await supabase.rpc('log_security_event', {
        _action: action,
        _resource_type: resourceType || null,
        _resource_id: sanitizedResourceId,
        _ip_address: null, // IP tracking handled server-side for privacy
        _user_agent: typeof navigator !== 'undefined' ? 
          navigator.userAgent.substring(0, 500) : null // Limit length
      });

      if (error) {
        console.error('Failed to log security event');
      }
    } catch (error) {
      console.error('Error logging security event');
    }
  },

  /**
   * Safely get current user with error handling
   */
  async getCurrentUser() {
    try {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session.session?.user || null;
    } catch (error) {
      console.error('Error getting current user');
      return null;
    }
  },

  /**
   * Validate and sanitize input data
   */
  validateInput: {
    email: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && email.length <= 254;
    },
    
    subject: (subject: string): boolean => {
      return subject.length > 0 && subject.length <= 200;
    },
    
    content: (content: string): boolean => {
      return content.length > 0 && content.length <= 50000; // Reasonable limit
    }
  }
};

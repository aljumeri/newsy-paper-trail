
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
        console.error('Error checking admin status:', error);
        return false;
      }

      return Boolean(data);
    } catch (error) {
      console.error('Error in admin check:', error);
      return false;
    }
  },

  /**
   * Log security events for audit trail
   */
  async logSecurityEvent(
    action: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        _action: action,
        _resource_type: resourceType || null,
        _resource_id: resourceId || null,
        _ip_address: null, // Could be enhanced to capture real IP
        _user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
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
      console.error('Error getting current user:', error);
      return null;
    }
  }
};

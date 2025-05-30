
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";
import { contentSanitizer } from "@/utils/contentSanitizer";

interface SubscriptionResult {
  success: boolean;
  message?: string;
  error?: Error | unknown;
}

/**
 * Enhanced subscription service with security enhancements
 */
export const subscriptionService = {
  /**
   * Subscribe a user to the newsletter with security enhancements
   */
  async subscribe(email: string): Promise<SubscriptionResult> {
    try {
      await adminUtils.logSecurityEvent('newsletter_subscription_attempt', 'subscriber');
      
      // Sanitize and validate email
      const sanitizedEmail = contentSanitizer.sanitizeEmail(email);
      
      // Try using the Edge Function first
      try {
        const { error, data } = await supabase.functions.invoke("add-subscriber", {
          body: { email: sanitizedEmail }
        });
        
        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }
        
        await adminUtils.logSecurityEvent('newsletter_subscription_success', 'subscriber', sanitizedEmail);
        
        return { 
          success: true, 
          message: "تم اشتراكك بنجاح في النشرة الإخبارية." 
        };
      } catch (edgeFunctionError) {
        console.error("Edge function failed, trying direct database access:", edgeFunctionError);
        
        // Fallback: Try direct database access
        const { data: existingSubscriber } = await supabase
          .from("subscribers")
          .select("*")
          .eq("email", sanitizedEmail)
          .maybeSingle();
          
        if (existingSubscriber) {
          return { 
            success: false, 
            message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين" 
          };
        }
        
        // Insert the new subscriber with enhanced security
        const { data, error } = await supabase
          .from("subscribers")
          .insert([{ 
            email: sanitizedEmail,
            created_at: new Date().toISOString(),
            vendor: typeof window !== 'undefined' ? window.location.origin : null
          }])
          .select();
          
        if (error) {
          console.error("Direct database subscription error:", error);
          await adminUtils.logSecurityEvent('newsletter_subscription_failed', 'subscriber', sanitizedEmail);
          
          if (error.message && error.message.includes('duplicate')) {
            return { 
              success: false, 
              message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين" 
            };
          }
          
          return { 
            success: false, 
            message: "حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى لاحقًا.", 
            error 
          };
        }
        
        await adminUtils.logSecurityEvent('newsletter_subscription_success', 'subscriber', sanitizedEmail);
        
        return { 
          success: true, 
          message: "تم اشتراكك بنجاح في النشرة الإخبارية." 
        };
      }
    } catch (error: unknown) {
      console.error("Subscription error:", error instanceof Error ? error.message : "Unknown error");
      await adminUtils.logSecurityEvent('newsletter_subscription_error', 'subscriber');
      
      if (error instanceof Error && error.message.includes('Invalid email')) {
        return { 
          success: false, 
          message: "صيغة البريد الإلكتروني غير صحيحة", 
          error 
        };
      }
      
      return { 
        success: false, 
        message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.", 
        error 
      };
    }
  }
};


import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";

interface SubscriptionResult {
  success: boolean;
  message?: string;
  error?: Error | unknown;
}

/**
 * Enhanced subscription service with security logging
 */
export const subscriptionService = {
  /**
   * Subscribe a user to the newsletter with security enhancements
   */
  async subscribe(email: string): Promise<SubscriptionResult> {
    try {
      console.log("Subscription service: Attempting to subscribe email:", email);
      
      // Log subscription attempt
      await adminUtils.logSecurityEvent('newsletter_subscription_attempt', 'subscriber', email);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: "صيغة البريد الإلكتروني غير صحيحة"
        };
      }
      
      // Try using the Edge Function first
      try {
        const { error, data } = await supabase.functions.invoke("add-subscriber", {
          body: { email }
        });
        
        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }
        
        console.log("Subscription successful via Edge Function:", data);
        await adminUtils.logSecurityEvent('newsletter_subscription_success', 'subscriber', email);
        
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
          .eq("email", email)
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
            email,
            created_at: new Date().toISOString(),
            vendor: typeof window !== 'undefined' ? window.location.origin : null
          }])
          .select();
          
        if (error) {
          console.error("Direct database subscription error:", error);
          await adminUtils.logSecurityEvent('newsletter_subscription_failed', 'subscriber', email);
          
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
        
        console.log("Subscription successful via direct database access:", data);
        await adminUtils.logSecurityEvent('newsletter_subscription_success', 'subscriber', email);
        
        return { 
          success: true, 
          message: "تم اشتراكك بنجاح في النشرة الإخبارية." 
        };
      }
    } catch (error: unknown) {
      console.error("Unhandled error during subscription:", error);
      await adminUtils.logSecurityEvent('newsletter_subscription_error', 'subscriber', email);
      
      return { 
        success: false, 
        message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.", 
        error 
      };
    }
  }
};

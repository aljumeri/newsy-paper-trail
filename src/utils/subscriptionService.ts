
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for handling newsletter subscription operations
 */
export const subscriptionService = {
  /**
   * Subscribe a user to the newsletter
   * @param email - The email address to subscribe
   * @returns Result object with success status and optional error message
   */
  async subscribe(email: string): Promise<{ success: boolean; message?: string; error?: any }> {
    try {
      console.log("Subscription service: Attempting to subscribe email:", email);
      
      // Try to insert the email into subscribers table using a direct insert approach
      const { error, data } = await supabase
        .from('subscribers')
        .insert({ email })
        .select();
      
      // Handle various error scenarios
      if (error) {
        console.error("Subscription error:", error);
        
        // Check for duplicate email error code
        if (error.code === '23505') {
          return { 
            success: false, 
            message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين" 
          };
        }
        
        // Return general error
        return { 
          success: false, 
          message: "حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى لاحقًا.", 
          error 
        };
      }
      
      // Successful subscription
      console.log("Subscription successful:", data);
      return { 
        success: true, 
        message: "تم اشتراكك بنجاح في النشرة الإخبارية." 
      };
    } catch (error) {
      console.error("Unhandled error during subscription:", error);
      return { 
        success: false, 
        message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.", 
        error 
      };
    }
  }
};

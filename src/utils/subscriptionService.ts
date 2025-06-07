
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionResult {
  success: boolean;
  message: string;
  error?: Error | unknown;
}

/**
 * Service for handling newsletter subscription operations
 */
export const subscriptionService = {
  /**
   * Subscribe a user to the newsletter
   * @param email - The email address to subscribe
   * @returns Result object with success status and message
   */
  async subscribe(email: string): Promise<SubscriptionResult> {
    try {
      console.log("Subscription service: Attempting to subscribe email:", email);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { 
          success: false, 
          message: "يرجى إدخال بريد إلكتروني صالح" 
        };
      }
      
      // Try using the Edge Function first
      try {
        console.log("Trying Edge Function first...");
        const { data, error } = await supabase.functions.invoke("add-subscriber", {
          body: { email }
        });
        
        if (error) {
          console.error("Edge function error:", error);
          throw error;
        }
        
        // Check the response from the Edge Function
        if (data && data.success === false) {
          return { 
            success: false, 
            message: data.message || "فشل في الاشتراك" 
          };
        }
        
        // Successful subscription via Edge Function
        console.log("Subscription successful via Edge Function:", data);
        return { 
          success: true, 
          message: data?.message || "تم اشتراكك بنجاح في النشرة الإخبارية." 
        };
        
      } catch (edgeFunctionError) {
        console.error("Edge function failed, trying direct database access:", edgeFunctionError);
        
        // Fallback: Try direct database access
        console.log("Trying direct database access...");
        
        // First check if email already exists
        const { data: existingSubscriber, error: checkError } = await supabase
          .from("subscribers")
          .select("email")
          .eq("email", email)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking existing subscriber:", checkError);
          return { 
            success: false, 
            message: "حدث خطأ أثناء التحقق من البريد الإلكتروني.", 
            error: checkError 
          };
        }
          
        if (existingSubscriber) {
          return { 
            success: false, 
            message: "البريد الإلكتروني موجود بالفعل في قائمة المشتركين" 
          };
        }
        
        // Insert the new subscriber
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
          
          // Handle duplicate key error
          if (error.code === '23505' || error.message?.includes('duplicate')) {
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
        
        // Successful subscription via direct database access
        console.log("Subscription successful via direct database access:", data);
        return { 
          success: true, 
          message: "تم اشتراكك بنجاح في النشرة الإخبارية." 
        };
      }
    } catch (error: unknown) {
      console.error("Unhandled error during subscription:", error);
      return { 
        success: false, 
        message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.", 
        error 
      };
    }
  }
};

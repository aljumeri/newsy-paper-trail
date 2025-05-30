import { supabase } from "@/integrations/supabase/client";

interface SubscriptionResult {
  success: boolean;
  message?: string;
  error?: Error | unknown;
}

/**
 * Service for handling newsletter subscription operations
 */
export const subscriptionService = {
  /**
   * Subscribe a user to the newsletter
   * @param email - The email address to subscribe
   * @returns Result object with success status and optional error message
   */
  async subscribe(email: string): Promise<SubscriptionResult> {
    try {
      console.log("Subscription service: Attempting to subscribe email:", email);
      
      // First try using the Edge Function
      try {
      const { error, data } = await supabase.functions.invoke("add-subscriber", {
        body: { email }
      });
      
      // Handle various error scenarios
      if (error) {
          console.error("Edge function error:", error);
          // Continue to fallback method
          throw error;
        }
        
        // Successful subscription via Edge Function
        console.log("Subscription successful via Edge Function:", data);
        return { 
          success: true, 
          message: "تم اشتراكك بنجاح في النشرة الإخبارية." 
        };
      } catch (edgeFunctionError) {
        console.error("Edge function failed, trying direct database access:", edgeFunctionError);
        
        // Fallback: Try direct database access
        // First check if email already exists
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

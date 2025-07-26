
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
      
      // Validate email format - more comprehensive regex
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { 
          success: false, 
          message: "يرجى إدخال بريد إلكتروني صالح" 
        };
      }
      
      // Use the Edge Function for subscription
      try {
        console.log("Trying Edge Function for subscription...");
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
        console.error("Edge function failed for subscription:", edgeFunctionError);
        return { 
          success: false, 
          message: "حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى لاحقًا.", 
          error: edgeFunctionError 
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
  },

  /**
   * Unsubscribe a user from the newsletter
   * @param email - The email address to unsubscribe
   * @returns Result object with success status and message
   */
  async unsubscribe(email: string): Promise<SubscriptionResult> {
    try {
      console.log("Subscription service: Attempting to unsubscribe email:", email);
      
      // Validate email format - more comprehensive regex
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { 
          success: false, 
          message: "يرجى إدخال بريد إلكتروني صالح" 
        };
      }
      
      // Use the Edge Function for unsubscribe
      try {
        console.log("Trying Edge Function for unsubscribe...");
        const { data, error } = await supabase.functions.invoke("unsubscribe", {
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
            message: data.message || "فشل في إلغاء الاشتراك" 
          };
        }
        
        // Successful unsubscription via Edge Function
        console.log("Unsubscription successful via Edge Function:", data);
        return { 
          success: true, 
          message: data?.message || "تم إلغاء الاشتراك بنجاح." 
        };
        
      } catch (edgeFunctionError) {
        console.error("Edge function failed for unsubscribe:", edgeFunctionError);
        return { 
          success: false, 
          message: "حدث خطأ أثناء إلغاء الاشتراك. يرجى المحاولة مرة أخرى لاحقًا.", 
          error: edgeFunctionError 
        };
      }
    } catch (error: unknown) {
      console.error("Unhandled error during unsubscription:", error);
      return { 
        success: false, 
        message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.", 
        error 
      };
    }
  }
};

/**
 * Send newsletter to a single email address
 * @param newsletterId - The ID of the newsletter to send
 * @param email - The email address to send to
 * @returns Promise with the result
 */
export const sendNewsletterToSingleEmail = async (newsletterId: string, email: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          newsletterId,
          mode: 'single',
          email,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send newsletter');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending newsletter to single email:', error);
    throw error;
  }
};

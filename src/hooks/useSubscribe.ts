
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const useSubscribe = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Improved email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال بريد إلكتروني صالح",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    console.log("Attempting to subscribe with email:", email);
    
    try {
      // Check the current authentication state and log it
      const { data: authData } = await supabase.auth.getSession();
      console.log("Current auth state:", authData.session ? "Authenticated" : "Not authenticated");

      // Log the supabase URL and key (masked) to verify configuration
      console.log("Supabase URL:", supabase.supabaseUrl);
      console.log("Supabase Key configured:", supabase.supabaseKey ? "Yes (masked)" : "No");
      
      // Add debug logs to see what's happening with the request
      console.log("Making subscription request to Supabase...");
      
      const { error, data, status, statusText } = await supabase
        .from('subscribers')
        .insert({ email })
        .select();
      
      console.log("Subscription response:", { 
        error, 
        data, 
        status, 
        statusText,
        hasError: !!error 
      });

      if (error) {
        if (error.code === '23505') {
          console.log("Duplicate email detected");
          toast({
            title: "البريد الإلكتروني موجود بالفعل",
            description: "أنت مشترك بالفعل في نشرتنا الإخبارية.",
            variant: "destructive"
          });
        } else {
          // Log more detailed error information
          console.error("Subscription error code:", error.code);
          console.error("Subscription error message:", error.message);
          console.error("Subscription error details:", JSON.stringify(error, null, 2));
          
          toast({
            title: "حدث خطأ",
            description: `يرجى المحاولة مرة أخرى لاحقًا. (${error.code || 'unknown'})`,
            variant: "destructive"
          });
        }
      } else {
        console.log("Subscription successful");
        toast({
          title: "تم بنجاح!",
          description: "لقد تم اشتراكك في نشرتنا الإخبارية.",
        });
        setEmail('');
      }
    } catch (error) {
      // More comprehensive error handling
      console.error("Unhandled error during subscription:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast({
        title: "حدث خطأ غير متوقع",
        description: "يرجى المحاولة مرة أخرى لاحقًا.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    isLoading,
    handleSubscribe
  };
};


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
      // Use unauthenticated insert to avoid RLS issues
      const { error, data, status } = await supabase
        .from('subscribers')
        .insert({ email })
        .select();
      
      console.log("Subscription response:", { 
        error, 
        data, 
        status,
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
        } else if (error.code === '42P17' || error.code === '42501') {
          console.log("Permission error detected - likely related to RLS policies");
          // Try an alternative approach - direct anonymous insert
          const { error: fallbackError } = await supabase
            .from('subscribers')
            .insert([{ email }]);
          
          if (fallbackError) {
            console.error("Fallback subscription attempt failed:", fallbackError);
            toast({
              title: "حدث خطأ",
              description: "يرجى المحاولة مرة أخرى لاحقًا.",
              variant: "destructive"
            });
          } else {
            // If no error from fallback, assume success
            toast({
              title: "تم بنجاح!",
              description: "لقد تم اشتراكك في نشرتنا الإخبارية.",
            });
            setEmail('');
          }
        } else {
          console.error("Subscription error code:", error.code);
          console.error("Subscription error message:", error.message);
          
          toast({
            title: "حدث خطأ",
            description: `يرجى المحاولة مرة أخرى لاحقًا.`,
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
      console.error("Unhandled error during subscription:", error);
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

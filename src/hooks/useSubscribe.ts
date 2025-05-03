
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
      // Direct insert without checking admin roles (which was causing the infinite recursion)
      const { error, data } = await supabase
        .from('subscribers')
        .insert({ email })
        .select();
      
      console.log("Subscription response:", { error, data });
      
      if (error) {
        console.error("Subscription error:", error);
        
        if (error.code === '23505') {
          toast({
            title: "البريد الإلكتروني موجود بالفعل",
            description: "أنت مشترك بالفعل في نشرتنا الإخبارية.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "حدث خطأ",
            description: "يرجى المحاولة مرة أخرى لاحقًا.",
            variant: "destructive"
          });
        }
      } else {
        console.log("Subscription successful!");
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

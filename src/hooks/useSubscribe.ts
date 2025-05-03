
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService } from '@/utils/subscriptionService';

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
    console.log("useSubscribe: Attempting to subscribe with email:", email);
    
    try {
      // Use the new subscription service
      const result = await subscriptionService.subscribe(email);
      
      if (result.success) {
        toast({
          title: "تم بنجاح!",
          description: result.message,
        });
        setEmail(''); // Clear email on success
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Subscription error in hook:", error);
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

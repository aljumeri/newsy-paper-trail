
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface ResetPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  setEmail
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Get the current site URL, preferring solo4ai.com if it's in the hostname
  const getSiteURL = () => {
    if (typeof window === 'undefined') return '';
    
    const hostname = window.location.hostname;
    if (hostname === 'solo4ai.com' || hostname.includes('solo4ai.com')) {
      return 'https://solo4ai.com/admin-control/reset-password';
    }
    
    // Fallback to current origin
    return `${window.location.origin}/admin-control/reset-password`;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const redirectURL = getSiteURL();
      console.log("Attempting password reset for:", email);
      console.log("Redirect URL:", redirectURL);
      
      // Add a small delay to ensure UI feedback
      setTimeout(async () => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectURL
          });
          
          if (error) throw error;
          
          toast({
            title: "تم إرسال رابط إعادة تعيين كلمة المرور",
            description: "يرجى التحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور",
          });
          
          console.log("Password reset email sent successfully");
        } catch (error: any) {
          console.error("Reset password error:", error);
          
          // Handle rate limiting errors more specifically
          if (error.message?.includes("security purposes") || error.message?.includes("rate limit")) {
            toast({
              title: "يرجى الانتظار قليلاً",
              description: "لأسباب أمنية، يمكنك طلب إعادة تعيين كلمة المرور مرة واحدة كل 10 ثوان",
              variant: "destructive"
            });
          } else {
            toast({
              title: "خطأ في إرسال رابط إعادة التعيين",
              description: error.message,
              variant: "destructive"
            });
          }
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "خطأ في إرسال رابط إعادة التعيين",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="reset-email" className="block text-sm font-medium">البريد الإلكتروني</label>
        <Input
          id="reset-email"
          type="email"
          placeholder="your-email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? "جارِ إرسال الرابط..." : "إرسال رابط إعادة تعيين كلمة المرور"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;

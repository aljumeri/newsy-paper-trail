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
  
  // Get the correct reset password URL based on the current hostname
  const getResetPasswordURL = () => {
    if (typeof window === 'undefined') return '';
    
    // Use the current origin directly - this makes it work on any domain
    const origin = window.location.origin;
    const resetUrl = `${origin}/admin-control/reset-password`;
    console.log(`Reset password URL: ${resetUrl}`);
    return resetUrl;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const resetURL = getResetPasswordURL();
      console.log("Attempting password reset for:", email);
      console.log("Reset password URL:", resetURL);
      
      // Add a small delay to ensure UI feedback
      setTimeout(async () => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: resetURL
          });
          
          if (error) throw error;
          
          toast({
            title: "تم إرسال رابط إعادة تعيين كلمة المرور",
            description: "يرجى التحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور",
          });
          
          console.log("Password reset email sent successfully");
        } catch (error: unknown) {
          console.error("Reset password error:", error);
          
          // Handle rate limiting errors more specifically
          const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إرسال رابط إعادة التعيين";
          
          if (errorMessage.includes("security purposes") || errorMessage.includes("rate limit")) {
            toast({
              title: "يرجى الانتظار قليلاً",
              description: "لأسباب أمنية، يمكنك طلب إعادة تعيين كلمة المرور مرة واحدة كل 10 ثوان",
              variant: "destructive"
            });
          } else {
            toast({
              title: "خطأ في إرسال رابط إعادة التعيين",
              description: errorMessage,
              variant: "destructive"
            });
          }
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إرسال رابط إعادة التعيين";
      toast({
        title: "خطأ في إرسال رابط إعادة التعيين",
        description: errorMessage,
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

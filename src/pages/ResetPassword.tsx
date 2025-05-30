
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminUtils } from '@/utils/adminUtils';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetCodeVerified, setResetCodeVerified] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for the code in the URL with enhanced security
  useEffect(() => {
    const handleResetCode = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      const errorDesc = searchParams.get('error_description');
      
      console.log("ResetPassword: URL parameters detected");
      await adminUtils.logSecurityEvent('password_reset_attempt');
      
      // Handle errors from the URL
      if (errorDesc) {
        setErrorMessage(decodeURIComponent(errorDesc));
        setShowErrorDialog(true);
        setVerificationInProgress(false);
        await adminUtils.logSecurityEvent('password_reset_failed', 'reset_code', 'invalid_url');
        return;
      }
      
      // If there's no reset code, show error
      if (!code || type !== 'recovery') {
        console.error("Missing or invalid reset code in URL parameters");
        setErrorMessage("رابط إعادة تعيين كلمة المرور غير مكتمل. يرجى طلب رابط جديد.");
        setShowErrorDialog(true);
        setVerificationInProgress(false);
        await adminUtils.logSecurityEvent('password_reset_failed', 'reset_code', 'missing_code');
        return;
      }
      
      try {
        console.log("Verifying password reset code");
        
        // Try to verify the OTP token with enhanced validation
        const { error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'recovery'
        });
        
        if (error) {
          console.error("Error verifying reset code:", error);
          await adminUtils.logSecurityEvent('password_reset_failed', 'reset_code', 'verification_failed');
          
          // More descriptive error message based on error type
          let errorMsg = "رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.";
          if (error.message.includes("expired")) {
            errorMsg = "انتهت صلاحية رابط إعادة تعيين كلمة المرور. يرجى طلب رابط جديد.";
          } else if (error.message.includes("too_many_requests")) {
            errorMsg = "تم تجاوز عدد المحاولات المسموح. يرجى المحاولة لاحقًا.";
            setRateLimitExceeded(true);
          }
          
          setErrorMessage(errorMsg);
          setShowErrorDialog(true);
          setVerificationInProgress(false);
          return;
        }
        
        console.log("Reset code verified successfully");
        await adminUtils.logSecurityEvent('password_reset_verified', 'reset_code', 'success');
        setResetCodeVerified(true);
        setVerificationInProgress(false);
      } catch (error: unknown) {
        console.error("Exception during reset code verification:", error);
        await adminUtils.logSecurityEvent('password_reset_error', 'reset_code', 'exception');
        const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء التحقق من رابط إعادة التعيين";
        setErrorMessage(errorMessage);
        setShowErrorDialog(true);
        setVerificationInProgress(false);
      }
    };
    
    handleResetCode();
  }, [location.search]);

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced password validation
    if (password !== confirmPassword) {
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "يرجى التأكد من تطابق كلمتي المرور",
        variant: "destructive"
      });
      return;
    }
    
    // Stronger password requirements
    if (password.length < 8) {
      toast({
        title: "كلمة المرور ضعيفة",
        description: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }
    
    // Check for common password patterns
    const commonPatterns = ['password', '123456', 'qwerty', 'admin'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      toast({
        title: "كلمة المرور ضعيفة",
        description: "يرجى اختيار كلمة مرور أكثر أمانًا",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await adminUtils.logSecurityEvent('password_update_attempt');
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        await adminUtils.logSecurityEvent('password_update_failed', 'user', error.message);
        throw error;
      }
      
      await adminUtils.logSecurityEvent('password_update_success');
      
      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تغيير كلمة المرور الخاصة بك بنجاح.",
      });
      
      // Redirect to admin panel after successful password reset
      setTimeout(() => {
        navigate('/admin-control');
      }, 1500);
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحديث كلمة المرور.";
      toast({
        title: "خطأ في تحديث كلمة المرور",
        description: "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
    navigate('/admin-control');
  };
  
  // Show loading state while verifying reset code
  if (verificationInProgress) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                جارٍ التحقق من الرابط
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                يرجى الانتظار قليلاً...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error dialog if verification failed
  if (showErrorDialog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                خطأ في إعادة تعيين كلمة المرور
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {errorMessage}
              </p>
              {rateLimitExceeded && (
                <p className="mt-2 text-center text-xs text-red-600">
                  لأمان حسابك، تم تقييد عدد محاولات إعادة تعيين كلمة المرور
                </p>
              )}
            </div>
            <div className="flex justify-center">
              <Button onClick={handleCloseErrorDialog}>
                العودة إلى صفحة تسجيل الدخول
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show password reset form if the reset code was verified successfully
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              إعادة تعيين كلمة المرور
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              الرجاء إدخال كلمة المرور الجديدة (8 أحرف على الأقل)
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSetNewPassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور الجديدة
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور
                </label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="تأكيد كلمة المرور الجديدة"
                />
              </div>
            </div>
              
            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? "جارِ تحديث كلمة المرور..." : "تحديث كلمة المرور"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;

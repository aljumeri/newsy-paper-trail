
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetCodeVerified, setResetCodeVerified] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for the code in the URL
  useEffect(() => {
    const handleResetCode = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      const errorDesc = searchParams.get('error_description');
      
      console.log("ResetPassword: URL parameters detected", {
        code: code ? "present" : "not present",
        type: type || "none",
        error: errorDesc || "none"
      });
      
      // Handle errors from the URL
      if (errorDesc) {
        setErrorMessage(errorDesc);
        setShowErrorDialog(true);
        setVerificationInProgress(false);
        return;
      }
      
      // If there's a reset code, try to verify it
      if (code && type === 'recovery') {
        try {
          console.log("Verifying password reset code");
          const { error } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'recovery'
          });
          
          if (error) {
            console.error("Error verifying reset code:", error);
            setErrorMessage("رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.");
            setShowErrorDialog(true);
            setVerificationInProgress(false);
            return;
          }
          
          console.log("Reset code verified successfully");
          setResetCodeVerified(true);
          setVerificationInProgress(false);
        } catch (error: any) {
          console.error("Exception during reset code verification:", error);
          setErrorMessage(error.message || "حدث خطأ أثناء التحقق من رابط إعادة التعيين");
          setShowErrorDialog(true);
          setVerificationInProgress(false);
        }
      } else if (!code || !type) {
        // No reset code or type in URL
        console.error("Missing reset code or type in URL parameters");
        setErrorMessage("رابط إعادة تعيين كلمة المرور غير مكتمل. يرجى طلب رابط جديد.");
        setShowErrorDialog(true);
        setVerificationInProgress(false);
      }
    };
    
    handleResetCode();
  }, [location.search]);

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "يرجى التأكد من تطابق كلمتي المرور",
        variant: "destructive"
      });
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      toast({
        title: "كلمة المرور قصيرة جدًا",
        description: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تغيير كلمة المرور الخاصة بك بنجاح.",
      });
      
      // Redirect to admin panel after successful password reset
      setTimeout(() => {
        navigate('/admin-control/panel');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "خطأ في تحديث كلمة المرور",
        description: error.message || "حدث خطأ أثناء تحديث كلمة المرور.",
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">إعادة تعيين كلمة المرور</h1>
            <p className="text-gray-500">أدخل كلمة المرور الجديدة الخاصة بك</p>
          </div>
          
          {verificationInProgress ? (
            <div className="py-8 text-center">
              <div className="animate-pulse flex justify-center">
                <div className="h-6 w-32 bg-gray-300 rounded"></div>
              </div>
              <p className="mt-4 text-gray-500">جارِ التحقق من رمز إعادة التعيين...</p>
            </div>
          ) : resetCodeVerified ? (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-sm font-medium">كلمة المرور الجديدة</label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*****"
                  required
                  className="w-full"
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-sm font-medium">تأكيد كلمة المرور</label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="*****"
                  required
                  className="w-full"
                  minLength={6}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
            </form>
          ) : (
            <div className="py-4 text-center">
              <p className="text-red-500 mb-4">خطأ في رمز إعادة التعيين</p>
              <Button
                onClick={() => navigate('/admin-control')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                العودة إلى صفحة تسجيل الدخول
              </Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">رمز إعادة تعيين غير صالح</DialogTitle>
            <DialogDescription className="text-center">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={handleCloseErrorDialog}>
              العودة إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;

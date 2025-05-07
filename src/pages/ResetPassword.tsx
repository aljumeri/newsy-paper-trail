
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetCodeVerified, setResetCodeVerified] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for the code in the URL
  useEffect(() => {
    const handleResetCode = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const errorDesc = searchParams.get('error_description');
      
      console.log("ResetPassword: URL parameters detected", {
        code: code ? "present" : "not present",
        error: errorDesc || "none"
      });
      
      // Handle errors from the URL
      if (errorDesc) {
        toast({
          title: "خطأ في إعادة تعيين كلمة المرور",
          description: errorDesc,
          variant: "destructive"
        });
        navigate('/admin-control', { replace: true });
        return;
      }
      
      // If there's a reset code, try to verify it
      if (code) {
        try {
          console.log("Verifying password reset code");
          const { error } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'recovery'
          });
          
          if (error) {
            console.error("Error verifying reset code:", error);
            toast({
              title: "رمز إعادة تعيين غير صالح",
              description: "رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.",
              variant: "destructive"
            });
            navigate('/admin-control', { replace: true });
            return;
          }
          
          console.log("Reset code verified successfully");
          setResetCodeVerified(true);
        } catch (error: any) {
          console.error("Exception during reset code verification:", error);
          toast({
            title: "خطأ في التحقق من رمز إعادة التعيين",
            description: error.message || "حدث خطأ أثناء التحقق من رابط إعادة التعيين",
            variant: "destructive"
          });
          navigate('/admin-control', { replace: true });
        }
      }
    };
    
    handleResetCode();
  }, [location.search, toast, navigate]);

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">إعادة تعيين كلمة المرور</h1>
            <p className="text-gray-500">أدخل كلمة المرور الجديدة الخاصة بك</p>
          </div>
          
          {resetCodeVerified ? (
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
              <div className="animate-pulse flex justify-center">
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
              <p className="mt-4 text-gray-500">جارِ التحقق من رمز إعادة التعيين...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;


import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle password reset errors from URL params
  useEffect(() => {
    const url = new URL(window.location.href);
    const errorDescription = url.searchParams.get('error_description');
    
    if (errorDescription) {
      toast({
        title: "خطأ في إعادة تعيين كلمة المرور",
        description: errorDescription,
        variant: "destructive"
      });
      
      // Clear error params from URL to prevent showing the error toast repeatedly
      navigate('/admin-control/reset-password', { replace: true });
    }
  }, [toast, navigate]);
  
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;

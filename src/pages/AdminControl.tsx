
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthTabs from '@/components/admin/AuthTabs';
import { adminUtils } from '@/utils/adminUtils';

const AdminControl = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("AdminControl: Checking for existing session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          console.log("AdminControl: Session found for user:", data.session.user.email);
          
          // Check admin status using secure function
          const isAdminUser = await adminUtils.isCurrentUserAdmin();
          
          if (isAdminUser) {
            console.log("AdminControl: User is admin, redirecting to panel");
            navigate('/admin-control/panel');
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    
    checkSession();
  }, [navigate]);

  // Handle login with enhanced security
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      console.log("AdminControl: Attempting login with email:", email);
      await adminUtils.logSecurityEvent('admin_login_attempt', 'user', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        await adminUtils.logSecurityEvent('admin_login_failed', 'user', email);
        
        // Sanitize error messages for security
        if (error.message.includes('Invalid login credentials')) {
          setAuthError("بيانات تسجيل الدخول غير صحيحة");
        } else {
          setAuthError("حدث خطأ أثناء تسجيل الدخول");
        }
        setIsLoading(false);
        return;
      }
      
      if (data.user) {
        console.log("AdminControl: Login successful");
        
        // Check admin status using secure function
        const isAdminUser = await adminUtils.isCurrentUserAdmin();
        
        if (isAdminUser) {
          await adminUtils.logSecurityEvent('admin_login_success', 'user', email);
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: `مرحبًا بك ${data.user.email}`,
          });
          navigate('/admin-control/panel');
        } else {
          console.log("AdminControl: User is not admin");
          await adminUtils.logSecurityEvent('admin_access_denied', 'user', email);
          await supabase.auth.signOut();
          toast({
            title: "صلاحيات غير كافية",
            description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      }
    } catch (error: unknown) {
      console.error("Unexpected login error:", error);
      await adminUtils.logSecurityEvent('admin_login_error', 'user', email);
      setAuthError("حدث خطأ أثناء تسجيل الدخول");
      setIsLoading(false);
    }
  };

  // Handle register with enhanced security
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      console.log("AdminControl: Attempting registration with email:", email);
      await adminUtils.logSecurityEvent('admin_register_attempt', 'user', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        console.error("Registration error:", error);
        await adminUtils.logSecurityEvent('admin_register_failed', 'user', email);
        setAuthError("حدث خطأ أثناء إنشاء الحساب");
        setIsLoading(false);
        return;
      }
      
      await adminUtils.logSecurityEvent('admin_register_success', 'user', email);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني.",
      });
      
      if (data.session === null && data.user) {
        toast({
          title: "التحقق من البريد الإلكتروني مطلوب",
          description: "يرجى التحقق من بريدك الإلكتروني لإكمال عملية التسجيل."
        });
        setIsLoading(false);
      } else if (data.session) {
        // Check admin status using secure function
        const isAdminUser = await adminUtils.isCurrentUserAdmin();
        
        if (isAdminUser) {
          navigate('/admin-control/panel');
        } else {
          await supabase.auth.signOut();
          toast({
            title: "صلاحيات غير كافية",
            description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      }
    } catch (error: unknown) {
      console.error("Unexpected registration error:", error);
      await adminUtils.logSecurityEvent('admin_register_error', 'user', email);
      setAuthError("حدث خطأ أثناء إنشاء الحساب");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">لوحة تحكم المسؤول</h1>
            <p className="text-gray-500">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
          </div>
          
          <AuthTabs
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            isLoading={isLoading}
            authError={authError}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminControl;

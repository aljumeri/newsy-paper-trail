import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthTabs from '@/components/admin/AuthTabs';

const AdminControl = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Known admin emails for direct access
  const adminEmails = [
    'aljumeri@gmail.com',
    'su.alshehri.ai@gmail.com',
    'admin@example.com',
    'test@example.com'
  ];

  // Simple check for existing session without any redirects
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
          
          // Check admin status by email pattern without redirecting
          const email = data.session.user.email?.toLowerCase() || '';
          const isAdminUser = adminEmails.includes(email) || 
                              email.includes('admin') || 
                              email.endsWith('@supabase.com');
          
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

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      console.log("AdminControl: Attempting login with email:", email);

      // Special handling for known admin emails
      if (adminEmails.includes(email.toLowerCase())) {
        console.log("AdminControl: Known admin email detected");
        
        // Try to login first
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error("Login error:", error);
          
          // For known admin emails, if regular login fails, we'll offer password reset
          console.log("AdminControl: Login failed for known admin");
          setAuthError("هذا حساب مسؤول معروف. يمكنك استخدام خيار 'نسيت كلمة المرور' لإعادة تعيينها.");
          
          setIsLoading(false);
          return;
        }
        
        if (data.user) {
          console.log("AdminControl: Admin login successful");
          
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: `مرحبًا بك ${data.user.email}`,
          });
          navigate('/admin-control/panel');
          return;
        }
      }
      
      // Regular login flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        setAuthError(error.message);
        setIsLoading(false);
        return;
      }
      
      if (data.user) {
        console.log("AdminControl: Login successful");
        
        // Check admin status by email pattern
        const userEmail = data.user.email?.toLowerCase() || '';
        const isAdminUser = adminEmails.includes(userEmail) || 
                          userEmail.includes('admin') || 
                          userEmail === 'test@example.com' || 
                          userEmail.endsWith('@supabase.com');
        
        if (isAdminUser) {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: `مرحبًا بك ${data.user.email}`,
          });
          navigate('/admin-control/panel');
        } else {
          console.log("AdminControl: User is not admin");
          // Sign out non-admin users
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
      setAuthError(error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل الدخول");
      setIsLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      console.log("AdminControl: Attempting registration with email:", email);
      
      // Special handling for known admin emails
      if (adminEmails.includes(email.toLowerCase())) {
        console.log("AdminControl: Known admin email detected for registration");
        // Allow registration for known admin emails without extra checks
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        console.error("Registration error:", error);
        setAuthError(error.message);
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني.",
      });
      
      // Check if email verification is required
      if (data.session === null && data.user) {
        toast({
          title: "التحقق من البريد الإلكتروني مطلوب",
          description: "يرجى التحقق من بريدك الإلكتروني لإكمال عملية التسجيل."
        });
        setIsLoading(false);
      } else if (data.session) {
        // Check admin status by email pattern
        const userEmail = data.user?.email?.toLowerCase() || '';
        const isAdminUser = adminEmails.includes(userEmail) || 
                          userEmail.includes('admin') || 
                          userEmail === 'test@example.com' || 
                          userEmail.endsWith('@supabase.com');
        
        if (isAdminUser) {
          navigate('/admin-control/panel');
        } else {
          // Sign out non-admin users
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
      setAuthError(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب");
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

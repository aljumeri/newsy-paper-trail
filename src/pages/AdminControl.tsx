
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthTabs from '@/components/admin/AuthTabs';
import AuthLoadingState from '@/components/admin/AuthLoadingState';

const AdminControl = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("AdminControl: Checking for existing session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setCheckingSession(false);
          return;
        }
        
        if (data.session) {
          console.log("AdminControl: Session found for user:", data.session.user.email);
          
          // Check admin status by email pattern
          const email = data.session.user.email?.toLowerCase() || '';
          const isAdminUser = email.includes('admin') || 
                              email === 'test@example.com' || 
                              email.endsWith('@supabase.com');
          
          if (isAdminUser) {
            console.log("AdminControl: User is admin, redirecting to panel");
            navigate('/admin-control/panel');
            return;
          } else {
            console.log("AdminControl: User is not admin");
            // Sign out non-admin users
            await supabase.auth.signOut();
            toast({
              title: "صلاحيات غير كافية",
              description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
              variant: "destructive"
            });
          }
        }
        
        setCheckingSession(false);
      } catch (err) {
        console.error("Error checking session:", err);
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      console.log("AdminControl: Attempting login with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        setAuthError(error.message);
        return;
      }
      
      if (data.user) {
        console.log("AdminControl: Login successful");
        
        // Check admin status by email pattern
        const userEmail = data.user.email?.toLowerCase() || '';
        const isAdminUser = userEmail.includes('admin') || 
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
        }
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setAuthError(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        console.error("Registration error:", error);
        setAuthError(error.message);
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
      } else if (data.session) {
        // Check admin status by email pattern
        const userEmail = data.user?.email?.toLowerCase() || '';
        const isAdminUser = userEmail.includes('admin') || 
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
        }
      }
    } catch (error: any) {
      console.error("Unexpected registration error:", error);
      setAuthError(error.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return <AuthLoadingState />;
  }

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

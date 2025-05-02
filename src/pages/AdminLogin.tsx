
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthTabs from '@/components/admin/AuthTabs';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Enhanced session check
  useEffect(() => {
    console.log("AdminLogin: Component mounted, checking session...");
    
    const checkSession = async () => {
      try {
        console.log("AdminLogin: Starting session check");
        setIsPageLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsPageLoading(false);
          return;
        }
        
        console.log("AdminLogin: Session data:", data);
        
        if (data.session) {
          console.log("AdminLogin: Valid session found, navigating to dashboard");
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log("AdminLogin: No active session found");
          setIsPageLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setIsPageLoading(false);
      }
    };
    
    // Run session check immediately
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in AdminLogin:", event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, navigating to dashboard");
        navigate('/admin/dashboard', { replace: true });
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log("AdminLogin: Component unmounting, cleaning up subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك!"
      });
      
      // Force navigation to dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message || "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting registration with:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      console.log("Registration successful:", data);
      
      if (data.user) {
        // Immediately sign in after registration
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (!signInError && signInData.session) {
            toast({
              title: "تم التسجيل والدخول بنجاح",
              description: "تم إنشاء حساب المسؤول الخاص بك وتسجيل الدخول."
            });
            navigate('/admin/dashboard', { replace: true });
          } else {
            toast({
              title: "تم التسجيل بنجاح",
              description: "يرجى التحقق من بريدك الإلكتروني للتأكيد ثم تسجيل الدخول."
            });
            setIsLoading(false);
          }
        } catch (signInErr) {
          console.error("Auto-login error:", signInErr);
          toast({
            title: "تم التسجيل بنجاح",
            description: "يرجى التحقق من بريدك الإلكتروني للتأكيد ثم تسجيل الدخول."
          });
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.");
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <p className="text-lg">جارٍ التحميل...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">منطقة المسؤول</CardTitle>
            <CardDescription>قم بتسجيل الدخول أو أنشئ حساب مسؤول جديد</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;

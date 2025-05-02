
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthTabs from '@/components/admin/AuthTabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const { toast } = useToast();
  
  // Simple direct session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("AdminLogin: Checking for active session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsSessionLoading(false);
          return;
        }
        
        if (data.session) {
          console.log("AdminLogin: Session found, redirecting to dashboard");
          window.location.href = '/admin/dashboard';
          return;
        }
        
        console.log("AdminLogin: No session found");
        setIsSessionLoading(false);
      } catch (error) {
        console.error("AdminLogin: Session check failed:", error);
        setIsSessionLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Handle login submission
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
        description: "جاري توجيهك إلى لوحة التحكم..."
      });
      
      // Direct navigation approach
      window.location.href = '/admin/dashboard';
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

  // Handle registration submission
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
          emailRedirectTo: window.location.origin + '/admin/dashboard'
        }
      });
      
      if (error) throw error;
      
      console.log("Registration successful:", data);
      toast({
        title: "تم التسجيل بنجاح",
        description: "جاري محاولة تسجيل الدخول التلقائي..."
      });
      
      // Try immediate sign in after registration
      try {
        console.log("Attempting automatic login after registration");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error("Auto-login error:", signInError);
          toast({
            title: "تم التسجيل بنجاح",
            description: "يرجى تسجيل الدخول الآن.",
          });
          return;
        }
        
        console.log("Auto-login successful, redirecting to dashboard");
        toast({
          title: "تم التسجيل والدخول بنجاح",
          description: "جاري توجيهك إلى لوحة التحكم..."
        });
        
        // Direct navigation after successful login
        window.location.href = '/admin/dashboard';
      } catch (signInErr) {
        console.error("Auto-login error:", signInErr);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.");
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        {isSessionLoading ? (
          <div className="text-center p-4">
            <p className="text-lg">جارٍ التحميل...</p>
          </div>
        ) : (
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;

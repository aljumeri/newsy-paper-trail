
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
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Enhanced session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session status...");
        const { data } = await supabase.auth.getSession();
        console.log("Session data:", data);
        
        if (data.session) {
          console.log("Valid session found, navigating to dashboard");
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    checkSession();
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
        // Manually add user to admin_users table
        console.log("Adding user to admin_users table:", data.user.id);
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert([{ id: data.user.id }]);
          
        if (insertError) {
          console.error("Error adding to admin_users:", insertError);
        }
        
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
          }
        } catch (signInErr) {
          console.error("Auto-login error:", signInErr);
          toast({
            title: "تم التسجيل بنجاح",
            description: "يرجى التحقق من بريدك الإلكتروني للتأكيد ثم تسجيل الدخول."
          });
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
    } finally {
      setIsLoading(false);
    }
  };

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

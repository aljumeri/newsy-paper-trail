
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import AuthErrorAlert from '@/components/admin/AuthErrorAlert';
import AuthLoadingState from '@/components/admin/AuthLoadingState';
import LoginForm from '@/components/admin/LoginForm';
import RegisterForm from '@/components/admin/RegisterForm';
import AuthSessionChecker from '@/components/admin/AuthSessionChecker';

const AdminControl = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('login');
  const [sessionCheckCompleted, setSessionCheckCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const domainName = window.location.hostname;

  console.log("AdminControl: Rendering with domain:", domainName);
  console.log("AdminControl: Current URL:", window.location.href);

  const handleSessionCheckComplete = () => {
    console.log("Session check completed");
    setSessionCheckCompleted(true);
    setIsSessionChecking(false);
  };

  // Log the domain for debugging
  useEffect(() => {
    console.log("AdminControl: Domain check");
    console.log("Current domain:", domainName);
    console.log("Current pathname:", window.location.pathname);
    console.log("Current URL:", window.location.href);
  }, [domainName]);

  // Set up auth state change listener once
  useEffect(() => {
    console.log("AdminControl: Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AdminControl: Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("AdminControl: User signed in, navigating to control panel");
          navigate('/admin-control/panel', { replace: true });
        }
      }
    );
    
    return () => {
      console.log("AdminControl: Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log("AdminControl: Attempting login with:", email);
      console.log("AdminControl: On domain:", domainName);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك!"
      });
      
      console.log("AdminControl: Login successful, navigating to panel");
      navigate('/admin-control/panel', { replace: true });
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
      console.log("AdminControl: Attempting registration with:", email);
      console.log("AdminControl: On domain:", domainName);
      
      // Use the current domain for redirect
      const redirectTo = `${window.location.origin}/admin-control/panel`;
      console.log("AdminControl: Redirect URL set to:", redirectTo);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        }
      });
      
      if (error) {
        // Special handling for "User already registered" error
        if (error.message.includes("registered")) {
          console.log("AdminControl: User already registered, attempting to sign in instead");
          toast({
            title: "المستخدم مسجل بالفعل",
            description: "سنحاول تسجيل الدخول تلقائيًا"
          });
          
          // Try to sign in with the provided credentials
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            throw {
              message: "المستخدم مسجل بالفعل، ولكن كلمة المرور غير صحيحة. يرجى استخدام تسجيل الدخول."
            };
          }
          
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "تم تسجيل الدخول بحساب موجود مسبقًا"
          });
          
          navigate('/admin-control/panel', { replace: true });
          return;
        } else {
          throw error;
        }
      }
      
      console.log("AdminControl: Registration successful:", data);
      
      toast({
        title: "تم التسجيل بنجاح",
        description: "يرجى تسجيل الدخول الآن."
      });
      
      // Try immediate sign in after registration
      try {
        console.log("AdminControl: Attempting automatic login after registration");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!signInError) {
          console.log("AdminControl: Auto-login successful, redirecting to dashboard");
          toast({
            title: "تم التسجيل والدخول بنجاح",
            description: "تم إنشاء حساب المسؤول الخاص بك وتسجيل الدخول."
          });
          
          navigate('/admin-control/panel', { replace: true });
        }
      } catch (signInErr) {
        console.error("AdminControl: Auto-login error:", signInErr);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.");
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      
      // Switch to login tab if the user already exists
      if (error.message.includes("registered")) {
        setActiveTab('login');
      }
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
            <CardTitle className="text-2xl">لوحة التحكم</CardTitle>
            <CardDescription>قم بتسجيل الدخول أو أنشئ حساب مسؤول جديد</CardDescription>
            <CardDescription className="mt-2 text-blue-600 font-bold">الموقع الحالي: {domainName}</CardDescription>
          </CardHeader>
          <CardContent>
            {!sessionCheckCompleted ? (
              <AuthSessionChecker onSessionCheckComplete={handleSessionCheckComplete} />
            ) : (
              <>
                <AuthErrorAlert error={authError} />
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                    <TabsTrigger value="register">إنشاء حساب جديد</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <LoginForm 
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      onSubmit={handleLogin}
                      isLoading={isLoading}
                    />
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <RegisterForm
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      onSubmit={handleRegister}
                      isLoading={isLoading}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminControl;

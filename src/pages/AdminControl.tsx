
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import AuthErrorAlert from '@/components/admin/AuthErrorAlert';
import AuthLoadingState from '@/components/admin/AuthLoadingState';
import LoginForm from '@/components/admin/LoginForm';
import RegisterForm from '@/components/admin/RegisterForm';

const AdminControl = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionCheckComplete = useRef(false);
  const domainName = window.location.hostname;

  // Log the domain for debugging
  useEffect(() => {
    console.log("Current domain:", domainName);
    console.log("Current pathname:", window.location.pathname);
    console.log("Current URL:", window.location.href);
  }, [domainName]);

  // Check for existing session - only once
  useEffect(() => {
    // Skip if already checked to prevent multiple checks
    if (sessionCheckComplete.current) return;
    
    const checkSession = async () => {
      try {
        console.log("Checking session once...");
        sessionCheckComplete.current = true;
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsSessionChecking(false);
          return;
        }
        
        if (data.session) {
          console.log("Valid session found, navigating to control panel");
          navigate('/admin-control/panel', { replace: true });
        } else {
          setIsSessionChecking(false);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setIsSessionChecking(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  // Set up auth state change listener once
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, navigating to control panel");
          navigate('/admin-control/panel', { replace: true });
        }
      }
    );
    
    return () => {
      console.log("Cleaning up auth listener");
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
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك!"
      });
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
          emailRedirectTo: window.location.origin + '/admin-control/panel',
        }
      });
      
      if (error) {
        // Special handling for "User already registered" error
        if (error.message.includes("registered")) {
          console.log("User already registered, attempting to sign in instead");
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
          return;
        } else {
          throw error;
        }
      }
      
      console.log("Registration successful:", data);
      
      toast({
        title: "تم التسجيل بنجاح",
        description: "يرجى تسجيل الدخول الآن."
      });
      
      // Try immediate sign in after registration
      try {
        console.log("Attempting automatic login after registration");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!signInError) {
          console.log("Auto-login successful, redirecting to dashboard");
          toast({
            title: "تم التسجيل والدخول بنجاح",
            description: "تم إنشاء حساب المسؤول الخاص بك وتسجيل الدخول."
          });
        }
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
      
      // Switch to login tab if the user already exists
      if (error.message.includes("registered")) {
        setActiveTab('login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionChecking) {
    return <AuthLoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">لوحة التحكم</CardTitle>
            <CardDescription>قم بتسجيل الدخول أو أنشئ حساب مسؤول جديد</CardDescription>
            <CardDescription className="mt-2 text-blue-600">الموقع الحالي: {domainName}</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminControl;

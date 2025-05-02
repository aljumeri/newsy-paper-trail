
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import LoginForm from '@/components/admin/LoginForm';
import RegisterForm from '@/components/admin/RegisterForm';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(true);

  // Check for existing session on component mount
  const checkSession = useCallback(async () => {
    try {
      if (!isMounted.current) return;
      
      console.log("AdminLogin: Checking for existing session");
      
      const { data, error } = await supabase.auth.getSession();
      
      if (!isMounted.current) return;
      
      if (error) {
        console.error("Session check error in AdminLogin:", error);
        setInitialLoading(false);
        return;
      }
      
      if (data.session) {
        console.log("AdminLogin: Valid session found, redirecting to dashboard");
        window.location.href = '/admin/dashboard';
        return;
      }
      
      console.log("AdminLogin: No active session found");
      if (isMounted.current) {
        setInitialLoading(false);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      if (isMounted.current) {
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Set up isMounted ref
    isMounted.current = true;
    
    // Execute session check
    checkSession().catch(err => {
      console.error("Unhandled error during session check:", err);
      if (isMounted.current) {
        setInitialLoading(false);
      }
    });
    
    // Set up auth state change listener - ensure it doesn't return a promise
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted.current) return;
      
      // Only perform synchronous operations here, don't return anything
      console.log("Auth state changed in AdminLogin:", event);
      
      // Only redirect on valid sign in events when component is still mounted
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && isMounted.current) {
        console.log("AdminLogin: Valid auth event detected, redirecting to dashboard");
        window.location.href = '/admin/dashboard';
      }
    });
    
    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [checkSession]);

  // Handle login form submission with automatic retry
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted.current) return;
    
    setLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!isMounted.current) return;
      
      console.log("Login successful:", data);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "جاري توجيهك إلى لوحة التحكم..."
      });
      
      // Double-check session establishment before redirect
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!isMounted.current) return;
      
      if (sessionData.session) {
        // Use direct navigation for reliability
        window.location.href = '/admin/dashboard';
      } else {
        console.error("Session not established after successful login");
        throw new Error("فشل إنشاء الجلسة");
      }
    } catch (error: any) {
      if (!isMounted.current) return;
      
      console.error("Login error:", error);
      setAuthError(error.message || "فشل تسجيل الدخول");
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "فشل تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted.current) return;
    
    setLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting registration with email:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!isMounted.current) return;
      
      console.log("Registration successful", data);
      
      // Try immediate login after registration
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!isMounted.current) return;
        
        if (loginError) {
          throw loginError;
        }
        
        toast({
          title: "تم التسجيل وتسجيل الدخول بنجاح",
          description: "جاري توجيهك إلى لوحة التحكم..."
        });
        
        // Double-check session establishment before redirect
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!isMounted.current) return;
      
        if (sessionData.session) {
          // Use direct navigation for reliability
          window.location.href = '/admin/dashboard';
        } else {
          console.error("Session not established after successful registration and login");
          toast({
            title: "تم التسجيل بنجاح",
            description: "يرجى تسجيل الدخول الآن"
          });
        }
      } catch (loginError: any) {
        if (!isMounted.current) return;
        
        console.error("Auto-login after registration error:", loginError);
        toast({
          title: "تم التسجيل بنجاح",
          description: "يرجى تسجيل الدخول الآن"
        });
      }
    } catch (error: any) {
      if (!isMounted.current) return;
      
      console.error("Registration error:", error);
      setAuthError(error.message || "فشل إنشاء الحساب");
      
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "فشل إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Use useEffect to handle initialization loading state
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="text-center p-4">
            <p className="text-lg">جارٍ التحميل...</p>
            <p className="text-sm text-gray-500 mt-2">يتم التحقق من حالة الجلسة...</p>
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
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="login" className="w-full">
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
                  isLoading={loading}
                />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  onSubmit={handleRegister}
                  isLoading={loading}
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

export default AdminLogin;

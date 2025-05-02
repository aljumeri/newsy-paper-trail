
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthTabs from '@/components/admin/AuthTabs';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    authError,
    handleLogin,
    handleRegister
  } = useAuthHandlers();

  // Simple direct session check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AdminLogin: Checking for active session");
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("AdminLogin: Active session found, redirecting to dashboard");
          window.location.href = '/admin/dashboard';
          return;
        }
        
        console.log("AdminLogin: No active session found, showing login form");
        setIsSessionLoading(false);
      } catch (error) {
        console.error("AdminLogin: Session check error:", error);
        setIsSessionLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AdminLogin: Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("AdminLogin: User signed in event, redirecting to dashboard");
        window.location.href = '/admin/dashboard';
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

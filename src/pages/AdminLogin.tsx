
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

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Verify if the user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.session.user.id)
          .single();
        
        if (adminData) {
          navigate('/admin/dashboard');
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if the user is in the admin_users table
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.user.id)
          .single();
        
        if (adminError || !adminData) {
          console.error('Admin check error:', adminError);
          await supabase.auth.signOut();
          setAuthError("ليس لديك صلاحيات إدارية. تأكد من استخدام حساب مسؤول.");
          toast({
            title: "غير مصرح به",
            description: "ليس لديك صلاحيات إدارية.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحبًا بعودتك!"
          });
          navigate('/admin/dashboard');
        }
      }
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
      // Create a new user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            is_admin: true
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Manually add user to admin_users table regardless of email verification status
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert([{ id: data.user.id }]);
          
        if (insertError) {
          console.error("Error adding to admin_users:", insertError);
          throw insertError;
        }
        
        // If we got here, the user is now in the admin_users table
        
        if (data.session) {
          // User is already logged in
          toast({
            title: "تم التسجيل بنجاح",
            description: "تم إنشاء حساب المسؤول الخاص بك وتسجيل الدخول."
          });
          navigate('/admin/dashboard');
        } else {
          // User needs to verify email first
          toast({
            title: "تم التسجيل بنجاح",
            description: "يرجى التحقق من بريدك الإلكتروني للتأكيد ثم تسجيل الدخول."
          });
          
          // Try to sign in immediately if verification is bypassed in development
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (!signInError && signInData.session) {
              // Login successful (happens if email verification is disabled)
              toast({
                title: "تم تسجيل الدخول تلقائيًا",
                description: "تم التحقق من حسابك وتسجيل الدخول."
              });
              navigate('/admin/dashboard');
            }
          } catch (signInErr) {
            // Silent fail for automatic login attempt
            console.log("Auto login after registration failed - verification likely required");
          }
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

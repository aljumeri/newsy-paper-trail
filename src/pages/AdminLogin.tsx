
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
        const { data: adminData } = await supabase
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
      // Override to ignore email verification during login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if the user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.user.id)
          .single();
        
        if (adminError || !adminData) {
          await supabase.auth.signOut();
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
      // Create a new user account without email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Disable email verification during development
          emailRedirectTo: window.location.origin,
          data: {
            is_admin: true  // Optional metadata to indicate admin status
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Add user to admin_users table using RPC function
        const { error: adminError } = await supabase.rpc('create_admin_user', {
          user_id: data.user.id
        });
        
        if (adminError) {
          console.error("Error adding to admin_users using RPC:", adminError);
          
          // Fallback: Try direct insert with auth.uid() check
          const { error: directError } = await supabase
            .from('admin_users')
            .insert([{ id: data.user.id }]);
            
          if (directError) {
            throw directError;
          }
        }
        
        // Check if email confirmation is required
        if (data.session) {
          // User created and logged in directly without email confirmation
          toast({
            title: "تم التسجيل بنجاح",
            description: "تم إنشاء حساب المسؤول الخاص بك وتسجيل الدخول."
          });
          navigate('/admin/dashboard');
        } else {
          // Email confirmation might still be required by Supabase settings
          toast({
            title: "تم التسجيل بنجاح",
            description: "تم إنشاء الحساب. يمكنك الآن تسجيل الدخول."
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

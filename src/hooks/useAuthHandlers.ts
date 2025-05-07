
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const useAuthHandlers = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const origin = window.location.origin;

  // Special admin access for recovery
  const knownAdminEmails = [
    'aljumeri@gmail.com',
    'su.alshehri.ai@gmail.com',
    'test@example.com',
    'admin@example.com'
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with:", email);
      console.log("Current origin:", origin);
      
      // Special admin recovery path
      if (knownAdminEmails.includes(email.toLowerCase())) {
        console.log("Recognized admin email, attempting login...");
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // For known admin emails, if regular login fails, we'll try password reset
          console.log("Admin login failed, initiating password reset");
          
          // Send password reset email
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/admin-control/reset-password`
          });
          
          if (resetError) {
            console.error("Password reset error:", resetError);
            throw resetError;
          }
          
          toast({
            title: "تم إرسال رابط إعادة تعيين كلمة المرور",
            description: "تحقق من بريدك الإلكتروني للحصول على تعليمات إعادة تعيين كلمة المرور.",
          });
          setIsLoading(false);
          return;
        }
        
        console.log("Admin login successful, redirecting to panel");
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحبًا بعودتك!"
        });
        
        // Use relative path for navigation on any domain
        window.location.href = '/admin-control/panel';
        return;
      }
      
      // Regular login path
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful, redirecting to panel");
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بعودتك!"
      });
      
      // Use relative path for navigation on any domain
      window.location.href = '/admin-control/panel';
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
      console.log("Current origin:", origin);
      
      // Check if this is a known admin email
      if (knownAdminEmails.includes(email.toLowerCase())) {
        console.log("Recognized admin email for registration");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/admin-control/panel`,
        }
      });
      
      if (error) throw error;
      
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
          console.log("Auto-login successful, redirecting to panel");
          toast({
            title: "تم التسجيل والدخول بنجاح",
            description: "تم إنشاء حساب المسؤول الخاص بك وتسجيل الدخول."
          });
          
          // Use relative path for navigation on any domain
          window.location.href = '/admin-control/panel';
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    authError,
    handleLogin,
    handleRegister
  };
};


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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with:", email);
      console.log("Current origin:", origin);
      
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


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling authentication-related operations
 */
export const useAuthHandlers = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      
      // Auth listener will handle navigation
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
        toast({
          title: "تم التسجيل بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني للتأكيد."
        });
        
        // Try immediate sign in after registration
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (!signInError) {
            toast({
              title: "تم التسجيل والدخول بنجاح",
              description: "تم إنشاء حساب المسؤول الخاص بك وتسجيل الدخول."
            });
          }
        } catch (signInErr) {
          console.error("Auto-login error:", signInErr);
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

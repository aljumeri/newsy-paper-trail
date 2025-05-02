
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST to avoid session handling issues
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, navigating to login page");
        setUser(null);
        navigate('/admin', { replace: true });
      } else if (event === 'SIGNED_IN' && session) {
        console.log("User signed in:", session.user.email);
        setUser(session.user);
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      console.log("AdminDashboard: Checking session status...");
      setLoading(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          navigate('/admin', { replace: true });
          return;
        }
        
        if (!data.session) {
          console.log("AdminDashboard: No session found, redirecting to login");
          navigate('/admin', { replace: true });
          return;
        }
        
        console.log("AdminDashboard: Session found, user:", data.session.user.email);
        setUser(data.session.user);
      } catch (error) {
        console.error("Error checking session:", error);
        navigate('/admin', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      console.log("Signing out user...");
      await supabase.auth.signOut();
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج.",
        variant: "destructive"
      });
    }
  };

  return { user, loading, handleSignOut };
};

export default useAdminAuth;

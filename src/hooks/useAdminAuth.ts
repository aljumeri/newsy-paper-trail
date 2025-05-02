
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Starting auth check in useAdminAuth...");
    
    // Set up auth state listener FIRST to avoid session handling issues
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, navigating to login page");
        setUser(null);
        setSession(null);
        navigate('/admin', { replace: true });
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        console.log("User signed in or token refreshed:", session.user.email);
        setUser(session.user);
        setSession(session);
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      console.log("Checking session status...");
      setLoading(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setLoading(false);
          navigate('/admin', { replace: true });
          return;
        }
        
        if (!data.session) {
          console.log("No session found, redirecting to login");
          setLoading(false);
          navigate('/admin', { replace: true });
          return;
        }
        
        console.log("Session found, user:", data.session.user.email);
        setUser(data.session.user);
        setSession(data.session);
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
        navigate('/admin', { replace: true });
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
      setLoading(true);
      console.log("Signing out user...");
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!",
      });
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { user, session, loading, handleSignOut };
};

export default useAdminAuth;

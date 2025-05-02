
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
    
    // Set up a simple auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setUser(null);
        setSession(null);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession) {
        console.log("User signed in or token refreshed:", currentSession.user?.email);
        setUser(currentSession.user);
        setSession(currentSession);
      }
    });
    
    // Then check for existing session
    const checkSession = async () => {
      console.log("Checking session status...");
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setLoading(false);
          return;
        }
        
        console.log("Session check result:", data.session ? "Session found" : "No session");
        
        if (data.session) {
          setUser(data.session.user);
          setSession(data.session);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };
    
    // Use setTimeout to prevent potential race conditions
    setTimeout(() => {
      checkSession();
    }, 0);
    
    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  // Separated navigation logic from auth check
  useEffect(() => {
    // Only redirect if not loading and we know there's no user
    if (!loading && !user && window.location.pathname.includes('/admin/')) {
      console.log("No authenticated user, redirecting to login");
      navigate('/admin', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSignOut = async () => {
    try {
      console.log("Signing out user...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: "حدث خطأ أثناء تسجيل الخروج.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!",
      });
      
      // Use setTimeout to prevent race conditions
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 0);
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج.",
        variant: "destructive"
      });
    }
  };

  return { user, session, loading, handleSignOut };
};

export default useAdminAuth;

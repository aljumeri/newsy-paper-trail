
import { useState, useEffect, useRef } from 'react';
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
  const isUnmounted = useRef(false);

  useEffect(() => {
    console.log("Starting auth check in useAdminAuth...");
    
    // Setup unmount flag for cleanup
    isUnmounted.current = false;
    
    // Set up auth state listener first - ensure it doesn't return a promise
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isUnmounted.current) return;
      
      console.log("Auth state changed:", event);
      
      // Update state synchronously, don't return anything
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
    
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking session status...");
        
        if (isUnmounted.current) return;
        
        const { data, error } = await supabase.auth.getSession();
        
        if (isUnmounted.current) return;
        
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
        if (isUnmounted.current) return;
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };
    
    // Do the session check immediately
    checkSession().catch(err => {
      console.error("Unhandled error during session check:", err);
      if (!isUnmounted.current) {
        setLoading(false);
      }
    });
    
    return () => {
      console.log("Cleaning up auth listener");
      isUnmounted.current = true;
      subscription.unsubscribe();
    };
  }, []);

  // Separated navigation logic from auth check
  useEffect(() => {
    // Only redirect if not loading and we know there's no user
    if (!loading && !user && window.location.pathname.includes('/admin/')) {
      console.log("No authenticated user, redirecting to login");
      // Use window.location for more reliable navigation that doesn't return a promise
      window.location.href = '/admin';
    }
  }, [loading, user, navigate]);

  const handleSignOut = async () => {
    try {
      console.log("Signing out user...");
      const { error } = await supabase.auth.signOut();
      
      if (isUnmounted.current) return;
      
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
      
      // Navigate immediately, use window.location for reliability
      window.location.href = '/admin';
    } catch (error) {
      if (isUnmounted.current) return;
      
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

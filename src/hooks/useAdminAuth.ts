
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsAdmin(false);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession) {
        console.log("User signed in or token refreshed:", currentSession.user?.email);
        setUser(currentSession.user);
        setSession(currentSession);
        
        // Check admin status when user signs in
        checkAdminStatus(currentSession.user.id);
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
          setIsLoading(false);
          return;
        }
        
        console.log("Session check result:", data.session ? "Session found" : "No session");
        
        if (data.session) {
          setUser(data.session.user);
          setSession(data.session);
          
          // Check admin status
          await checkAdminStatus(data.session.user.id);
        }
        
        setLoading(false);
        setIsLoading(false);
      } catch (error) {
        if (isUnmounted.current) return;
        console.error("Error checking session:", error);
        setLoading(false);
        setIsLoading(false);
      }
    };
    
    // Helper function to check admin status
    const checkAdminStatus = async (userId: string) => {
      try {
        if (isUnmounted.current) return;
        
        const { data: adminStatus, error } = await supabase.rpc(
          'get_admin_status',
          { user_id: userId }
        );
        
        if (isUnmounted.current) return;
        
        if (error) {
          console.error("Admin check error:", error);
          setIsAdmin(false);
          return;
        }
        
        // Convert to boolean explicitly
        setIsAdmin(Boolean(adminStatus));
        
        if (!adminStatus && window.location.pathname.includes('/admin-control/')) {
          toast({
            title: "صلاحيات غير كافية",
            description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          navigate('/admin-control');
        }
      } catch (error) {
        if (isUnmounted.current) return;
        console.error("Admin status check error:", error);
        setIsAdmin(false);
      }
    };
    
    // Do the session check immediately
    checkSession().catch(err => {
      console.error("Unhandled error during session check:", err);
      if (!isUnmounted.current) {
        setLoading(false);
        setIsLoading(false);
      }
    });
    
    return () => {
      console.log("Cleaning up auth listener");
      isUnmounted.current = true;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Separated navigation logic from auth check
  useEffect(() => {
    // Only redirect if not loading and we know there's no user
    if (!loading && !user && window.location.pathname.includes('/admin-control/')) {
      console.log("No authenticated user, redirecting to login");
      // Use window.location for more reliable navigation that doesn't return a promise
      window.location.href = '/admin-control';
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
      window.location.href = '/admin-control';
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

  return { 
    user, 
    session, 
    loading, 
    isLoading, 
    isAdmin, 
    handleSignOut 
  };
};

export default useAdminAuth;

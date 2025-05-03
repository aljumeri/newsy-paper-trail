
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

  // Handle session and admin status check
  useEffect(() => {
    console.log("Starting auth check in useAdminAuth...");
    
    // Setup unmount flag for cleanup
    isUnmounted.current = false;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isUnmounted.current) return;
      
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        
        // Safely navigate from admin pages
        if (window.location.pathname.includes('/admin-control/')) {
          window.location.href = '/admin-control';
        }
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession) {
        console.log("User signed in or token refreshed:", currentSession.user?.email);
        setUser(currentSession.user);
        setSession(currentSession);
        
        // Check admin status using RPC function
        checkAdminStatus(currentSession.user.id);
      }
    });
    
    // Check admin status using our database function
    const checkAdminStatus = async (userId: string) => {
      try {
        if (isUnmounted.current) return;
        
        console.log("Checking if user is admin:", userId);
        
        // Use RPC to call the is_admin_user function
        const { data, error } = await supabase.rpc('is_admin_user', { user_id: userId });
        
        if (isUnmounted.current) return;
        
        if (error) {
          console.error("Admin check error:", error);
          setIsAdmin(false);
          
          if (window.location.pathname.includes('/admin-control/')) {
            toast({
              title: "خطأ في التحقق",
              description: "حدث خطأ أثناء التحقق من صلاحيات المسؤول",
              variant: "destructive"
            });
            navigate('/admin-control');
          }
        } else {
          console.log("Admin status result:", data);
          setIsAdmin(data); // Set the boolean value directly
          
          // If not admin and trying to access protected routes
          if (!data && window.location.pathname.includes('/admin-control/')) {
            toast({
              title: "صلاحيات غير كافية",
              description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
              variant: "destructive"
            });
            navigate('/admin-control');
          }
        }
      } catch (error) {
        if (isUnmounted.current) return;
        console.error("Admin status check error:", error);
        setIsAdmin(false);
      } finally {
        if (isUnmounted.current) return;
        setLoading(false);
        setIsLoading(false);
      }
    };
    
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
        } else {
          setLoading(false);
          setIsLoading(false);
        }
      } catch (error) {
        if (isUnmounted.current) return;
        console.error("Error checking session:", error);
        setLoading(false);
        setIsLoading(false);
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

  // Handle sign out
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
      
      // Navigate immediately
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

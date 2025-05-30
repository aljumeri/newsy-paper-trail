
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { adminUtils } from '@/utils/adminUtils';

const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isUnmounted = useRef(false);

  useEffect(() => {
    isUnmounted.current = false;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (isUnmounted.current) return;
      
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        await adminUtils.logSecurityEvent('user_logout');
        
        if (window.location.pathname.includes('/admin-control/')) {
          window.location.href = '/admin-control';
        }
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
        
        // Check admin status using the secure function
        const adminStatus = await adminUtils.isCurrentUserAdmin();
        setIsAdmin(adminStatus);
        
        if (event === 'SIGNED_IN') {
          await adminUtils.logSecurityEvent('user_login');
        }
        
        if (!adminStatus && window.location.pathname.includes('/admin-control/')) {
          toast({
            title: "صلاحيات غير كافية",
            description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          navigate('/admin-control');
        }
      }
      
      setLoading(false);
    });
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (isUnmounted.current) return;
        
        if (error) {
          console.error("Session check error:", error);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          setUser(data.session.user);
          setSession(data.session);
          
          // Check admin status using the secure function
          const adminStatus = await adminUtils.isCurrentUserAdmin();
          setIsAdmin(adminStatus);
          
          if (!adminStatus && window.location.pathname.includes('/admin-control/')) {
            toast({
              title: "صلاحيات غير كافية",
              description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
              variant: "destructive"
            });
            navigate('/admin-control');
          }
        }
        
        setLoading(false);
      } catch (error) {
        if (isUnmounted.current) return;
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      isUnmounted.current = true;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      await adminUtils.logSecurityEvent('user_logout_initiated');
      
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
    isAdmin, 
    handleSignOut 
  };
};

export default useSecureAuth;

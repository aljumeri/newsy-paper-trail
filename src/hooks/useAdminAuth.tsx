
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndAdmin = async () => {
      try {
        console.log("Checking admin session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          toast({
            title: "خطأ في التحقق من الجلسة",
            description: "يرجى تسجيل الدخول مرة أخرى",
            variant: "destructive"
          });
          navigate('/admin-control');
          return;
        }
        
        if (!data.session) {
          console.log("No active session found, redirecting to login");
          navigate('/admin-control');
          return;
        }
        
        console.log("Valid session found for user:", data.session.user.email);
        
        // Check admin status immediately
        try {
          const { data: adminStatus, error: adminError } = await supabase.rpc(
            'get_admin_status',
            { user_id: data.session.user.id }
          );
          
          if (adminError) {
            console.error("Admin check error:", adminError);
            toast({
              title: "خطأ في التحقق من صلاحيات المسؤول",
              description: "يرجى المحاولة مرة أخرى لاحقًا",
              variant: "destructive"
            });
            navigate('/admin-control');
            return;
          }
          
          // Convert to boolean explicitly
          setIsAdmin(Boolean(adminStatus));
          
          if (!adminStatus) {
            toast({
              title: "صلاحيات غير كافية",
              description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
              variant: "destructive"
            });
            navigate('/admin-control');
          }
        } catch (adminCheckErr) {
          console.error("Unexpected admin check error:", adminCheckErr);
          navigate('/admin-control');
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Unexpected error checking session:", err);
        navigate('/admin-control');
      }
    };
    
    checkSessionAndAdmin();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/admin-control');
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { isAdmin, isLoading };
}

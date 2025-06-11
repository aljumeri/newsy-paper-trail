import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMounted = useRef(true);

  // Initialize auth state and handle auth state changes
  useEffect(() => {
    console.log("AdminAuthProvider: Initializing");
    isMounted.current = true;

    // First set up auth state change listener to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted.current) return;
      
      console.log(`AdminAuthProvider: Auth state changed: ${event}`);
      
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }
    });

    // Then check for existing session
    const checkSession = async () => {
      try {
        if (!isMounted.current) return;
        
        console.log("AdminAuthProvider: Checking for existing session");
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted.current) return;
        
        if (error) {
          console.error("AdminAuthProvider: Session check error:", error);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          console.log("AdminAuthProvider: Found existing session");
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log("AdminAuthProvider: No existing session found");
        }
        
        setLoading(false);
      } catch (error) {
        if (!isMounted.current) return;
        console.error("AdminAuthProvider: Error checking session:", error);
        setLoading(false);
      }
    };

    // Execute session check
    checkSession();

    // Clean up on unmount
    return () => {
      console.log("AdminAuthProvider: Cleaning up");
      isMounted.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in function with improved error handling
  const signIn = async (email: string, password: string) => {
    try {
      console.log("AdminAuthProvider: Attempting sign in");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("AdminAuthProvider: Sign in error:", error);
        toast({
          title: "فشل تسجيل الدخول",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      console.log("AdminAuthProvider: Sign in successful");
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك!"
      });
      return { error: null };
    } catch (error: any) {
      console.error("AdminAuthProvider: Unexpected sign in error:", error);
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return { error };
    }
  };

  // Sign up function with improved error handling
  const signUp = async (email: string, password: string) => {
    try {
      console.log("AdminAuthProvider: Attempting sign up");
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        }
      });
      
      if (error) {
        console.error("AdminAuthProvider: Sign up error:", error);
        toast({
          title: "فشل إنشاء الحساب",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      console.log("AdminAuthProvider: Sign up successful");
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "سيتم توجيهك بعد تسجيل الدخول"
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("AdminAuthProvider: Unexpected sign up error:", error);
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      return { error };
    }
  };

  // Sign out function with improved error handling
  const signOut = async () => {
    try {
      console.log("AdminAuthProvider: Attempting sign out");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AdminAuthProvider: Sign out error:", error);
        toast({
          title: "فشل تسجيل الخروج",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log("AdminAuthProvider: Sign out successful");
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!"
      });
      
      // Force redirect to login page for reliability
      window.location.href = '/admin';
    } catch (error: any) {
      console.error("AdminAuthProvider: Unexpected sign out error:", error);
      toast({
        title: "فشل تسجيل الخروج",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
        signUp
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Hook to ensure admin user is authenticated
export const useRequireAdminAuth = () => {
  const { user, loading } = useAdminAuth();
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Only do the redirect after auth system has loaded
    if (!loading) {
      setIsChecking(false);
      
      if (!user) {
        console.log("No user found, redirecting to login");
        window.location.href = '/admin-control';
        return;
      }

      console.log("user", user);

      // Check if user is admin by querying admin_users table
      const checkAdmin = async () => {
        try {
          console.log("Starting admin check for user ID:", user.id);
          
          // Add more detailed logging and error handling
          const { data, error, status, statusText } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          console.log("Admin check response:", { 
            data, 
            error, 
            status, 
            statusText,
            userId: user.id 
          });

          // Handle different error scenarios
          if (error) {
            console.error("Database error during admin check:", error);
            
            // Check if it's a table/permission issue
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
              console.error("Table 'admin_users' may not exist or user lacks permissions");
              toast({
                title: 'خطأ في قاعدة البيانات',
                description: 'لا يمكن الوصول إلى جدول المديرين',
                variant: 'destructive',
              });
            } else if (error.code === '42501' || error.message.includes('permission')) {
              console.error("Permission denied accessing admin_users table");
              toast({
                title: 'صلاحيات غير كافية',
                description: 'ليس لديك صلاحيات الوصول إلى هذه الصفحة',
                variant: 'destructive',
              });
            } else {
              toast({
                title: 'خطأ في النظام',
                description: `حدث خطأ: ${error.message}`,
                variant: 'destructive',
              });
            }
            
            window.location.href = '/admin-control';
            return;
          }

          // Check if user is found in admin_users table
          if (!data) {
            console.log("User is not an admin (not found in admin_users table)");
            toast({
              title: 'صلاحيات غير كافية',
              description: 'ليس لديك صلاحيات الوصول إلى هذه الصفحة',
              variant: 'destructive',
            });
            window.location.href = '/admin-control';
            return;
          }

          console.log("Admin check successful - user is authorized");
          
        } catch (err: any) {
          console.error("Unexpected error checking admin status:", err);
          
          // More specific error handling for network/connection issues
          if (err.name === 'TypeError' && err.message.includes('fetch')) {
            toast({
              title: 'خطأ في الاتصال',
              description: 'لا يمكن الاتصال بالخادم',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'خطأ غير متوقع',
              description: err.message || 'حدث خطأ أثناء التحقق من الصلاحيات',
              variant: 'destructive',
            });
          }
          
          window.location.href = '/admin-control';
        }
      };

      checkAdmin();
    }
  }, [user, loading, toast]);
  
  return { isChecking: loading || isChecking };
};
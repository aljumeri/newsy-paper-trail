
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

type AuthSessionCheckerProps = {
  onSessionCheckComplete: () => void;
};

const AuthSessionChecker: React.FC<AuthSessionCheckerProps> = ({ onSessionCheckComplete }) => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();

  // Check session on component mount
  useEffect(() => {
    console.log("AuthSessionChecker: Component mounted, checking session...");
    
    let isMounted = true;
    
    const checkSession = () => {
      try {
        console.log("AuthSessionChecker: Starting session check");
        
        if (!isMounted) return;
        
        supabase.auth.getSession().then(({ data, error }) => {
          if (!isMounted) return;
          
          if (error) {
            console.error("Session check error:", error);
            setIsPageLoading(false);
            onSessionCheckComplete();
            return;
          }
          
          console.log("AuthSessionChecker: Session data:", data);
          
          if (data.session) {
            console.log("AuthSessionChecker: Valid session found, navigating to dashboard");
            navigate('/admin/dashboard', { replace: true });
          } else {
            console.log("AuthSessionChecker: No active session found");
            setIsPageLoading(false);
            onSessionCheckComplete();
          }
        }).catch(err => {
          if (!isMounted) return;
          console.error("Session check failed:", err);
          setIsPageLoading(false);
          onSessionCheckComplete();
        });
      } catch (error) {
        if (!isMounted) return;
        console.error('Session check error:', error);
        setIsPageLoading(false);
        onSessionCheckComplete();
      }
    };
    
    // Run session check immediately
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, onSessionCheckComplete]);

  // Set up auth state listener
  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in AuthSessionChecker:", event);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, navigating to dashboard");
        navigate('/admin/dashboard', { replace: true });
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log("AuthSessionChecker: Component unmounting, cleaning up subscription");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isPageLoading) {
    return (
      <div className="text-center">
        <p className="text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  return null;
};

export default AuthSessionChecker;

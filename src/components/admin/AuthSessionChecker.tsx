
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

type AuthSessionCheckerProps = {
  onSessionCheckComplete: () => void;
};

const AuthSessionChecker: React.FC<AuthSessionCheckerProps> = ({ onSessionCheckComplete }) => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const checkPerformed = useRef(false);

  // Check session on component mount - only once
  useEffect(() => {
    console.log("AuthSessionChecker: Component mounted, checking session...");
    
    // Set isMounted ref for cleanup
    isMounted.current = true;
    
    const checkSession = async () => {
      // Skip if check already performed
      if (checkPerformed.current) return;
      
      try {
        checkPerformed.current = true;
        console.log("AuthSessionChecker: Starting session check");
        
        if (!isMounted.current) return;
        
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted.current) return;
        
        if (error) {
          console.error("Session check error:", error);
          setIsPageLoading(false);
          onSessionCheckComplete();
          return;
        }
        
        console.log("AuthSessionChecker: Session data:", data);
        
        if (data.session) {
          console.log("AuthSessionChecker: Valid session found, navigating to dashboard");
          // Use hard redirect to admin-control/panel to break any loops
          window.location.href = '/admin-control/panel';
          return; // Important: stop execution here
        } else {
          console.log("AuthSessionChecker: No active session found");
          setIsPageLoading(false);
          onSessionCheckComplete();
        }
      } catch (err) {
        if (!isMounted.current) return;
        console.error("Session check failed:", err);
        setIsPageLoading(false);
        onSessionCheckComplete();
      }
    };
    
    // Run session check immediately (once)
    checkSession();
    
    return () => {
      isMounted.current = false;
    };
  }, [navigate, onSessionCheckComplete]);

  // Set up auth state listener - with flags to prevent multiple redirects
  useEffect(() => {
    let isRedirecting = false;
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted.current || isRedirecting) return;
      
      console.log("Auth state changed in AuthSessionChecker:", event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, navigating to panel");
        isRedirecting = true;
        // Use hard redirect to break any loops
        window.location.href = '/admin-control/panel';
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log("AuthSessionChecker: Component unmounting, cleaning up subscription");
      isMounted.current = false;
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

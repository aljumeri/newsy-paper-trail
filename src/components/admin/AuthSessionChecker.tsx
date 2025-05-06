
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

type AuthSessionCheckerProps = {
  onSessionCheckComplete: () => void;
};

const AuthSessionChecker: React.FC<AuthSessionCheckerProps> = ({ onSessionCheckComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const domain = window.location.hostname;

  // Single session check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("AuthSessionChecker: Checking session");
        console.log("Current domain:", domain);
        console.log("Full URL:", window.location.href);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsLoading(false);
          onSessionCheckComplete();
          return;
        }
        
        if (data.session) {
          console.log("AuthSessionChecker: Valid session found");
          // Simply redirect to panel page
          window.location.href = '/admin-control/panel';
          return;
        } else {
          console.log("AuthSessionChecker: No session found");
          setIsLoading(false);
          onSessionCheckComplete();
        }
      } catch (err) {
        console.error("Session check error:", err);
        setIsLoading(false);
        onSessionCheckComplete();
      }
    };

    checkSession();
  }, [onSessionCheckComplete, domain]);

  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  return null;
};

export default AuthSessionChecker;

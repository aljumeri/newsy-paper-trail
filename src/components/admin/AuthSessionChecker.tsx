
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

type AuthSessionCheckerProps = {
  onSessionCheckComplete: () => void;
};

const AuthSessionChecker: React.FC<AuthSessionCheckerProps> = ({ onSessionCheckComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const domain = window.location.hostname;
  const fullUrl = window.location.href;
  const origin = window.location.origin;

  // Enhanced session check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("=============================================");
        console.log("AuthSessionChecker: Starting session check");
        console.log("Current domain:", domain);
        console.log("Full URL:", fullUrl);
        console.log("Origin:", origin);
        console.log("Current path:", window.location.pathname);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsLoading(false);
          onSessionCheckComplete();
          return;
        }
        
        if (data.session) {
          console.log("AuthSessionChecker: Valid session found for user:", data.session.user.email);
          console.log("Session expires at:", new Date(data.session.expires_at * 1000).toLocaleString());
          
          // Always use relative URL to ensure proper navigation on any domain
          const redirectPath = '/admin-control/panel';
          console.log("Redirecting to:", redirectPath);
          
          // Use relative path for redirection to work on any domain
          window.location.href = redirectPath;
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

    console.log("AuthSessionChecker: Component mounted");
    checkSession();
    console.log("=============================================");
  }, [onSessionCheckComplete, domain, fullUrl, origin]);

  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-lg">جارٍ التحميل...</p>
        <p className="text-sm text-gray-500">{domain}</p>
      </div>
    );
  }

  return null;
};

export default AuthSessionChecker;

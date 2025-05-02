
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

interface Newsletter {
  id: string;
  subject: string;
  created_at: string;
  sent_at: string | null;
}

const useAdminDashboardData = (user: User | null) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();
  const isMounted = useRef(false);

  useEffect(() => {
    // Mark component as mounted
    isMounted.current = true;

    if (!user) {
      console.log("No authenticated user, skipping data fetch");
      setLoading(false);
      return;
    }
    
    const checkAdminStatus = async () => {
      try {
        // Check if user is an admin first using the RPC function
        const { data: adminStatus, error: adminError } = await supabase.rpc(
          'get_admin_status',
          { user_id: user.id }
        );
        
        if (adminError) {
          console.error('Admin status check error:', adminError);
          if (isMounted.current) {
            setError(adminError.message);
            setIsAdmin(false);
            setLoading(false);
          }
          return false;
        }
        
        if (isMounted.current) {
          // Fixed: Convert the response to boolean explicitly
          setIsAdmin(Boolean(adminStatus));
        }
        
        return adminStatus;
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        if (isMounted.current) {
          setError(error.message || "Error checking admin status");
          setIsAdmin(false);
          setLoading(false);
        }
        return false;
      }
    };
    
    const fetchData = async () => {
      console.log("Starting to fetch admin dashboard data...");
      setLoading(true);
      setError(null);
      
      // Check admin status first
      const adminStatus = await checkAdminStatus();
      if (!adminStatus) {
        console.log("User is not an admin, skipping data fetch");
        return;
      }
      
      try {
        // Fetch subscribers
        console.log("Fetching subscribers...");
        const { data: subscribersData, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (subscribersError) {
          console.error('Error fetching subscribers:', subscribersError);
          if (isMounted.current) {
            setError(subscribersError.message);
          }
        } else if (isMounted.current && subscribersData) {
          console.log("Fetched subscribers:", subscribersData?.length || 0);
          // Fixed: Cast to Subscriber[] to fix type mismatch
          setSubscribers(subscribersData as unknown as Subscriber[]);
        }
        
        // Fetch newsletters
        console.log("Fetching newsletters...");
        const { data: newslettersData, error: newslettersError } = await supabase
          .from('newsletters')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (newslettersError) {
          console.error('Error fetching newsletters:', newslettersError);
          if (isMounted.current) {
            setError(prev => prev || newslettersError.message);
          }
        } else if (isMounted.current && newslettersData) {
          console.log("Fetched newsletters:", newslettersData?.length || 0);
          // Fixed: Cast to Newsletter[] to fix type mismatch
          setNewsletters(newslettersData as unknown as Newsletter[]);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (isMounted.current) {
          setError(error.message || "Unknown error occurred");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Clean up
    return () => {
      isMounted.current = false;
    };
  }, [user]);

  // Show toast when error occurs
  useEffect(() => {
    if (error && isMounted.current) {
      toast({
        title: "خطأ في جلب البيانات",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return { subscribers, newsletters, loading, error, isAdmin };
};

export default useAdminDashboardData;

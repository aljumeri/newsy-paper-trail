
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      console.log("No user, skipping data fetch");
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const fetchData = async () => {
      console.log("Starting to fetch admin dashboard data...");
      setLoading(true);
      setError(null);
      
      try {
        // Fetch subscribers with error handling
        console.log("Fetching subscribers...");
        const { data: subscribersData, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (subscribersError) {
          console.error('Error fetching subscribers:', subscribersError);
          if (isMounted) {
            setError(subscribersError.message);
          }
        } else if (isMounted) {
          console.log("Fetched subscribers:", subscribersData?.length || 0);
          setSubscribers(subscribersData || []);
        }
        
        // Fetch newsletters with error handling
        console.log("Fetching newsletters...");
        const { data: newslettersData, error: newslettersError } = await supabase
          .from('newsletters')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (newslettersError) {
          console.error('Error fetching newsletters:', newslettersError);
          if (isMounted) {
            setError(prev => prev || newslettersError.message);
          }
        } else if (isMounted) {
          console.log("Fetched newsletters:", newslettersData?.length || 0);
          setNewsletters(newslettersData || []);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          setError(error.message || "Unknown error occurred");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [user, toast]);

  // Show toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "خطأ في جلب البيانات",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return { subscribers, newsletters, loading, error };
};

export default useAdminDashboardData;

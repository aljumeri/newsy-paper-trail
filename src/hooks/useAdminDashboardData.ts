
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

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
  const isUnmounted = useRef(false);

  useEffect(() => {
    if (!user) {
      console.log("No user, skipping data fetch");
      setLoading(false);
      return;
    }
    
    // Setup unmount flag for cleanup
    isUnmounted.current = false;
    
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
          if (!isUnmounted.current) {
            setError(subscribersError.message);
          }
        } else if (!isUnmounted.current && subscribersData) {
          console.log("Fetched subscribers:", subscribersData?.length || 0);
          // Fix: Ensure we're handling the type correctly
          setSubscribers(subscribersData as Subscriber[]);
        }
        
        // Fetch newsletters with error handling
        console.log("Fetching newsletters...");
        const { data: newslettersData, error: newslettersError } = await supabase
          .from('newsletters')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (newslettersError) {
          console.error('Error fetching newsletters:', newslettersError);
          if (!isUnmounted.current) {
            setError(prev => prev || newslettersError.message);
          }
        } else if (!isUnmounted.current && newslettersData) {
          console.log("Fetched newsletters:", newslettersData?.length || 0);
          // Fix: Ensure we're handling the type correctly
          setNewsletters(newslettersData as Newsletter[]);
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (!isUnmounted.current) {
          setError(error.message || "Unknown error occurred");
        }
      } finally {
        if (!isUnmounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isUnmounted.current = true;
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


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
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch subscribers
        const { data: subscribersData, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (subscribersError) {
          console.error('Error fetching subscribers:', subscribersError);
          throw subscribersError;
        }
        
        console.log("Fetched subscribers:", subscribersData?.length || 0);
        setSubscribers(subscribersData || []);
        
        // Fetch newsletters
        const { data: newslettersData, error: newslettersError } = await supabase
          .from('newsletters')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (newslettersError) {
          console.error('Error fetching newsletters:', newslettersError);
          throw newslettersError;
        }
        
        console.log("Fetched newsletters:", newslettersData?.length || 0);
        setNewsletters(newslettersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء تحميل البيانات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  return { subscribers, newsletters, loading };
};

export default useAdminDashboardData;

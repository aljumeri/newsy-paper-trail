import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export const useAdminDashboardData = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if user is admin
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user?.user_metadata?.is_admin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Fetch subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscribersError) throw subscribersError;

      // Fetch newsletters
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (newslettersError) throw newslettersError;

      setSubscribers(subscribersData || []);
      setNewsletters(newslettersData || []);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء جلب البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    subscribers,
    newsletters,
    loading,
    error,
    refreshData: fetchData
  };
};

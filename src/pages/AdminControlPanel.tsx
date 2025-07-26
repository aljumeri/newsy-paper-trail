import AdminActionCard from '@/components/admin/AdminActionCard';
import AdminHeader from '@/components/admin/AdminHeader';
import NewslettersTable from '@/components/admin/NewslettersTable';
import SubscribersTable from '@/components/admin/SubscribersTable';
import { useAdminAuth, useRequireAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';
import useFormatDate from '@/hooks/useFormatDate';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Subscriber {
  email: string;
  name?: string;
  join_date: string;
}

interface Newsletter {
  id: string;
  main_title: string;
  sub_title?: string;
  created_at: string;
  sent_at: string | null;
  status: string;
}

interface SendyResponse {
  success: boolean;
  count: number;
  subscribers: Array<{
    email: string;
    name: string;
    join_date: string;
  }>;
}

const AdminControlPanel: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatDate } = useFormatDate();

  // Use context-based auth
  const { user, signOut } = useAdminAuth();
  const { isChecking } = useRequireAdminAuth();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Sendy data using the new API endpoint
  const fetchSendyData = async () => {
    try {
      const sendyUrl = import.meta.env.VITE_SENDY_URL;
      const sendyApiKey = import.meta.env.VITE_SENDY_API_KEY;
      const sendyListId = import.meta.env.VITE_SENDY_LIST_ID;
      
      if (!sendyUrl || !sendyApiKey || !sendyListId) {
        console.error('Sendy configuration missing in environment variables');
        return;
      }

      // Use the new active-subscriber-count.php endpoint
      const formData = new URLSearchParams();
      formData.append('api_key', sendyApiKey);
      formData.append('list_id', sendyListId);

      const response = await fetch(`${sendyUrl}/api/subscribers/active-subscriber-count.php`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Sendy API error: ${response.status}`);
      }

      const data: SendyResponse = await response.json();
      console.log("Sendy API response:", data);

      if (data.success) {
        setSubscribersCount(data.count);
        
        // Transform Sendy subscribers to match our interface
        const transformedSubscribers: Subscriber[] = data.subscribers.map(sub => ({
          email: sub.email,
          name: sub.name,
          join_date: sub.join_date
        }));
        
        setSubscribers(transformedSubscribers);
      } else {
        throw new Error('Failed to fetch Sendy data');
      }
    } catch (sendyError) {
      console.error('Error fetching Sendy data:', sendyError);
      // Fallback to 0 if Sendy is not available
      setSubscribersCount(0);
      setSubscribers([]);
    }
  };

  // Fetch data from Sendy and Supabase
  const fetchData = async () => {
    try {
      // Fetch newsletters from Supabase
      const { data: news, error: newsErr } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      if (newsErr) throw newsErr;
      setNewsletters(news || []);

      // Fetch Sendy data
      await fetchSendyData();
    } catch (e: unknown) {
      console.error('Error fetching admin data:', e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      toast({ title: 'خطأ في جلب البيانات', description: msg, variant: 'destructive' });
    }
  };

  // When auth-check finishes, fetch data or redirect (redirect happens in context)
  useEffect(() => {
    if (!isChecking) {
      fetchData();
    }
  }, [isChecking]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // While checking auth, show spinner
  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4">جارٍ التحقق من الصلاحيات...</p>
      </div>
    );
  }

  // Main UI for authorized admins
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader user={user as User} onLogout={signOut} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <AdminActionCard
            title="المشتركين"
            value={subscribersCount}
            description="إجمالي عدد المشتركين في النشرة الإخبارية"
            icon="users"
          />
          <AdminActionCard
            title="النشرات الإخبارية"
            value={newsletters.length}
            description="إجمالي عدد النشرات الإخبارية"
            icon="mail"
          />
          <AdminActionCard
            title="نشرة جديدة"
            buttonText="إنشاء نشرة جديدة"
            buttonAction={() => navigate('/admin-control/compose')}
            description="إنشاء وإرسال نشرة إخبارية جديدة"
            icon="plus"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-center">{error}</p>
          </div>
        )}

        <NewslettersTable 
          newsletters={newsletters} 
          formatDate={formatDate} 
          onRefresh={handleRefresh}
        />
        <SubscribersTable
          subscribers={subscribers}
          formatDate={formatDate}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
        />
      </div>
    </div>
  );
};

export default AdminControlPanel;

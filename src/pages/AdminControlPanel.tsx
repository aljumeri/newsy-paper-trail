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
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

interface Newsletter {
  id: string;
  subject: string;
  created_at: string;
  sent_at: string | null;
}

const AdminControlPanel: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatDate } = useFormatDate();

  // Use context-based auth
  const { user, signOut } = useAdminAuth();
  const { isChecking } = useRequireAdminAuth();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch both subscribers and newsletters
  const fetchData = async () => {
    try {
      const { data: subs, error: subsErr } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (subsErr) throw subsErr;
      setSubscribers(subs || []);

      const { data: news, error: newsErr } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      if (newsErr) throw newsErr;
      setNewsletters(news || []);
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
            value={subscribers.length}
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

        <NewslettersTable newsletters={newsletters} formatDate={formatDate} />
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

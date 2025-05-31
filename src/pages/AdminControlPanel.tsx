
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useFormatDate from '@/hooks/useFormatDate';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminActionCard from '@/components/admin/AdminActionCard';
import { adminUtils } from '@/utils/adminUtils';
import useSecureAuth from '@/hooks/useSecureAuth';

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

const AdminControlPanel = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, loading: authLoading, handleSignOut } = useSecureAuth();
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  const { toast } = useToast();
  
  // Simplified data fetching function
  const fetchData = async () => {
    console.log("AdminPanel: Starting data fetch...");
    setDataLoading(true);
    setError(null);
    
    try {
      await adminUtils.logSecurityEvent('admin_panel_data_access');
      
      // Fetch subscribers data
      console.log("AdminPanel: Fetching subscribers...");
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
        toast({
          title: "خطأ في جلب بيانات المشتركين",
          description: "حدث خطأ أثناء جلب بيانات المشتركين",
          variant: "destructive"
        });
        setSubscribers([]);
      } else {
        console.log("AdminPanel: Subscribers fetched:", subscribersData?.length ?? 0);
        setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
      }
      
      // Fetch newsletters data
      console.log("AdminPanel: Fetching newsletters...");
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (newslettersError) {
        console.error('Error fetching newsletters:', newslettersError);
        toast({
          title: "خطأ في جلب بيانات النشرات الإخبارية",
          description: "حدث خطأ أثناء جلب بيانات النشرات الإخبارية",
          variant: "destructive"
        });
        setNewsletters([]);
      } else {
        console.log("AdminPanel: Newsletters fetched:", newslettersData?.length ?? 0);
        setNewsletters(Array.isArray(newslettersData) ? newslettersData : []);
      }
      
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setDataLoading(false);
    }
  };

  // Simplified auth and data loading effect
  useEffect(() => {
    console.log("AdminPanel: Auth state changed", { authLoading, user: !!user, isAdmin });
    
    if (authLoading) {
      console.log("AdminPanel: Still loading auth...");
      return;
    }

    if (!user) {
      console.log("AdminPanel: No user, redirecting...");
      navigate('/admin-control');
      return;
    }

    if (!isAdmin) {
      console.log("AdminPanel: User is not admin, showing access denied");
      setDataLoading(false);
      return;
    }

    // User is authenticated and is admin, fetch data
    console.log("AdminPanel: User is admin, fetching data...");
    fetchData();
  }, [authLoading, user, isAdmin, navigate]);

  // Handle refresh
  const handleRefreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">جارٍ التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminHeader user={user} onLogout={handleSignOut} />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-500 border-2">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700">غير مصرح</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xl mb-4">ليس لديك صلاحيات الوصول إلى لوحة التحكم</p>
                <p className="mb-6 text-gray-600">يرجى التواصل مع مسؤول النظام للحصول على الصلاحيات المناسبة.</p>
                <Button onClick={handleSignOut} variant="outline" className="mx-auto">
                  تسجيل الخروج
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader user={user} onLogout={handleSignOut} />
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
        
        <div className="space-y-6">
          <NewslettersTable 
            newsletters={newsletters}
            formatDate={formatDate}
          />
          <SubscribersTable 
            subscribers={subscribers} 
            formatDate={formatDate}
            onRefresh={handleRefreshData}
            isRefreshing={refreshing}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminControlPanel;

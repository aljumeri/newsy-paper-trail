
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StatisticsCards from '@/components/admin/StatisticsCards';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useFormatDate from '@/hooks/useFormatDate';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import useAdminAuth from '@/hooks/useAdminAuth';
import { RefreshCw, Plus } from 'lucide-react';
import DashboardHeader from '@/components/admin/DashboardHeader';

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

const AdminControlPanel = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  const { toast } = useToast();
  const domain = window.location.hostname;
  
  // Use our admin auth hook
  const { user, isAdmin, loading, handleSignOut } = useAdminAuth();

  // Log panel information
  useEffect(() => {
    console.log("AdminControlPanel: Component mounted");
    console.log("AdminControlPanel: Current domain:", domain);
    console.log("AdminControlPanel: Current path:", window.location.pathname);
    console.log("AdminControlPanel: Auth state - isAdmin:", isAdmin, "user:", user ? "exists" : "null", "loading:", loading);
  }, [domain, isAdmin, loading, user]);

  // Redirect if not admin
  useEffect(() => {
    console.log("AdminControlPanel: Checking auth permissions");
    
    if (!loading) {
      console.log("AdminControlPanel: Auth loading complete, user:", user?.email, "isAdmin:", isAdmin);
      
      if (!isAdmin && user === null) {
        console.log("AdminControlPanel: Unauthorized access, redirecting to login");
        toast({
          title: "صلاحيات غير كافية",
          description: "يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة",
          variant: "destructive"
        });
        navigate('/admin-control');
      } else if (!loading && isAdmin && user !== null) {
        console.log("AdminControlPanel: Authorized access, fetching data");
        fetchData();
      }
    }
  }, [isAdmin, loading, navigate, toast, user, domain]);

  const fetchData = async () => {
    setDataLoading(true);
    console.log("AdminControlPanel: Fetching admin dashboard data...");
    
    try {
      // Direct query to fetch subscribers
      console.log("AdminControlPanel: Fetching subscribers data...");
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
        toast({
          title: "خطأ في جلب بيانات المشتركين",
          description: subscribersError.message,
          variant: "destructive"
        });
      } else {
        console.log("AdminControlPanel: Successfully fetched subscribers data:", subscribersData);
        setSubscribers(subscribersData || []);
      }
      
      // Direct query to fetch newsletters
      console.log("AdminControlPanel: Fetching newsletters data...");
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (newslettersError) {
        console.error('Error fetching newsletters:', newslettersError);
        toast({
          title: "خطأ في جلب النشرات الإخبارية",
          description: newslettersError.message,
          variant: "destructive"
        });
      } else {
        console.log("AdminControlPanel: Successfully fetched newsletters data:", newslettersData);
        setNewsletters(newslettersData || []);
      }
    } catch (error: any) {
      console.error('Unexpected error fetching data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  };
  
  // Add manual refresh button functionality
  const handleRefreshData = () => {
    console.log("AdminControlPanel: Manual refresh requested");
    setRefreshing(true);
    fetchData();
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-xl font-bold mb-2">جارٍ التحقق من الصلاحيات...</p>
          <p className="text-gray-500">يرجى الانتظار قليلاً</p>
          <p className="mt-3 text-blue-600 font-bold">الموقع الحالي: {domain}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} handleSignOut={handleSignOut} />
      
      <div className="container py-8">
        <div className="bg-white p-4 mb-4 rounded-lg shadow border border-blue-300">
          <p className="text-lg font-bold">معلومات التصحيح:</p>
          <p>الموقع الحالي: {domain}</p>
          <p>حالة المستخدم: {user ? 'متصل' : 'غير متصل'}</p>
          <p>البريد الإلكتروني: {user?.email || 'غير متاح'}</p>
          <p>المسؤول: {isAdmin ? 'نعم' : 'لا'}</p>
          <Button 
            onClick={handleRefreshData}
            disabled={refreshing}
            className="mt-2"
            variant="outline"
            size="sm"
          >
            {refreshing ? 'جارِ التحديث...' : 'تحديث البيانات'} {!refreshing && <RefreshCw className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        <StatisticsCards 
          subscribersCount={subscribers.length}
          newslettersCount={newsletters.length}
          isLoading={dataLoading}
        />
        
        <Tabs defaultValue="subscribers">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="subscribers">المشتركين</TabsTrigger>
            <TabsTrigger value="newsletters">النشرات الإخبارية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscribers">
            <SubscribersTable 
              subscribers={subscribers} 
              formatDate={formatDate} 
            />
          </TabsContent>
          
          <TabsContent value="newsletters">
            <NewslettersTable 
              newsletters={newsletters}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminControlPanel;

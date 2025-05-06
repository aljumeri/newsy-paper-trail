
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
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  const { toast } = useToast();
  
  // Use our improved admin auth hook
  const { user, isAdmin, loading, handleSignOut } = useAdminAuth();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin && user === null) {
      toast({
        title: "صلاحيات غير كافية",
        description: "يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة",
        variant: "destructive"
      });
      navigate('/admin-control');
    } else if (!loading && isAdmin && user !== null) {
      fetchData();
    }
  }, [isAdmin, loading, navigate, toast, user]);

  const fetchData = async () => {
    setDataLoading(true);
    console.log("Fetching admin dashboard data...");
    
    try {
      // Fetch subscribers with explicit debug logging
      console.log("Fetching subscribers data...");
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
        console.log("Successfully fetched subscribers data:", subscribersData);
        // Ensure we have an array, even if empty
        setSubscribers(subscribersData || []);
      }
      
      // Fetch newsletters
      console.log("Fetching newsletters data...");
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
        console.log("Successfully fetched newsletters data:", newslettersData);
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
    }
  };
  
  // Add manual refresh button functionality
  const handleRefreshData = () => {
    console.log("Manual refresh requested");
    fetchData();
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-xl font-bold mb-2">جارٍ التحقق من الصلاحيات...</p>
          <p className="text-gray-500">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم المسؤول</h1>
            <p className="text-sm text-gray-500">مرحبًا، {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin-control/compose')}
            >
              إنشاء نشرة إخبارية جديدة
            </Button>
            <Button 
              variant="outline"
              onClick={handleRefreshData}
            >
              تحديث البيانات
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
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

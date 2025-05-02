
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/admin/DashboardHeader';
import StatisticsCards from '@/components/admin/StatisticsCards';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useAdminAuth from '@/hooks/useAdminAuth';
import useAdminDashboardData from '@/hooks/useAdminDashboardData';
import useFormatDate from '@/hooks/useFormatDate';
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, loading: authLoading, handleSignOut } = useAdminAuth();
  const { subscribers, newsletters, loading: dataLoading } = useAdminDashboardData(user);
  const { formatDate } = useFormatDate();
  const { toast } = useToast();

  const loading = authLoading || dataLoading;

  useEffect(() => {
    // Log when component mounts for debugging
    console.log("AdminDashboard component mounted");
    console.log("Auth loading:", authLoading, "Data loading:", dataLoading);
    console.log("Current user:", user?.email);
    
    return () => {
      console.log("AdminDashboard component unmounted");
    };
  }, [authLoading, dataLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-xl font-bold mb-2">جارٍ التحقق من الجلسة...</p>
          <p className="text-gray-500">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If no user after auth loading completed, redirect will happen in the hook
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-xl font-bold mb-2">جلسة غير صالحة</p>
          <p className="text-gray-500">جاري إعادة التوجيه إلى صفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} handleSignOut={handleSignOut} />
      
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

export default AdminDashboard;

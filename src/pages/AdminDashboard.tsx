
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/admin/DashboardHeader';
import StatisticsCards from '@/components/admin/StatisticsCards';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useAdminAuth from '@/hooks/useAdminAuth';
import useAdminDashboardData from '@/hooks/useAdminDashboardData';
import useFormatDate from '@/hooks/useFormatDate';

const AdminDashboard = () => {
  const { user, loading: authLoading, handleSignOut } = useAdminAuth();
  const { subscribers, newsletters, loading: dataLoading } = useAdminDashboardData(user);
  const { formatDate } = useFormatDate();

  const loading = authLoading || dataLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">جارٍ التحميل...</p>
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

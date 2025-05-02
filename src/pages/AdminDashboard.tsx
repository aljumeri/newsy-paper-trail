
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/admin/DashboardHeader';
import StatisticsCards from '@/components/admin/StatisticsCards';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useAdminAuth from '@/hooks/useAdminAuth';
import useAdminDashboardData from '@/hooks/useAdminDashboardData';
import useFormatDate from '@/hooks/useFormatDate';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { formatDate } = useFormatDate();
  const { toast } = useToast();
  
  // Simplified auth check
  useEffect(() => {
    console.log("AdminDashboard: Checking authentication");
    
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          window.location.href = '/admin';
          return;
        }
        
        if (!data.session) {
          console.log("No active session, redirecting to login");
          window.location.href = '/admin';
          return;
        }
        
        console.log("User authenticated:", data.session.user);
        setUser(data.session.user);
        setIsLoading(false);
      } catch (e) {
        console.error("Auth check failed:", e);
        window.location.href = '/admin';
      }
    };
    
    checkAuth();
  }, []);
  
  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AdminDashboard: Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        window.location.href = '/admin';
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: "حدث خطأ أثناء تسجيل الخروج.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!",
      });
      
      window.location.href = '/admin';
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج.",
        variant: "destructive"
      });
    }
  };
  
  // Get dashboard data only when user is authenticated
  const { subscribers, newsletters, loading: dataLoading, error } = useAdminDashboardData(user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-xl font-bold mb-2">جارٍ التحقق من الجلسة...</p>
          <p className="text-gray-500">يرجى الانتظار قليلاً</p>
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

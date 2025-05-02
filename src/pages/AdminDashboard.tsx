
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/admin/DashboardHeader';
import StatisticsCards from '@/components/admin/StatisticsCards';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useFormatDate from '@/hooks/useFormatDate';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { formatDate } = useFormatDate();
  const { toast } = useToast();
  
  // Check session on mount using a callback to prevent stale closures
  const checkSession = useCallback(async () => {
    console.log("AdminDashboard: Checking for active session");
    
    try {
      // Direct session check
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("AdminDashboard session check error:", error);
        // Redirect to login on error
        window.location.href = '/admin';
        return;
      }
      
      if (!data.session) {
        console.log("AdminDashboard: No active session found, redirecting to login");
        // Redirect to login if no session
        window.location.href = '/admin';
        return;
      }
      
      console.log("AdminDashboard: Active session found:", data.session.user.email);
      setUser(data.session.user);
      setIsLoading(false);
      setSessionCheckComplete(true);
      
      // Fetch dashboard data only after session check is successful
      await fetchDashboardData(data.session.user);
    } catch (error) {
      console.error("AdminDashboard session check failed:", error);
      window.location.href = '/admin';
    }
  }, []);
  
  useEffect(() => {
    const setUpAuthStateListener = () => {
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed in AdminDashboard:", event);
        
        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, redirecting to login");
          window.location.href = '/admin';
          return;
        }
        
        // Update user state for other auth events
        if (session) {
          setUser(session.user);
        }
      });
      
      return subscription;
    };
    
    const subscription = setUpAuthStateListener();
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);
  
  // Fetch dashboard data
  const fetchDashboardData = async (user: any) => {
    if (!user) return;
    
    setDataLoading(true);
    console.log("Fetching dashboard data for user:", user.email);
    
    try {
      // Fetch subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subscribersError) {
        console.error("Error fetching subscribers:", subscribersError);
        toast({
          title: "خطأ في جلب البيانات",
          description: subscribersError.message,
          variant: "destructive"
        });
      } else {
        console.log("Fetched subscribers:", subscribersData?.length || 0);
        setSubscribers(subscribersData || []);
      }
      
      // Fetch newsletters
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (newslettersError) {
        console.error("Error fetching newsletters:", newslettersError);
        toast({
          title: "خطأ في جلب البيانات",
          description: newslettersError.message,
          variant: "destructive"
        });
      } else {
        console.log("Fetched newsletters:", newslettersData?.length || 0);
        setNewsletters(newslettersData || []);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message || "حدث خطأ غير معروف",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };
  
  // Handle sign out with improved error handling
  const handleSignOut = async () => {
    try {
      console.log("Signing out user...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log("Sign out successful");
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!"
      });
      
      // Use direct navigation for reliability
      window.location.href = '/admin';
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message || "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive"
      });
    }
  };

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

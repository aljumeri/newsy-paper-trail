
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
import { RefreshCw } from 'lucide-react';
import DashboardHeader from '@/components/admin/DashboardHeader';
import { User } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  const { toast } = useToast();
  
  // Check auth state directly in this component with timeout for network issues
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AdminPanel: Checking authentication");
        
        // Add a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log("AdminPanel: Auth check timeout reached");
          setAuthChecking(false);
          navigate('/admin-control');
        }, 5000); // 5 seconds timeout
        
        const { data, error } = await supabase.auth.getSession();
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Auth check error:", error);
          navigate('/admin-control');
          return;
        }
        
        if (!data.session) {
          console.log("AdminPanel: No session found, redirecting to login");
          navigate('/admin-control');
          return;
        }
        
        // Set user
        setUser(data.session.user);
        
        // Check admin status directly by email pattern
        const email = data.session.user.email?.toLowerCase() || '';
        const isAdminUser = email.includes('admin') || 
                          email === 'test@example.com' || 
                          email.endsWith('@supabase.com');
        
        console.log("AdminPanel: Admin check result:", isAdminUser);
        setIsAdmin(isAdminUser);
        
        if (!isAdminUser) {
          console.log("AdminPanel: User is not admin, redirecting");
          toast({
            title: "صلاحيات غير كافية",
            description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          navigate('/admin-control');
          return;
        }
        
        setAuthChecking(false);
        fetchData();
      } catch (err) {
        console.error("Unexpected auth error:", err);
        navigate('/admin-control');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const fetchData = async () => {
    setDataLoading(true);
    console.log("AdminPanel: Fetching admin dashboard data...");
    
    try {
      // Direct query to fetch subscribers
      console.log("AdminPanel: Fetching subscribers data...");
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
        console.log("AdminPanel: Successfully fetched subscribers data:", subscribersData);
        setSubscribers(subscribersData as any || []);
      }
      
      // Direct query to fetch newsletters
      console.log("AdminPanel: Fetching newsletters data...");
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
        console.log("AdminPanel: Successfully fetched newsletters data:", newslettersData);
        setNewsletters(newslettersData as any || []);
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
    console.log("AdminPanel: Manual refresh requested");
    setRefreshing(true);
    fetchData();
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      console.log("AdminPanel: Signing out user...");
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
      
      navigate('/admin-control');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج.",
        variant: "destructive"
      });
    }
  };

  // Show loading state while checking auth
  if (authChecking) {
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
      <DashboardHeader user={user} handleSignOut={handleSignOut} />
      
      <div className="container py-8">
        <div className="bg-white p-4 mb-4 rounded-lg shadow border border-blue-300">
          <p className="text-lg font-bold">معلومات التصحيح:</p>
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

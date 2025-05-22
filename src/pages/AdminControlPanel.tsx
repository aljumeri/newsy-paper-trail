
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
  vendor?: string | null;
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
  
  // Handle data fetching function declaration - before useEffect to avoid reference issues
  const fetchData = async () => {
    console.log("AdminPanel: Beginning data fetch process...");
    setDataLoading(true);
    
    try {
      console.log("AdminPanel: Fetching subscribers data...");
      
      // Directly fetch subscribers data with explicit debugging
      // Directly fetch subscribers data with explicit debugging
const { data: subscribersData, error: subscribersError } = await supabase
  .from('subscribers')
  .select('*')
  .order('created_at', { ascending: false });

console.log("AdminPanel: Subscribers query completed");

if (subscribersError) {
  console.error('Error fetching subscribers:', subscribersError);
  toast({
    title: "خطأ في جلب بيانات المشتركين",
    description: subscribersError.message,
    variant: "destructive"
  });
  
  // Even if there's an error, set subscribers to empty array to avoid undefined
  setSubscribers([]);
  
  // Check if this is a permissions error and show more specific message
  if (subscribersError.code === '42501' || subscribersError.message.includes('permission')) {
    console.error('This appears to be a permissions error. Please check RLS policies.');
    toast({
      title: "خطأ في الصلاحيات",
      description: "يرجى التحقق من إعدادات الصلاحيات في Supabase",
      variant: "destructive"
    });
  }
} else {
  console.log("AdminPanel: Subscribers data fetched successfully:", subscribersData);
  console.log("AdminPanel: Number of subscribers:", subscribersData?.length ?? 0);
  
  // Ensure we're setting even if empty array (but not null/undefined)
  setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
}

      
      // Fetch newsletters data
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
        console.log("AdminPanel: Newsletters data fetched successfully:", newslettersData);
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

  // Check auth state - separate effect for clarity
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AdminPanel: Checking authentication");

        // Set a timeout to prevent hanging on network issues
        const timeoutId = setTimeout(() => {
          console.log("AdminPanel: Auth check timeout reached");
          setAuthChecking(false);
          navigate('/admin-control');
        }, 5000);

        const { data, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);

        if (error) {
          console.error("Auth check error:", error);
          navigate('/admin-control');
          return;
        }

        if (!data.session) {
          console.log("AdminPanel: No session, redirecting");
          navigate('/admin-control');
          return;
        }

        setUser(data.session.user);
        
        // Check admin status by email pattern
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
          
          // Sign out non-admin users
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            console.error("Sign out error during admin check:", signOutError);
          }
          
          navigate('/admin-control');
          return;
        }
        
        // If we're here, user is authenticated and is admin
        setAuthChecking(false);
        fetchData(); // Fetch data once authentication is confirmed
      } catch (err) {
        console.error("Unexpected auth error:", err);
        navigate('/admin-control');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Add listener for auth state changes in a separate effect
  useEffect(() => {
    console.log("AdminPanel: Setting up auth state change listener");
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        console.log("AdminPanel: Auth state changed:", event);
        console.log("AdminPanel: Session user:", session.user.email);
        setUser(session.user);
        
        // If user is logged in and we're on the panel page, fetch data
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin-control/panel')) {
          console.log("AdminPanel: On panel page, fetching data due to auth change");
          fetchData();
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("AdminPanel: User signed out");
        setUser(null);
        navigate('/admin-control');
      }
    });

    return () => {
      console.log("AdminPanel: Cleaning up auth listener");
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);
  
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
          <p>عدد المشتركين: {subscribers.length}</p>
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

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useFormatDate from '@/hooks/useFormatDate';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminActionCard from '@/components/admin/AdminActionCard';

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
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  const { toast } = useToast();
  
  // Add the checkAdminStatus function
  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log("AdminPanel: No session found during admin check");
        return false;
      }
      
      // Check admin status by email pattern
      const email = data.session.user.email?.toLowerCase() || '';
      console.log("AdminPanel: Checking admin status for email:", email);
      
      const isAdmin = email.includes('admin') || 
             email === 'test@example.com' || 
             email === 'aljumeri@gmail.com' ||
             email === 'su.alshehri.ai@gmail.com' ||
             email.endsWith('@solo4ai.com');
             
      console.log("AdminPanel: Admin status check result:", isAdmin);
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  
  // Handle data fetching function using useCallback to avoid dependency issues
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    
    try {
      console.log("AdminPanel: Fetching subscribers data...");
      
      // Check admin status first to avoid unnecessary queries
      const adminStatus = await checkAdminStatus();
      if (!adminStatus) {
        setDataLoading(false);
        setError("You don't have admin privileges");
        return;
      }
      
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
        
        // Log each subscriber for debugging
        if (Array.isArray(subscribersData)) {
          subscribersData.forEach((sub, index) => {
            console.log(`Subscriber ${index + 1}:`, sub.email, sub.created_at);
          });
        }
      }
      
      // Fetch newsletters data
      console.log("AdminPanel: Fetching newsletters data...");
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log("AdminPanel: Newsletters query completed");
      
      if (newslettersError) {
        console.error('Error fetching newsletters:', newslettersError);
        toast({
          title: "خطأ في جلب بيانات النشرات الإخبارية",
          description: newslettersError.message,
          variant: "destructive"
        });
        
        // Set newsletters to empty array to avoid undefined
        setNewsletters([]);
      } else {
        console.log("AdminPanel: Newsletters data fetched successfully:", newslettersData);
        setNewsletters(Array.isArray(newslettersData) ? newslettersData : []);
      }
      
      setDataLoading(false);
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setDataLoading(false);
    }
  }, [toast]); // Only depend on toast to avoid circular dependencies

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
        const isAdminUser = await checkAdminStatus();
        
        console.log("AdminPanel: Admin check result:", isAdminUser);
        setIsAdmin(isAdminUser);
        
        if (!isAdminUser) {
          console.log("AdminPanel: User is not admin, showing access denied");
          setAuthChecking(false);
          // We'll stay on this page but show an access denied message
          return;
        }
        
        setAuthChecking(false);
        fetchData();
      } catch (error: unknown) {
        console.error("Auth check error:", error);
        toast({
          title: "خطأ في التحقق",
          description: error instanceof Error ? error.message : 'حدث خطأ أثناء التحقق من الصلاحيات',
          variant: "destructive"
        });
        navigate('/admin-control');
      }
    };
    
    checkAuth();
  }, [navigate, toast, fetchData]);

  // Handle refresh button
  const handleRefreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };
  
  // Handle logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
      navigate('/admin-control');
  };

  // Show loading state while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">جارٍ التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Return access denied UI if user is logged in but doesn't have admin privileges
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

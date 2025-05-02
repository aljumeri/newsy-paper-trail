
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StatisticsCards from '@/components/admin/StatisticsCards';
import SubscribersTable from '@/components/admin/SubscribersTable';
import NewslettersTable from '@/components/admin/NewslettersTable';
import useFormatDate from '@/hooks/useFormatDate';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

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
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { formatDate } = useFormatDate();
  const { toast } = useToast();

  // Check for existing session and fetch user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          redirectToLogin();
          return;
        }
        
        if (!data.session) {
          console.log('No active session found');
          redirectToLogin();
          return;
        }
        
        const currentUser = data.session.user;
        setUser(currentUser);
        
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase.rpc(
          'get_admin_status',
          { user_id: currentUser.id }
        );
        
        if (adminError) {
          console.error('Admin status check error:', adminError);
          toast({
            title: "خطأ في التحقق من صلاحيات المسؤول",
            description: adminError.message,
            variant: "destructive"
          });
          redirectToLogin();
          return;
        }
        
        setIsAdmin(adminData);
        
        if (!adminData) {
          console.log('User is not an admin');
          toast({
            title: "غير مصرح",
            description: "ليس لديك صلاحيات للوصول إلى لوحة التحكم",
            variant: "destructive"
          });
          redirectToLogin();
          return;
        }
        
        setIsChecking(false);
        fetchData(currentUser);
      } catch (err) {
        console.error('Auth check failed:', err);
        redirectToLogin();
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        redirectToLogin();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const redirectToLogin = () => {
    navigate('/admin-control', { replace: true });
  };

  const fetchData = async (currentUser: User) => {
    setLoading(true);
    
    try {
      // Fetch subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
        toast({
          title: "خطأ في جلب البيانات",
          description: subscribersError.message,
          variant: "destructive"
        });
      } else {
        setSubscribers(subscribersData as Subscriber[]);
      }
      
      // Fetch newsletters
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (newslettersError) {
        console.error('Error fetching newsletters:', newslettersError);
        toast({
          title: "خطأ في جلب البيانات",
          description: newslettersError.message,
          variant: "destructive"
        });
      } else {
        setNewsletters(newslettersData as Newsletter[]);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!",
      });
      
      navigate('/admin-control', { replace: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  if (isChecking) {
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
      <div className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم المسؤول</h1>
            <p className="text-sm text-gray-500">مرحبًا، {user?.email}</p>
            {isAdmin && <p className="text-xs text-green-600">حساب مسؤول</p>}
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
          isLoading={loading}
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

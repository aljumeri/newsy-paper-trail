
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST to avoid session handling issues
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, navigating to login page");
        navigate('/admin', { replace: true });
      } else if (event === 'SIGNED_IN' && session) {
        console.log("User signed in:", session.user.email);
        setUser(session.user);
        await fetchData();
      }
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      console.log("AdminDashboard: Checking session status...");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        navigate('/admin', { replace: true });
        return;
      }
      
      if (!data.session) {
        console.log("AdminDashboard: No session found, redirecting to login");
        navigate('/admin', { replace: true });
        return;
      }
      
      console.log("AdminDashboard: Session found, user:", data.session.user.email);
      setUser(data.session.user);
      
      // Load subscribers and newsletters
      await fetchData();
    };
    
    checkSession();
    
    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch subscribers - without depending on admin_users table
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
        throw subscribersError;
      }
      
      console.log("Fetched subscribers:", subscribersData?.length || 0);
      setSubscribers(subscribersData || []);
      
      // Fetch newsletters - without depending on admin_users table
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (newslettersError) {
        console.error('Error fetching newsletters:', newslettersError);
        throw newslettersError;
      }
      
      console.log("Fetched newsletters:", newslettersData?.length || 0);
      setNewsletters(newslettersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      console.log("Signing out user...");
      await supabase.auth.signOut();
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج.",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
      <div className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم المسؤول</h1>
            <p className="text-sm text-gray-500">مرحبًا، {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/compose')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>المشتركين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subscribers.length}</div>
              <p className="text-gray-500">إجمالي عدد المشتركين في النشرة الإخبارية</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>النشرات الإخبارية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{newsletters.length}</div>
              <p className="text-gray-500">إجمالي عدد النشرات الإخبارية المنشورة</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="subscribers">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="subscribers">المشتركين</TabsTrigger>
            <TabsTrigger value="newsletters">النشرات الإخبارية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>قائمة المشتركين</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4">تاريخ الاشتراك</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length > 0 ? (
                      subscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{subscriber.email}</td>
                          <td className="py-3 px-4">{formatDate(subscriber.created_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-4 text-center">
                          لا يوجد مشتركين بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="newsletters">
            <Card>
              <CardHeader>
                <CardTitle>النشرات الإخبارية</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">العنوان</th>
                      <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                      <th className="text-right py-3 px-4">تاريخ الإرسال</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletters.length > 0 ? (
                      newsletters.map((newsletter) => (
                        <tr key={newsletter.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{newsletter.subject}</td>
                          <td className="py-3 px-4">{formatDate(newsletter.created_at)}</td>
                          <td className="py-3 px-4">
                            {newsletter.sent_at ? formatDate(newsletter.sent_at) : 'لم يتم الإرسال بعد'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/admin/edit/${newsletter.id}`)}
                              >
                                تعديل
                              </Button>
                              {!newsletter.sent_at && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/admin/send/${newsletter.id}`)}
                                >
                                  إرسال
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center">
                          لم يتم إنشاء أي نشرة إخبارية بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

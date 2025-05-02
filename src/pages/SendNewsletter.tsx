
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SendNewsletter = () => {
  const [newsletter, setNewsletter] = useState<any>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      // Check if user is authenticated and admin
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/admin');
        return;
      }
      
      // Verify if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.session.user.id)
        .single();
      
      if (adminError || !adminData) {
        await supabase.auth.signOut();
        navigate('/admin');
        return;
      }
      
      // Load newsletter data
      if (id) {
        try {
          // Load newsletter
          const { data: newsletterData, error: newsletterError } = await supabase
            .from('newsletters')
            .select('*')
            .eq('id', id)
            .single();
          
          if (newsletterError) throw newsletterError;
          
          if (newsletterData) {
            // Check if newsletter is already sent
            if (newsletterData.sent_at) {
              toast({
                title: "تم إرسال النشرة الإخبارية بالفعل",
                description: "لا يمكن إرسال النشرة الإخبارية مرة أخرى",
                variant: "destructive"
              });
              navigate('/admin/dashboard');
              return;
            }
            
            setNewsletter(newsletterData);
            
            // Count subscribers
            const { count, error: countError } = await supabase
              .from('subscribers')
              .select('*', { count: 'exact', head: true });
            
            if (countError) throw countError;
            
            setSubscriberCount(count || 0);
          } else {
            toast({
              title: "لم يتم العثور على النشرة الإخبارية",
              description: "لا يمكن العثور على النشرة الإخبارية المطلوبة",
              variant: "destructive"
            });
            navigate('/admin/dashboard');
          }
        } catch (error) {
          console.error('Error loading data:', error);
          toast({
            title: "خطأ في التحميل",
            description: "حدث خطأ أثناء تحميل البيانات",
            variant: "destructive"
          });
          navigate('/admin/dashboard');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkSessionAndLoadData();
  }, [id, navigate, toast]);

  const handleSendNewsletter = async () => {
    setIsSending(true);
    
    try {
      // In a real implementation, here you would:
      // 1. Send emails to all subscribers
      // 2. For now, we'll just mark the newsletter as sent
      
      const { error } = await supabase
        .from('newsletters')
        .update({ 
          sent_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال النشرة الإخبارية إلى ${subscriberCount} مشتركين`
      });
      
      // Note: In a real implementation, you would want to set up a Supabase Edge Function 
      // to handle the actual email sending asynchronously to all subscribers
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال النشرة الإخبارية",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
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
            <h1 className="text-2xl font-bold">إرسال النشرة الإخبارية</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/dashboard')}
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>إرسال النشرة الإخبارية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-white p-4 border rounded-md">
                <h2 className="text-2xl font-bold mb-4">{newsletter?.subject}</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: newsletter?.content.replace(/\n/g, '<br>') }}></div>
              </div>
              
              <div className="bg-blue-50 p-4 border border-blue-200 rounded-md">
                <h3 className="font-medium text-blue-700 mb-2">معلومات الإرسال</h3>
                <p>سيتم إرسال هذه النشرة الإخبارية إلى <strong>{subscriberCount}</strong> مشترك.</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/admin/edit/${id}`)}
                >
                  تعديل النشرة الإخبارية
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isSending || subscriberCount === 0}>
                      {isSending ? "جارِ الإرسال..." : "إرسال النشرة الإخبارية الآن"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الإرسال</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من أنك تريد إرسال هذه النشرة الإخبارية إلى {subscriberCount} مشترك؟ لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSendNewsletter}>إرسال</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendNewsletter;

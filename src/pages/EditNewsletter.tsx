
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const EditNewsletter = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const checkSessionAndLoadNewsletter = async () => {
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
          const { data: newsletter, error } = await supabase
            .from('newsletters')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (newsletter) {
            setSubject(newsletter.subject);
            setContent(newsletter.content);
          } else {
            toast({
              title: "لم يتم العثور على النشرة الإخبارية",
              description: "لا يمكن العثور على النشرة الإخبارية المطلوبة",
              variant: "destructive"
            });
            navigate('/admin/dashboard');
          }
        } catch (error) {
          console.error('Error loading newsletter:', error);
          toast({
            title: "خطأ في التحميل",
            description: "حدث خطأ أثناء تحميل النشرة الإخبارية",
            variant: "destructive"
          });
          navigate('/admin/dashboard');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkSessionAndLoadNewsletter();
  }, [id, navigate, toast]);

  const handleUpdateNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('newsletters')
        .update({ subject, content })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث النشرة الإخبارية"
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating newsletter:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث النشرة الإخبارية",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
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
            <h1 className="text-2xl font-bold">تعديل النشرة الإخبارية</h1>
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
            <CardTitle>تعديل النشرة الإخبارية</CardTitle>
          </CardHeader>
          <CardContent>
            {isPreview ? (
              <div className="space-y-4">
                <div className="bg-white p-4 border rounded-md">
                  <h2 className="text-2xl font-bold mb-4">{subject}</h2>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handlePreview}>
                    تعديل
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">عنوان النشرة الإخبارية</label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="أدخل عنوان النشرة الإخبارية"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">محتوى النشرة الإخبارية</label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="أدخل محتوى النشرة الإخبارية..."
                    className="min-h-[300px] w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك استخدام أسلوب النص العادي. سيتم تحويل السطور الجديدة تلقائيًا.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handlePreview}>
                    معاينة
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={isSaving}>
                        {isSaving ? "جارِ التحديث..." : "تحديث النشرة الإخبارية"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تحديث النشرة الإخبارية</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من أنك تريد تحديث هذه النشرة الإخبارية؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpdateNewsletter}>تحديث</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditNewsletter;

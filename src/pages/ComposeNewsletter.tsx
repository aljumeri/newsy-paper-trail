
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ComposeNewsletter = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
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
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSaveNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('newsletters')
        .insert([
          { subject, content, created_by: sessionData.session.user.id }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ النشرة الإخبارية"
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving newsletter:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ النشرة الإخبارية",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">إنشاء نشرة إخبارية جديدة</h1>
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
            <CardTitle>إنشاء نشرة إخبارية جديدة</CardTitle>
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
                      <Button disabled={isLoading}>
                        {isLoading ? "جارِ الحفظ..." : "حفظ النشرة الإخبارية"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حفظ النشرة الإخبارية</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من أنك تريد حفظ هذه النشرة الإخبارية؟ يمكنك تعديلها لاحقًا وإرسالها إلى المشتركين من لوحة التحكم.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveNewsletter}>حفظ</AlertDialogAction>
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

export default ComposeNewsletter;

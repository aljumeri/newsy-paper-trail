
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import NewsletterHeader from '@/components/newsletter/NewsletterHeader';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import NewsletterPreview from '@/components/newsletter/NewsletterPreview';
import { useNewsletterEditor } from '@/hooks/useNewsletterEditor';

const EditNewsletter = () => {
  const {
    subject,
    setSubject,
    content,
    setContent,
    isLoading: editorLoading,
    isSaving,
    isPreview,
    handleUpdateNewsletter,
    handlePreview
  } = useNewsletterEditor();
  
  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check auth with timeout to prevent infinite loading
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log("EditNewsletter: Auth check timeout reached");
          toast({
            title: "مهلة التحقق انتهت",
            description: "يرجى تسجيل الدخول مرة أخرى",
            variant: "destructive"
          });
          navigate('/admin-control');
        }, 5000);
        
        const { data, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (error || !data.session) {
          toast({
            title: "يرجى تسجيل الدخول",
            description: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          navigate('/admin-control');
          return;
        }
        
        // Check admin status by email pattern
        const email = data.session.user.email?.toLowerCase() || '';
        const isAdminUser = email.includes('admin') || 
                            email === 'test@example.com' || 
                            email.endsWith('@supabase.com');
        
        if (!isAdminUser) {
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
      } catch (err) {
        console.error("Auth check error:", err);
        navigate('/admin-control');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  if (authChecking || editorLoading) {
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
      <NewsletterHeader title="تعديل النشرة الإخبارية" />
      
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>تعديل النشرة الإخبارية</CardTitle>
          </CardHeader>
          <CardContent>
            {isPreview ? (
              <NewsletterPreview 
                subject={subject}
                content={content}
                onEdit={handlePreview}
              />
            ) : (
              <div className="space-y-4">
                <NewsletterForm
                  subject={subject}
                  setSubject={setSubject}
                  content={content}
                  setContent={setContent}
                  onSave={() => {}}
                  onPreview={handlePreview}
                  isLoading={isSaving}
                />
                
                <div className="flex justify-end">
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

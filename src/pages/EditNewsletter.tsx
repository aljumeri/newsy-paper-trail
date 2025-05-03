
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import NewsletterHeader from '@/components/newsletter/NewsletterHeader';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import NewsletterPreview from '@/components/newsletter/NewsletterPreview';
import { useNewsletterEditor } from '@/hooks/useNewsletterEditor';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  
  // Use our improved admin auth hook
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect if not admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "صلاحيات غير كافية",
        description: "يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة",
        variant: "destructive"
      });
      navigate('/admin-control');
    }
  }, [isAdmin, authLoading, navigate, toast]);

  if (authLoading || editorLoading) {
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

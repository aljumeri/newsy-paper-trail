
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import NewsletterHeader from '@/components/newsletter/NewsletterHeader';
import NewsletterPreview from '@/components/newsletter/NewsletterPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth, useRequireAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNewsletterEditor } from '@/hooks/useNewsletterEditor';
import { supabase } from '@/integrations/supabase/client';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditNewsletter: React.FC = () => {
  const { user } = useAdminAuth();
  const { isChecking } = useRequireAdminAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const {
    subject,
    setSubject,
    content,
    setContent,
    isLoading: editorLoading,
    isSaving,
    isPreview,
    isDarkMode,
    handleUpdateNewsletter,
    toggleDarkMode,
    handlePreview
  } = useNewsletterEditor();

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  if (isChecking || editorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  const handleSendNewsletter = async () => {
    if (!id) {
      toast({
        title: 'خطأ',
        description: 'معرف النشرة الإخبارية غير متوفر',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    console.log(`Starting newsletter send process for ID: ${id}`);
    
    try {
      // Call the send-newsletter edge function
      console.log('Calling send-newsletter edge function...');
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          newsletterId: id
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send newsletter');
      }

      if (data && data.success) {
        toast({
          title: 'تم الإرسال بنجاح',
          description: data.message || `تم إرسال النشرة الإخبارية إلى ${data.subscribers} مشترك`
        });
        
        // Navigate back to admin panel after successful send
        navigate('/admin-control/panel');
      } else {
        throw new Error(data?.error || 'Failed to send newsletter');
      }

    } catch (err: unknown) {
      console.error('Error sending newsletter:', err);
      const msg = err instanceof Error ? err.message : 'خطأ أثناء الإرسال';
      toast({ 
        title: 'فشل في الإرسال', 
        description: msg, 
        variant: 'destructive' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <NewsletterHeader
        title="تعديل النشرة الإخبارية"
        onThemeToggle={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <div className="container py-8">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">تعديل النشرة الإخبارية</CardTitle>
          </CardHeader>
          <CardContent>
            {isPreview ? (
              <NewsletterPreview subject={subject} content={content} onEdit={handlePreview} />
            ) : (
              <NewsletterForm
                subject={subject}
                setSubject={setSubject}
                content={content}
                setContent={setContent}
                onSave={handleUpdateNewsletter}
                onPreview={handlePreview}
                isSaving={isSaving}
                newsletterId={id}
                onSend={handleSendNewsletter}
                isSending={isSending}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditNewsletter;

import Newsletter from '@/components/newsletter/Newsletter';
import NewsletterHeaderV2 from '@/components/newsletter/NewsletterHeaderV2';
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
    setIsSending(true);
    try {
      // Count subscribers
      const { count, error: countErr } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });
      if (countErr) throw countErr;
      // Mark the newsletter as sent
      const { error: updateErr } = await supabase
        .from('newsletters')
        .update({
          sent_at: new Date().toISOString(),
          recipients_count: count || 0,
          status: 'sent'
        })
        .eq('id', id);
      if (updateErr) throw updateErr;
      toast({ title: 'تم الإرسال بنجاح', description: `تم إرسال النشرة إلى ${count} مشترك` });
      navigate('/admin-control/panel');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ أثناء الإرسال';
      toast({ title: 'فشل في الإرسال', description: msg, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <NewsletterHeaderV2
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
              <Newsletter subject={subject} content={content} onEdit={handlePreview} />
            ) : (
              <Newsletter
                subject={subject}
                setSubject={setSubject}
                content={content}
                setContent={setContent}
                onSave={handleUpdateNewsletter}
                onPreview={handlePreview}
                isSaving={isSaving}
                onSend={() => handleSendNewsletter()}
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
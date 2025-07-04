import Newsletter from '@/components/newsletter/Newsletter';
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
    handlePreview,
  } = useNewsletterEditor();

  const [isSending, setIsSending] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [mainTitle, setMainTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [headerDate, setHeaderDate] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!id) return;
    const fetchNewsletter = async () => {
      const { data, error } = await supabase
        .from('newsletters')
        .select('main_title, sub_title, date, content')
        .eq('id', id)
        .single();
      if (error || !data || typeof data !== 'object' || 'code' in data) return;
      const safeData = data as any;
      setMainTitle(prev => prev || safeData.main_title || '');
      setSubTitle(prev => prev || safeData.sub_title || '');
      setHeaderDate(prev => prev || safeData.date || '');
      if (safeData.content) {
        try {
          const parsed = JSON.parse(safeData.content);
          if (Array.isArray(parsed)) setSections(parsed);
        } catch (e) {
          // fallback: legacy HTML
        }
      }
    };
    fetchNewsletter();
  }, [id]);

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
          status: 'sent',
        })
        .eq('id', id);
      if (updateErr) throw updateErr;
      toast({
        title: 'تم الإرسال بنجاح',
        description: `تم إرسال النشرة إلى ${count} مشترك`,
      });
      navigate('/admin-control/panel');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ أثناء الإرسال';
      toast({
        title: 'فشل في الإرسال',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveNewsletter = async () => {
    if (!sections.length) {
      toast({
        title: 'حقول مطلوبة',
        description: 'يرجى إضافة محتوى للنشرة',
        variant: 'destructive',
      });
      return;
    }
    setIsSending(true);
    try {
      const userId = user!.id;
      const { error } = await supabase
        .from('newsletters')
        .update({
          main_title: mainTitle,
          sub_title: subTitle,
          date: headerDate,
          content: JSON.stringify(sections),
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم حفظ النشرة الإخبارية',
      });
      navigate('/admin-control/panel');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'حدث خطأ أثناء حفظ النشرة الإخبارية';
      toast({
        title: 'خطأ في الحفظ',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`min-h-screen  dark:bg-gray-900 pb-8 ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      <div className="container max-w-5xl m-auto">
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-none border-0">
          <CardTitle className="dark:text-white py-6">
            تعديل النشرة الإخبارية
          </CardTitle>

          <Newsletter
            sections={sections}
            setSections={setSections}
            mainTitle={mainTitle}
            subTitle={subTitle}
            date={headerDate}
            readOnly={false}
            onMainTitleChange={setMainTitle}
            onSubTitleChange={setSubTitle}
            onDateChange={setHeaderDate}
          />
          <div className="mt-6 flex justify-end">
            <button
              className="px-6 py-2 ml-auto bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleSaveNewsletter}
              disabled={isSaving}
            >
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ النشرة'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditNewsletter;

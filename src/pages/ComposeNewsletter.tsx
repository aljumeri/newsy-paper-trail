import Newsletter, {
  defaultSections,
} from '@/components/newsletter/Newsletter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth, useRequireAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ComposeNewsletter: React.FC = () => {
  const { user } = useAdminAuth();
  const { isChecking } = useRequireAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [sections, setSections] = useState(defaultSections); // New editor state
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4">جارٍ التحقق من الصلاحيات...</p>
      </div>
    );
  }

  const handleSaveNewsletter = async () => {
    if (!sections.length) {
      toast({
        title: 'حقول مطلوبة',
        description: 'يرجى إضافة محتوى للنشرة',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const userId = user!.id;
      const { error } = await supabase.from('newsletters').insert({
        subject: sections[0]?.title || '',
        content: JSON.stringify(sections),
        created_by: userId,
        created_at: new Date().toISOString(),
      });
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
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen pb-6  dark:bg-gray-900 ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* <NewsletterHeaderV2 /> */}
      <div className="container max-w-5xl m-auto">
        <CardHeader className="py-6">
          <CardTitle className="dark:text-white">
            إنشاء نشرة إخبارية جديدة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Newsletter sections={sections} setSections={setSections} />
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSaveNewsletter}
            disabled={isLoading}
          >
            {isLoading ? 'جارٍ الحفظ...' : 'حفظ النشرة'}
          </button>
        </CardContent>
      </div>
    </div>
  );
};

export default ComposeNewsletter;

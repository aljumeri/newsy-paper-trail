import NewsletterForm from '@/components/newsletter/NewsletterForm';
import NewsletterHeader from '@/components/newsletter/NewsletterHeader';
import NewsletterPreview from '@/components/newsletter/NewsletterPreview';
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

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
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
    if (!subject.trim() || !content.trim()) {
      toast({ title: 'حقول مطلوبة', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const userId = user!.id;
      const { error } = await supabase
        .from('newsletters')
        .insert({ subject, content, created_by: userId, created_at: new Date().toISOString() });
      if (error) throw error;
      toast({ title: 'تم الحفظ بنجاح', description: 'تم حفظ النشرة الإخبارية' });
      navigate('/admin-control/panel');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ النشرة الإخبارية';
      toast({ title: 'خطأ في الحفظ', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <NewsletterHeader
        title="إنشاء نشرة إخبارية جديدة"
        onThemeToggle={() => setIsDarkMode(prev => !prev)}
        isDarkMode={isDarkMode}
      />
      <div className="container py-8">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">إنشاء نشرة إخبارية جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            {isPreview ? (
              <NewsletterPreview subject={subject} content={content} onEdit={() => setIsPreview(false)} />
            ) : (
              <NewsletterForm
                subject={subject}
                setSubject={setSubject}
                content={content}
                setContent={setContent}
                onSave={handleSaveNewsletter}
                onPreview={() => setIsPreview(true)}
                isSaving={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComposeNewsletter;
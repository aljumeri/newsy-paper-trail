
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import refactored components
import useAdminAuth from '@/hooks/useAdminAuth';
import NewsletterHeader from '@/components/newsletter/NewsletterHeader';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import NewsletterPreview from '@/components/newsletter/NewsletterPreview';

const ComposeNewsletter = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use the admin auth hook
  const { user } = useAdminAuth();

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
      // Verify session again before saving
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("User not authenticated");
      }
      
      // Save newsletter
      const { error } = await supabase
        .from('newsletters')
        .insert({
          subject, 
          content, 
          created_by: sessionData.session.user.id
        } as any);
      
      if (error) {
        console.error('Newsletter save error:', error);
        throw error;
      }
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ النشرة الإخبارية"
      });
      
      navigate('/admin-control/panel');
    } catch (error: any) {
      console.error('Error saving newsletter:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ النشرة الإخبارية",
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
      <NewsletterHeader title="إنشاء نشرة إخبارية جديدة" />
      
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>إنشاء نشرة إخبارية جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            {isPreview ? (
              <NewsletterPreview 
                subject={subject}
                content={content}
                onEdit={handlePreview}
              />
            ) : (
              <NewsletterForm
                subject={subject}
                setSubject={setSubject}
                content={content}
                setContent={setContent}
                onSave={handleSaveNewsletter}
                onPreview={handlePreview}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComposeNewsletter;

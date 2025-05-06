
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import refactored components
import NewsletterHeader from '@/components/newsletter/NewsletterHeader';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import NewsletterPreview from '@/components/newsletter/NewsletterPreview';
import useAdminAuth from '@/hooks/useAdminAuth';

const ComposeNewsletter = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use our improved admin auth hook
  const { user, isAdmin, loading } = useAdminAuth();
  
  // Handle admin permission check
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "صلاحيات غير كافية",
        description: "يجب أن تكون مسؤولاً للوصول إلى هذه الصفحة",
        variant: "destructive"
      });
      navigate('/admin-control');
    }
  }, [isAdmin, loading, navigate, toast]);

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
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "خطأ في التحقق",
          description: "يجب أن تكون مسجل الدخول كمسؤول",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      console.log("Attempting to save newsletter with user ID:", userId);
      
      // Save newsletter
      const { error } = await supabase
        .from('newsletters')
        .insert({
          subject, 
          content, 
          created_by: userId
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

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-xl font-bold mb-2">جارٍ التحقق من الصلاحيات...</p>
          <p className="text-gray-500">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

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

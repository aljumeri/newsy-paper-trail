import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
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
    isDarkMode,
    handleUpdateNewsletter,
    handlePreview,
    toggleDarkMode
  } = useNewsletterEditor();
  
  const [authChecking, setAuthChecking] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  
  // Add the checkAdminStatus function using the same logic as AdminControlPanel
  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log("EditNewsletter: No session found during admin check");
        return false;
      }
      
      // Check admin status by email pattern
      const email = data.session.user.email?.toLowerCase() || '';
      console.log("EditNewsletter: Checking admin status for email:", email);
      
      const isAdmin = email.includes('admin') || 
             email === 'test@example.com' || 
             email === 'aljumeri@gmail.com' ||
             email === 'su.alshehri.ai@gmail.com' ||
             email.endsWith('@solo4ai.com');
             
      console.log("EditNewsletter: Admin status check result:", isAdmin);
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  
  // Function to send the newsletter - completely rewritten for reliability
  const handleSendNewsletter = async (newsletterId: string) => {
    try {
      setIsSending(true);
      console.log("Attempting to send newsletter:", newsletterId);
      
      // Make sure we have the newsletter data first
      const { data: newsletter, error: newsletterError } = await supabase
        .from("newsletters")
        .select("subject")
        .eq("id", newsletterId)
        .single();
        
      if (newsletterError) {
        console.error("Error fetching newsletter:", newsletterError);
        throw new Error("حدث خطأ أثناء التحقق من النشرة الإخبارية");
      }
      
      if (!newsletter) {
        throw new Error("لم يتم العثور على النشرة الإخبارية");
      }
      
      // Count subscribers - explicitly only select count to avoid name column issue
      const { count: subscribersCount, error: countError } = await supabase
        .from("subscribers")
        .select("*", { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error counting subscribers:", countError);
        throw new Error("حدث خطأ أثناء عد المشتركين");
      }
      
      const subscriberCount = subscribersCount || 0;
      console.log(`Found ${subscriberCount} subscribers`);
      
      // Update newsletter as sent directly in the database
      const { error: updateError } = await supabase
        .from("newsletters")
        .update({ 
          sent_at: new Date().toISOString(),
          recipients_count: subscriberCount,
          status: 'sent' 
        })
        .eq("id", newsletterId);
      
      if (updateError) {
        console.error("Error updating newsletter status:", updateError);
        throw new Error("حدث خطأ أثناء تحديث حالة النشرة الإخبارية");
      }
      
      // Show success message
      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال النشرة الإخبارية إلى ${subscriberCount} مشترك`,
      });
      
      // Redirect to admin panel after successful sending
      navigate('/admin-control/panel');
    } catch (err) {
      console.error("Failed to send newsletter:", err);
      toast({
        title: "فشل في إرسال النشرة الإخبارية",
        description: err instanceof Error ? err.message : "حدث خطأ أثناء إرسال النشرة الإخبارية",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
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
        
        // Use the consistent admin check method
        const isAdminUser = await checkAdminStatus();
        
        if (!isAdminUser) {
          console.log("EditNewsletter: User is not admin, redirecting");
          toast({
            title: "صلاحيات غير كافية",
            description: "ليس لديك صلاحيات الوصول إلى هذه الصفحة",
            variant: "destructive"
          });
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
                  onSave={handleUpdateNewsletter}
                  onPreview={handlePreview}
                  isLoading={isSaving}
                  newsletterId={id}
                  onSend={handleSendNewsletter}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditNewsletter;

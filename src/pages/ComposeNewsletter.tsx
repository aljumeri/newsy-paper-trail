import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import components
import NewsletterHeader from '@/components/newsletter/NewsletterHeader';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import NewsletterPreview from '@/components/newsletter/NewsletterPreview';

const ComposeNewsletter = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Add the consistent checkAdminStatus function
  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log("ComposeNewsletter: No session found during admin check");
        return false;
      }
      
      // Check admin status by email pattern
      const email = data.session.user.email?.toLowerCase() || '';
      console.log("ComposeNewsletter: Checking admin status for email:", email);
      
      const isAdmin = email.includes('admin') || 
             email === 'test@example.com' || 
             email === 'aljumeri@gmail.com' ||
             email === 'su.alshehri.ai@gmail.com' ||
             email.endsWith('@solo4ai.com');
             
      console.log("ComposeNewsletter: Admin status check result:", isAdmin);
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  
  // Apply theme when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Check auth directly in component with timeout
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log("ComposeNewsletter: Auth check timeout reached");
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
          console.log("ComposeNewsletter: User is not admin, redirecting");
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
      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          subject, 
          content, 
          created_by: userId,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Newsletter save error:', error);
        throw error;
      }
      
      console.log('Newsletter saved successfully:', data);
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ النشرة الإخبارية"
      });
      
      navigate('/admin-control/panel');
    } catch (error: unknown) {
      console.error('Error saving newsletter:', error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء حفظ النشرة الإخبارية";
      toast({
        title: "خطأ في الحفظ",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Show loading state while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-xl font-bold mb-2 dark:text-white">جارٍ التحقق من الصلاحيات...</p>
          <p className="text-gray-500 dark:text-gray-400">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <NewsletterHeader 
        title="إنشاء نشرة إخبارية جديدة" 
        onThemeToggle={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      
      <div className="container py-8">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">إنشاء نشرة إخبارية جديدة</CardTitle>
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

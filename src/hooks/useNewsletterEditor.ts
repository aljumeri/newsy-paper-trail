
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const useNewsletterEditor = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // Apply theme class to body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadNewsletter = async () => {
      try {
        // First check if user is authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          toast({
            title: "يرجى تسجيل الدخول",
            description: "يجب أن تكون مسجل الدخول للوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          navigate('/admin-control');
          return;
        }
        
        // Use RPC to check admin status
        const { data: adminData, error: adminError } = await supabase.rpc(
          'is_admin_user', 
          { user_id: sessionData.session.user.id }
        );
        
        if (adminError) {
          console.error('Admin check error:', adminError);
          toast({
            title: "خطأ في التحقق من الصلاحيات",
            description: "حدث خطأ أثناء التحقق من صلاحيات المسؤول",
            variant: "destructive"
          });
          navigate('/admin-control');
          return;
        }
        
        if (!adminData) {
          toast({
            title: "غير مصرح",
            description: "ليس لديك صلاحيات المسؤول للوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          navigate('/admin-control');
          return;
        }
        
        // If an ID is provided, load the newsletter
        if (id) {
          const { data: newsletter, error } = await supabase
            .from('newsletters')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
          if (error) throw error;
          
          if (newsletter) {
            // Type check to ensure we have the correct data structure
            if ('subject' in newsletter && 'content' in newsletter) {
              setSubject(newsletter.subject);
              setContent(newsletter.content);
            } else {
              throw new Error("Newsletter data structure is invalid");
            }
          } else {
            toast({
              title: "لم يتم العثور على النشرة الإخبارية",
              description: "لا يمكن العثور على النشرة الإخبارية المطلوبة",
              variant: "destructive"
            });
            navigate('/admin-control/panel');
          }
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error loading newsletter:', error);
        toast({
          title: "خطأ في التحميل",
          description: "حدث خطأ أثناء تحميل النشرة الإخبارية",
          variant: "destructive"
        });
        navigate('/admin-control/panel');
      }
    };
    
    loadNewsletter();
  }, [id, navigate, toast]);

  const handleUpdateNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast({
          title: "خطأ في التحقق",
          description: "يجب أن تكون مسجل الدخول كمسؤول",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('newsletters')
        .update({ 
          subject, 
          content 
        } as any)
        .eq('id', id as any);
      
      if (error) throw error;
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث النشرة الإخبارية"
      });
      
      navigate('/admin-control/panel');
    } catch (error: any) {
      console.error('Error updating newsletter:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث النشرة الإخبارية",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return {
    subject,
    setSubject,
    content,
    setContent,
    isLoading,
    isSaving,
    isPreview,
    isDarkMode,
    handleUpdateNewsletter,
    handlePreview,
    toggleDarkMode
  };
};

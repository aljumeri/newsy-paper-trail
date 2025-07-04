import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    const fetchNewsletter = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching newsletter with ID:", id);
        
        const { data, error } = await supabase
          .from('newsletters')
          .select('id, main_title, content, created_at, updated_at, created_by, updated_by, sent_at')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching newsletter:', error);
          toast({
            title: "خطأ في جلب النشرة الإخبارية",
            description: error.message,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        if (!data) {
          console.error('Newsletter not found');
          toast({
            title: "النشرة الإخبارية غير موجودة",
            description: "تعذر العثور على النشرة الإخبارية المطلوبة",
            variant: "destructive"
          });
          navigate('/admin-control/panel');
          return;
        }
        
        console.log("Newsletter content loaded successfully");
        setSubject(data.main_title || '');
        // Ensure line breaks are preserved when loading content
        setContent(data.content ? data.content.replace(/<br\s*\/?>/gi, '\n') : '');
        setIsLoading(false);
      } catch (error: any) {
        console.error('Exception fetching newsletter:', error);
        toast({
          title: "خطأ غير متوقع",
          description: error.message || "حدث خطأ أثناء جلب النشرة الإخبارية",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchNewsletter();
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
        setIsSaving(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      console.log("Newsletter update initiated for ID:", id || "new");
      
      // Preserve line breaks when saving content
      const formattedContent = content.replace(/\n/g, '<br>');
      
      // Update existing newsletter or create new one
      let result;
      
      if (id) {
        // Update existing newsletter
        result = await supabase
          .from('newsletters')
          .update({ 
            main_title: subject, 
            content: formattedContent,
            updated_at: new Date().toISOString(),
            updated_by: userId
          })
          .eq('id', id);
      } else {
        // Create new newsletter
        result = await supabase
          .from('newsletters')
          .insert({
            main_title: subject, 
            content: formattedContent, 
            created_by: userId,
            created_at: new Date().toISOString()
          });
      }
      
      const { error } = result;
      
      if (error) {
        console.error('Newsletter save error:', error);
        throw error;
      }
      
      console.log('Newsletter saved successfully');
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ النشرة الإخبارية"
      });
      
      if (!id) {
        // If it was a new newsletter, redirect to admin panel
        navigate('/admin-control/panel');
      }
    } catch (error: any) {
      console.error('Error saving newsletter:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ النشرة الإخبارية",
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

export default useNewsletterEditor;


import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import useAdminAuth from '@/hooks/useAdminAuth';

export const useNewsletterEditor = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminAuth();

  useEffect(() => {
    const loadNewsletter = async () => {
      try {
        if (!user) {
          console.log("No user found, waiting for auth check to complete");
          return;
        }
        
        // If an ID is provided, load the newsletter
        if (id) {
          const { data: newsletter, error } = await supabase
            .from('newsletters')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (newsletter) {
            setSubject(newsletter.subject);
            setContent(newsletter.content);
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
      } catch (error) {
        console.error('Error loading newsletter:', error);
        toast({
          title: "خطأ في التحميل",
          description: "حدث خطأ أثناء تحميل النشرة الإخبارية",
          variant: "destructive"
        });
        navigate('/admin-control/panel');
      }
    };
    
    if (user) {
      loadNewsletter();
    }
  }, [id, navigate, toast, user]);

  const handleUpdateNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "خطأ في التحقق",
        description: "يجب أن تكون مسجل الدخول كمسؤول",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('newsletters')
        .update({ 
          subject, 
          content 
        })
        .eq('id', id as string);
      
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

  return {
    subject,
    setSubject,
    content,
    setContent,
    isLoading,
    isSaving,
    isPreview,
    handleUpdateNewsletter,
    handlePreview
  };
};

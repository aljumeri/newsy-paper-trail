
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const checkSessionAndLoadNewsletter = async () => {
      // Check if user is authenticated and admin
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/admin-control');
        return;
      }
      
      // Verify if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.session.user.id)
        .single();
      
      if (adminError || !adminData) {
        await supabase.auth.signOut();
        navigate('/admin-control');
        return;
      }
      
      // Load newsletter data
      if (id) {
        try {
          const { data: newsletter, error } = await supabase
            .from('newsletters')
            .select('*')
            .eq('id', id as any)
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
        } catch (error) {
          console.error('Error loading newsletter:', error);
          toast({
            title: "خطأ في التحميل",
            description: "حدث خطأ أثناء تحميل النشرة الإخبارية",
            variant: "destructive"
          });
          navigate('/admin-control/panel');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkSessionAndLoadNewsletter();
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
    } catch (error) {
      console.error('Error updating newsletter:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث النشرة الإخبارية",
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

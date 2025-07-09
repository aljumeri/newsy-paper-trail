import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const useNewsletterEditor = () => {
  const [subject, setSubject] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [date, setDate] = useState('');
  const [sections, setSections] = useState<any[]>([]);
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
          .select('id, main_title, sub_title, date, content, created_at, updated_at, created_by, updated_by, sent_at')
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
        setSubTitle(data.sub_title || '');
        setDate(data.date || '');
        
        // Parse content as JSON for sections
        if (data.content) {
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed)) {
              setSections(parsed);
            }
          } catch (e) {
            // If not JSON, treat as legacy HTML content
            console.log("Legacy HTML content found, converting to sections");
            setSections([{
              id: '1',
              title: 'محتوى النشرة',
              content: data.content.replace(/<br\s*\/?>/gi, '\n'),
              backgroundColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
              sideLineColor: '#4F46E5',
              subsections: [],
              mediaItems: [],
              lists: []
            }]);
          }
        }
        
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
    if (!subject.trim() || !sections.length) {
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
      
      // Save sections as JSON
      const newsletterData = {
        main_title: subject,
        sub_title: subTitle,
        date: date,
        content: JSON.stringify(sections),
        updated_at: new Date().toISOString(),
        updated_by: userId
      };
      
      // Update existing newsletter or create new one
      let result;
      
      if (id) {
        // Update existing newsletter
        result = await supabase
          .from('newsletters')
          .update(newsletterData)
          .eq('id', id);
      } else {
        // Create new newsletter
        result = await supabase
          .from('newsletters')
          .insert({
            ...newsletterData,
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

  // Helper to generate YouTube preview image and upload to Supabase
  async function generateAndUploadYoutubePreview(videoId: string, supabase: any): Promise<string | null> {
    try {
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const playBtnUrl = '/youtube_button.png';
      const [thumbImg, playBtnImg] = await Promise.all([
        loadImage(thumbUrl),
        loadImage(playBtnUrl)
      ]);
      const canvas = document.createElement('canvas');
      canvas.width = thumbImg.width;
      canvas.height = thumbImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(thumbImg, 0, 0);
      const btnW = thumbImg.width * 0.25;
      const btnH = btnW * (playBtnImg.height / playBtnImg.width);
      ctx.drawImage(playBtnImg, (thumbImg.width - btnW) / 2, (thumbImg.height - btnH) / 2, btnW, btnH);
      const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      const filePath = `youtube-previews/${videoId}.jpg`;
      const { data, error } = await supabase.storage.from('newsletter-assets').upload(filePath, blob, { upsert: true, contentType: 'image/jpeg' });
      if (error) return null;
      const { publicUrl } = supabase.storage.from('newsletter-assets').getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      return null;
    }
  }
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  return {
    subject,
    setSubject,
    subTitle,
    setSubTitle,
    date,
    setDate,
    sections,
    setSections,
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

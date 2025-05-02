import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EditorToolbar from '@/components/newsletter/EditorToolbar';
import YoutubeDialog from '@/components/newsletter/YoutubeDialog';
import ImageUploadDialog from '@/components/newsletter/ImageUploadDialog';

const EditNewsletter = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('right');
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
        .update({ subject, content })
        .eq('id', id);
      
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
  
  // Text formatting handlers
  const handleBold = () => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<strong>${selectedText}</strong>` + 
        content.substring(end);
      
      setContent(newContent);
      
      // Reset selection after formatting
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + 8; // Length of <strong>
        textarea.selectionEnd = start + 8 + selectedText.length;
      }, 0);
    }
  };
  
  const handleItalic = () => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<em>${selectedText}</em>` + 
        content.substring(end);
      
      setContent(newContent);
      
      // Reset selection after formatting
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + 4; // Length of <em>
        textarea.selectionEnd = start + 4 + selectedText.length;
      }, 0);
    }
  };
  
  const handleUnderline = () => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<u>${selectedText}</u>` + 
        content.substring(end);
      
      setContent(newContent);
      
      // Reset selection after formatting
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + 3; // Length of <u>
        textarea.selectionEnd = start + 3 + selectedText.length;
      }, 0);
    }
  };
  
  // Alignment handlers
  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    setTextAlignment(align);
    
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<div style="text-align: ${align};">${selectedText}</div>` + 
        content.substring(end);
      
      setContent(newContent);
    }
  };
  
  // YouTube embedding
  const handleYoutubeEmbed = (youtubeUrl: string) => {
    // Extract video ID
    let videoId = '';
    
    // Handle different YouTube URL formats
    if (youtubeUrl.includes('youtube.com/watch')) {
      const url = new URL(youtubeUrl);
      videoId = url.searchParams.get('v') || '';
    } else if (youtubeUrl.includes('youtu.be/')) {
      const parts = youtubeUrl.split('/');
      videoId = parts[parts.length - 1].split('?')[0];
    }
    
    if (videoId) {
      // Create responsive embed code
      const embedCode = `
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
  <iframe 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    src="https://www.youtube.com/embed/${videoId}" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
`;
      
      // Insert the embed code at the cursor position or append to the end
      const textarea = document.getElementById('content') as HTMLTextAreaElement;
      
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        setContent(
          content.substring(0, cursorPos) + 
          embedCode + 
          content.substring(cursorPos)
        );
      } else {
        setContent(content + embedCode);
      }
    }
  };
  
  // Image insertion
  const handleImageInsert = (imageUrl: string, altText: string) => {
    const imageHtml = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
    
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      setContent(
        content.substring(0, cursorPos) + 
        imageHtml + 
        content.substring(cursorPos)
      );
    } else {
      setContent(content + imageHtml);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">تعديل النشرة الإخبارية</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin-control/panel')}
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </div>
      </div>
      
      {/* YouTube Dialog */}
      <YoutubeDialog 
        isOpen={showYoutubeDialog} 
        onClose={() => setShowYoutubeDialog(false)} 
        onEmbed={handleYoutubeEmbed} 
      />
      
      {/* Image Upload Dialog */}
      <ImageUploadDialog 
        isOpen={showImageDialog} 
        onClose={() => setShowImageDialog(false)} 
        onInsertImage={handleImageInsert} 
      />
      
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>تعديل النشرة الإخبارية</CardTitle>
          </CardHeader>
          <CardContent>
            {isPreview ? (
              <div className="space-y-4">
                <div className="bg-white p-4 border rounded-md">
                  <h2 className="text-2xl font-bold mb-4">{subject}</h2>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }}></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handlePreview}>
                    تعديل
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">عنوان النشرة الإخبارية</label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="أدخل عنوان النشرة الإخبارية"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">محتوى النشرة الإخبارية</label>
                  
                  <EditorToolbar 
                    onBold={handleBold}
                    onItalic={handleItalic}
                    onUnderline={handleUnderline}
                    onAlignLeft={() => handleAlignment('left')}
                    onAlignCenter={() => handleAlignment('center')}
                    onAlignRight={() => handleAlignment('right')}
                    onImageUpload={() => setShowImageDialog(true)}
                    onYoutubeEmbed={() => setShowYoutubeDialog(true)}
                  />
                  
                  <div className={`border rounded-md ${textAlignment === 'right' ? 'text-right' : textAlignment === 'center' ? 'text-center' : 'text-left'}`}>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="أدخل محتوى النشرة الإخبارية..."
                      className={`min-h-[300px] w-full p-2 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-primary`}
                      style={{direction: 'rtl'}}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك استخدام وسوم HTML الأساسية وسيظهر النص بالتنسيق المطلوب في النشرة الإخبارية.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handlePreview}>
                    معاينة
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={isSaving}>
                        {isSaving ? "جارِ التحديث..." : "تحديث النشرة الإخبارية"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تحديث النشرة الإخبارية</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من أنك تريد تحديث هذه النشرة الإخبارية؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpdateNewsletter}>تحديث</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditNewsletter;

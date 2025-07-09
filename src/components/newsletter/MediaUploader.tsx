import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link as LinkIcon, Upload, Youtube } from "lucide-react";
import React, { useState } from 'react';
import { MediaItem } from './types';

interface MediaUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedia: (media: MediaItem) => void;
  defaultTab?: 'image' | 'video' | 'youtube' | 'link';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ isOpen, onClose, onAddMedia, defaultTab = 'image' }) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [isUploadingYoutube, setIsUploadingYoutube] = useState(false);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview for display
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageUrl(''); // Clear URL input when file is selected
    }
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImageUrl(url);
    setImageFile(null); // Clear file when URL is entered
    setImagePreview(url); // Use URL as preview
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `newsletter_images/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('newsletter-assets')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('newsletter-assets')
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  };

  const handleImageUpload = async () => {
    if (!imageFile && !imageUrl) return;

    setIsUploadingImage(true);
    
    try {
      let finalImageUrl = '';
      
      if (imageFile) {
        // Upload file to Supabase Storage
        finalImageUrl = await uploadImageToStorage(imageFile);
        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تم حفظ الصورة في الخادم",
        });
      } else if (imageUrl) {
        // Use the provided URL directly
        finalImageUrl = imageUrl;
        toast({
          title: "تم إضافة الصورة",
          description: "تم استخدام الرابط المقدم",
        });
      }

      if (finalImageUrl) {
        onAddMedia({ 
          id: Date.now().toString(), 
          type: 'image', 
          url: finalImageUrl, 
          title: '', 
          description: '', 
          size: 'medium', 
          alignment: 'center' 
        });
        resetImageForm();
        onClose();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const resetImageForm = () => {
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setIsUploadingImage(false);
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setVideoUrl(''); // Clear URL input when file is selected
    }
  };

  const handleVideoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setVideoUrl(url);
    setVideoFile(null);
    setVideoPreview(url);
  };

  const uploadVideoToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `newsletter_videos/${fileName}`;
    const { data, error } = await supabase.storage
      .from('newsletter-assets')
      .upload(filePath, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage
      .from('newsletter-assets')
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const handleVideoUpload = async () => {
    if (!videoFile && !videoUrl) return;
    setIsUploadingVideo(true);
    try {
      let finalVideoUrl = '';
      if (videoFile) {
        finalVideoUrl = await uploadVideoToStorage(videoFile);
        toast({
          title: "تم رفع الفيديو بنجاح",
          description: "تم حفظ الفيديو في الخادم",
        });
      } else if (videoUrl) {
        finalVideoUrl = videoUrl;
        toast({
          title: "تم إضافة الفيديو",
          description: "تم استخدام الرابط المقدم",
        });
      }
      if (finalVideoUrl) {
        onAddMedia({
          id: Date.now().toString(),
          type: 'video',
          url: finalVideoUrl,
          title: '',
          description: '',
          size: 'medium',
          alignment: 'center',
        });
        resetVideoForm();
        onClose();
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "خطأ في رفع الفيديو",
        description: "حدث خطأ أثناء رفع الفيديو. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const resetVideoForm = () => {
    setVideoUrl('');
    setVideoFile(null);
    setVideoPreview('');
    setIsUploadingVideo(false);
  };

  // Utility to generate a YouTube preview image (thumbnail + play button overlay) and upload to Supabase
  async function generateAndUploadYouTubePreview(videoId: string): Promise<string | undefined> {
    try {
      console.log('[YouTube Preview] Start generation for videoId:', videoId);
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      console.log('[YouTube Preview] Thumbnail URL:', thumbnailUrl);
      // 2. Load the thumbnail and play button images
      const [thumbnailImg, playButtonImg] = await Promise.all([
        loadImage(thumbnailUrl),
        loadImage('/youtube_button.png'), // public path
      ]);
      console.log('[YouTube Preview] Images loaded:', thumbnailImg, playButtonImg);
      // 3. Draw on canvas
      const canvas = document.createElement('canvas');
      canvas.width = thumbnailImg.width;
      canvas.height = thumbnailImg.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      // Draw the thumbnail first
      ctx.drawImage(thumbnailImg, 0, 0, canvas.width, canvas.height);
      // Resize play button if too large (max 25% of thumbnail width)
      let pbW = playButtonImg.width;
      let pbH = playButtonImg.height;
      const maxPlayButtonWidth = canvas.width * 0.25;
      if (pbW > maxPlayButtonWidth) {
        const scale = maxPlayButtonWidth / pbW;
        pbW = pbW * scale;
        pbH = pbH * scale;
      }
      // Center the play button
      const pbX = (canvas.width - pbW) / 2;
      const pbY = (canvas.height - pbH) / 2;
      ctx.drawImage(playButtonImg, pbX, pbY, pbW, pbH);
      console.log('[YouTube Preview] Canvas drawn. Thumbnail size:', canvas.width, canvas.height, 'Play button size:', pbW, pbH, 'Position:', pbX, pbY);
      // 4. Convert to blob
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) throw new Error('Failed to create image blob');
      console.log('[YouTube Preview] Canvas to blob success:', blob);
      // 5. Upload to Supabase Storage
      const fileName = `youtube_preview_${videoId}_${Date.now()}.jpg`;
      const filePath = `youtube-previews/${fileName}`;
      const { data, error } = await supabase.storage
        .from('newsletter-assets')
        .upload(filePath, blob, { contentType: 'image/jpeg' });
      if (error) {
        console.error('[YouTube Preview] Supabase upload error:', error);
        throw error;
      }
      // 6. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('newsletter-assets')
        .getPublicUrl(filePath);
      console.log('[YouTube Preview] Uploaded. Public URL:', publicUrlData?.publicUrl);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('[YouTube Preview] Error in generateAndUploadYouTubePreview:', err);
      toast({
        title: 'خطأ في توليد صورة معاينة يوتيوب',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
      return undefined;
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

  const addYouTubeLink = async () => {
    if (youtubeUrl) {
      setIsUploadingYoutube(true);
      try {
        console.log('[YouTube Add] Adding YouTube link:', youtubeUrl);
        const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
        let previewUrl: string | undefined = undefined;
        if (videoId) {
          try {
            previewUrl = await generateAndUploadYouTubePreview(videoId);
          } catch (err) {
            console.error('[YouTube Add] Error generating/uploading preview:', err);
            toast({
              title: 'خطأ في رفع صورة معاينة يوتيوب',
              description: err instanceof Error ? err.message : String(err),
              variant: 'destructive',
            });
          }
        } else {
          console.warn('[YouTube Add] Could not extract videoId from URL:', youtubeUrl);
          toast({
            title: 'رابط يوتيوب غير صالح',
            description: 'تعذر استخراج معرف الفيديو من الرابط المدخل.',
            variant: 'destructive',
          });
        }
        onAddMedia({
          id: Date.now().toString(),
          type: 'youtube',
          url: embedUrl,
          title: '',
          description: '',
          size: 'medium',
          alignment: 'center',
          previewUrl,
        });
        setYoutubeUrl('');
        onClose();
      } catch (error) {
        console.error('[YouTube Add] General error:', error);
        toast({
          title: 'خطأ في إضافة فيديو يوتيوب',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
      } finally {
        setIsUploadingYoutube(false);
      }
    }
  };

  const addLink = () => {
    if (linkUrl) {
      onAddMedia({ id: Date.now().toString(), type: 'link', url: linkUrl, title: linkTitle || linkUrl, description: '', size: 'medium', alignment: 'center' });
      setLinkUrl('');
      setLinkTitle('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة محتوى</DialogTitle>
          <DialogDescription>
            اختر نوع المحتوى الذي تريد إضافته
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="image">صورة</TabsTrigger>
            <TabsTrigger value="video">فيديو</TabsTrigger>
            <TabsTrigger value="youtube">يوتيوب</TabsTrigger>
            <TabsTrigger value="link">رابط</TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="space-y-4">
            <div>
              <Label htmlFor="image-file">رفع صورة</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            </div>
            <div>
              <Label htmlFor="image-url">أو أدخل رابط الصورة</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
            </div>
            {imagePreview && (
              <div className="border rounded p-2">
                <img src={imagePreview} alt="Preview" className="max-w-full h-32 object-cover rounded" />
              </div>
            )}
            <Button 
              onClick={handleImageUpload} 
              disabled={!imageFile && !imageUrl || isUploadingImage} 
              className="w-full"
            >
              <Upload className="ml-2 h-4 w-4" />
              {isUploadingImage ? 'جارِ التحميل...' : 'إضافة الصورة'}
            </Button>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div>
              <Label htmlFor="video-file">رفع فيديو</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
              />
            </div>
            <div>
              <Label htmlFor="video-url">أو أدخل رابط الفيديو</Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={handleVideoUrlChange}
                placeholder="https://example.com/video.mp4"
                dir="ltr"
              />
            </div>
            {videoPreview && (
              <div className="border rounded p-2">
                <video src={videoPreview} controls className="max-w-full h-32 object-cover rounded" />
              </div>
            )}
            <Button onClick={handleVideoUpload} disabled={!videoFile && !videoUrl || isUploadingVideo} className="w-full">
              <Upload className="ml-2 h-4 w-4" />
              {isUploadingVideo ? 'جارِ التحميل...' : 'إضافة الفيديو'}
            </Button>
          </TabsContent>
          
          <TabsContent value="youtube" className="space-y-4">
            <div>
              <Label htmlFor="youtube-url">رابط فيديو يوتيوب</Label>
              <Input
                id="youtube-url"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                dir="ltr"
              />
            </div>
            <Button onClick={addYouTubeLink} disabled={!youtubeUrl || isUploadingYoutube} className="w-full">
              <Youtube className="ml-2 h-4 w-4" />
              {isUploadingYoutube ? 'جارِ التحميل...' : 'إضافة فيديو يوتيوب'}
            </Button>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div>
              <Label htmlFor="link-title">عنوان الرابط</Label>
              <Input
                id="link-title"
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="عنوان الرابط"
              />
            </div>
            <div>
              <Label htmlFor="link-url">الرابط</Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>
            <Button onClick={addLink} disabled={!linkUrl} className="w-full">
              <LinkIcon className="ml-2 h-4 w-4" />
              إضافة الرابط
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploader; 
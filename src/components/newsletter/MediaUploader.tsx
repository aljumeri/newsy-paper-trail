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

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'youtube' | 'link';
  url: string;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
}

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

  const addYouTubeLink = () => {
    if (youtubeUrl) {
      const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
      onAddMedia({ id: Date.now().toString(), type: 'youtube', url: embedUrl, title: '', description: '', size: 'medium', alignment: 'center' });
      setYoutubeUrl('');
      onClose();
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
            <Button onClick={addYouTubeLink} disabled={!youtubeUrl} className="w-full">
              <Youtube className="ml-2 h-4 w-4" />
              إضافة فيديو يوتيوب
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
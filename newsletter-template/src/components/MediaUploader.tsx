
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Youtube } from "lucide-react";

interface MediaItem {
  type: 'image' | 'video' | 'youtube' | 'link';
  url: string;
  title?: string;
  description?: string;
}

interface MediaUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedia: (media: MediaItem) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ isOpen, onClose, onAddMedia }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      onAddMedia({ type: 'image', url: imageUrl });
      setImageUrl('');
      onClose();
    }
  };

  const addVideo = () => {
    if (videoUrl) {
      onAddMedia({ type: 'video', url: videoUrl });
      setVideoUrl('');
      onClose();
    }
  };

  const addYouTubeLink = () => {
    if (youtubeUrl) {
      // Extract YouTube video ID from URL
      const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
      onAddMedia({ type: 'youtube', url: embedUrl });
      setYoutubeUrl('');
      onClose();
    }
  };

  const addLink = () => {
    if (linkUrl) {
      onAddMedia({ 
        type: 'link', 
        url: linkUrl, 
        title: linkTitle || linkUrl 
      });
      setLinkUrl('');
      setLinkTitle('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-cairo">إضافة محتوى</DialogTitle>
          <DialogDescription className="font-cairo">
            اختر نوع المحتوى الذي تريد إضافته
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="image" className="font-cairo">صورة</TabsTrigger>
            <TabsTrigger value="video" className="font-cairo">فيديو</TabsTrigger>
            <TabsTrigger value="youtube" className="font-cairo">يوتيوب</TabsTrigger>
            <TabsTrigger value="link" className="font-cairo">رابط</TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="space-y-4">
            <div>
              <Label htmlFor="image-file" className="font-cairo">رفع صورة</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="font-cairo"
              />
            </div>
            <div>
              <Label htmlFor="image-url" className="font-cairo">أو أدخل رابط الصورة</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="font-cairo"
                dir="ltr"
              />
            </div>
            {imageUrl && (
              <div className="border rounded p-2">
                <img src={imageUrl} alt="Preview" className="max-w-full h-32 object-cover rounded" />
              </div>
            )}
            <Button onClick={addImage} disabled={!imageUrl} className="w-full font-cairo">
              <Upload className="ml-2 h-4 w-4" />
              إضافة الصورة
            </Button>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div>
              <Label htmlFor="video-file" className="font-cairo">رفع فيديو</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="font-cairo"
              />
            </div>
            <div>
              <Label htmlFor="video-url" className="font-cairo">أو أدخل رابط الفيديو</Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="font-cairo"
                dir="ltr"
              />
            </div>
            <Button onClick={addVideo} disabled={!videoUrl} className="w-full font-cairo">
              <Upload className="ml-2 h-4 w-4" />
              إضافة الفيديو
            </Button>
          </TabsContent>
          
          <TabsContent value="youtube" className="space-y-4">
            <div>
              <Label htmlFor="youtube-url" className="font-cairo">رابط فيديو يوتيوب</Label>
              <Input
                id="youtube-url"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="font-cairo"
                dir="ltr"
              />
            </div>
            <Button onClick={addYouTubeLink} disabled={!youtubeUrl} className="w-full font-cairo">
              <Youtube className="ml-2 h-4 w-4" />
              إضافة فيديو يوتيوب
            </Button>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div>
              <Label htmlFor="link-title" className="font-cairo">عنوان الرابط</Label>
              <Input
                id="link-title"
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="عنوان الرابط"
                className="font-cairo"
              />
            </div>
            <div>
              <Label htmlFor="link-url" className="font-cairo">الرابط</Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="font-cairo"
                dir="ltr"
              />
            </div>
            <Button onClick={addLink} disabled={!linkUrl} className="w-full font-cairo">
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

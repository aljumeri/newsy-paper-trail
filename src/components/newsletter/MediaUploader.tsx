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
import { Link as LinkIcon, Upload, Youtube } from "lucide-react";
import React, { useState } from 'react';

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
          <DialogTitle>إضافة محتوى</DialogTitle>
          <DialogDescription>
            اختر نوع المحتوى الذي تريد إضافته
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="image" className="w-full">
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
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <Label htmlFor="image-url">أو أدخل رابط الصورة</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
            </div>
            {imageUrl && (
              <div className="border rounded p-2">
                <img src={imageUrl} alt="Preview" className="max-w-full h-32 object-cover rounded" />
              </div>
            )}
            <Button onClick={addImage} disabled={!imageUrl} className="w-full">
              <Upload className="ml-2 h-4 w-4" />
              إضافة الصورة
            </Button>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div>
              <Label htmlFor="video-file">رفع فيديو</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
              />
            </div>
            <div>
              <Label htmlFor="video-url">أو أدخل رابط الفيديو</Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                dir="ltr"
              />
            </div>
            <Button onClick={addVideo} disabled={!videoUrl} className="w-full">
              <Upload className="ml-2 h-4 w-4" />
              إضافة الفيديو
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
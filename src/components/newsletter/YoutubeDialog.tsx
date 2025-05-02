
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface YoutubeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEmbed: (youtubeUrl: string) => void;
}

const YoutubeDialog: React.FC<YoutubeDialogProps> = ({ isOpen, onClose, onEmbed }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl) {
      onEmbed(youtubeUrl);
      setYoutubeUrl('');
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة فيديو يوتيوب</DialogTitle>
            <DialogDescription>
              أدخل رابط فيديو يوتيوب لإضافته إلى النشرة الإخبارية
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="youtube-url" className="mb-2 block">رابط الفيديو</Label>
            <Input
              id="youtube-url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit">إضافة</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default YoutubeDialog;

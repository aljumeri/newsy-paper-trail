
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface YoutubeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEmbed: (youtubeUrl: string, size: string, position: string) => void;
}

const YOUTUBE_SIZES = [
  { value: 'small', label: 'صغير (360p)' },
  { value: 'medium', label: 'متوسط (480p)' },
  { value: 'large', label: 'كبير (720p)' },
  { value: 'full', label: 'كامل (1080p)' }
];

const POSITION_OPTIONS = [
  { value: 'left', label: 'يسار' },
  { value: 'center', label: 'وسط' },
  { value: 'right', label: 'يمين' },
];

const YoutubeDialog: React.FC<YoutubeDialogProps> = ({ isOpen, onClose, onEmbed }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeSize, setYoutubeSize] = useState('medium');
  const [position, setPosition] = useState('center');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl) {
      onEmbed(youtubeUrl, youtubeSize, position);
      setYoutubeUrl('');
      setYoutubeSize('medium');
      setPosition('center');
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
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="youtube-url" className="mb-2 block">رابط الفيديو</Label>
              <Input
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="youtube-size" className="mb-2 block">حجم الفيديو</Label>
              <Select value={youtubeSize} onValueChange={setYoutubeSize}>
                <SelectTrigger id="youtube-size" className="w-full">
                  <SelectValue placeholder="اختر حجم الفيديو" />
                </SelectTrigger>
                <SelectContent>
                  {YOUTUBE_SIZES.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="mb-2 block">موضع الفيديو</Label>
              <RadioGroup 
                value={position} 
                onValueChange={setPosition}
                className="flex space-x-2 space-x-reverse justify-center"
              >
                {POSITION_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                    <RadioGroupItem value={opt.value} id={`position-${opt.value}`} />
                    <Label htmlFor={`position-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
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

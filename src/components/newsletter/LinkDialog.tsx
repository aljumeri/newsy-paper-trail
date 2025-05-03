
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

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertLink: (url: string, text: string) => void;
}

const LinkDialog: React.FC<LinkDialogProps> = ({ isOpen, onClose, onInsertLink }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      onInsertLink(linkUrl, linkText);
      setLinkUrl('');
      setLinkText('');
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة رابط</DialogTitle>
            <DialogDescription>
              أدخل عنوان الرابط والنص الذي سيظهر للمستخدمين
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="link-url" className="mb-2 block">عنوان الرابط</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="link-text" className="mb-2 block">نص الرابط (اختياري)</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="اضغط هنا"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                إذا تركت هذا الحقل فارغًا وكان هناك نص محدد، سيتم استخدام النص المحدد.
              </p>
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

export default LinkDialog;

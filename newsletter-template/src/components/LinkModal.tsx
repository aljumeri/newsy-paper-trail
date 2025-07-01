
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (url: string, text: string) => void;
  selectedText: string;
}

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onAddLink,
  selectedText
}) => {
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Update linkText whenever selectedText changes or modal opens
  useEffect(() => {
    if (isOpen && selectedText) {
      console.log('Modal opened with selected text:', selectedText);
      setLinkText(selectedText);
    }
  }, [selectedText, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && linkText) {
      onAddLink(url, linkText);
      setUrl('');
      setLinkText('');
      onClose();
    }
  };

  const handleClose = () => {
    setUrl('');
    setLinkText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-cairo">إضافة رابط</DialogTitle>
          <DialogDescription className="font-cairo">
            أدخل الرابط والنص المراد عرضه
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkText" className="font-cairo">النص</Label>
            <Input
              id="linkText"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="النص المراد عرضه"
              className="font-cairo"
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url" className="font-cairo">الرابط</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="font-cairo"
              dir="ltr"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="font-cairo"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="font-cairo"
              disabled={!url || !linkText}
            >
              <Link2 className="ml-1 h-4 w-4" />
              إضافة الرابط
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkModal;

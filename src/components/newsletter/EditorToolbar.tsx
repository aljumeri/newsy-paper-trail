
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlignLeft,
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline, 
  Image,
  Youtube,
  Link,
  Text,
  Type
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onImageUpload: () => void;
  onYoutubeEmbed: () => void;
  onLink: () => void;
  onFontSize: (size: string) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onImageUpload,
  onYoutubeEmbed,
  onLink,
  onFontSize
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 border rounded-md p-1 mb-2 bg-white">
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onBold} title="تخط عريض">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onItalic} title="مائل">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onUnderline} title="تحته خط">
          <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onLink} title="إضافة رابط">
          <Link className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-2 flex items-center gap-1 h-9" title="حجم الخط">
              <Type className="h-4 w-4" />
              <span className="text-xs">حجم الخط</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onFontSize('small')}>صغير</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('medium')}>متوسط</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('large')}>كبير</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('xlarge')}>كبير جدًا</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onAlignLeft} title="محاذاة لليسار">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onAlignCenter} title="توسيط">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onAlignRight} title="محاذاة لليمين">
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onImageUpload} title="إضافة صورة">
          <Image className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onYoutubeEmbed} title="إضافة فيديو يوتيوب">
          <Youtube className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;

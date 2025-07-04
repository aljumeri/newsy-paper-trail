
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
  Type,
  ListOrdered,
  List,
  Heading1,
  Heading2,
  Heading3,
  Redo,
  Undo,
  TextCursorInput,
  Section,
  Shapes,
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
  onHeading: (level: number) => void;
  onList: (type: 'ordered' | 'unordered') => void;
  onTextColor: (color: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onTextDirection: () => void;
  onAddSection?: () => void;
  onAddShape?: (shape: string) => void;
}

const colors = [
  { name: 'أسود', value: '#000000' },
  { name: 'رمادي', value: '#666666' },
  { name: 'أحمر', value: '#e53e3e' },
  { name: 'أزرق', value: '#3182ce' },
  { name: 'أخضر', value: '#38a169' },
  { name: 'أصفر', value: '#d69e2e' },
  { name: 'أرجواني', value: '#805ad5' },
];

const shapes = [
  { name: 'مستطيل', value: 'rectangle' },
  { name: 'دائرة', value: 'circle' },
  { name: 'مثلث', value: 'triangle' },
  { name: 'نجمة', value: 'star' },
  { name: 'سهم', value: 'arrow' },
];

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
  onFontSize,
  onHeading,
  onList,
  onTextColor,
  onUndo,
  onRedo,
  onTextDirection,
  onAddSection,
  onAddShape
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 border rounded-md p-1 mb-2 bg-white">
      {/* Text styling */}
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

      {/* Text size and color */}
      <div className="flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-2 flex items-center gap-1 h-9" title="حجم الخط">
              <Type className="h-4 w-4" />
              <span className="text-xs">حجم الخط</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onFontSize('12px')}>12px</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('14px')}>14px</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('16px')}>16px</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('18px')}>18px</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('20px')}>20px</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('24px')}>24px</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('28px')}>28px</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontSize('32px')}>32px</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Text color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-2 flex items-center gap-1 h-9" title="لون الخط">
              <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden">
                <span className="w-3 h-3 bg-black rounded-full" />
              </span>
              <span className="text-xs">اللون</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {colors.map((color) => (
              <DropdownMenuItem key={color.value} onClick={() => onTextColor(color.value)}>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: color.value }}
                  ></div>
                  {color.name}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Headers */}
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onHeading(1)} title="عنوان 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onHeading(2)} title="عنوان 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onHeading(3)} title="عنوان 3">
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onList('ordered')} title="قائمة مرقمة">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onList('unordered')} title="قائمة نقطية">
          <List className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text alignment */}
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
        <Button variant="ghost" size="icon" onClick={onTextDirection} title="تغيير اتجاه النص">
          <TextCursorInput className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Media */}
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onImageUpload} title="إضافة صورة">
          <Image className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onYoutubeEmbed} title="إضافة فيديو يوتيوب">
          <Youtube className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Sections and Shapes */}
      <div className="flex gap-1">
        {onAddSection && (
          <Button variant="ghost" size="icon" onClick={onAddSection} title="إضافة قسم">
            <Section className="h-4 w-4" />
          </Button>
        )}
        
        {onAddShape && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="إضافة شكل">
                <Shapes className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {shapes.map((shape) => (
                <DropdownMenuItem key={shape.value} onClick={() => onAddShape(shape.value)}>
                  {shape.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {onUndo && onRedo && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          
          {/* Undo/Redo */}
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onUndo} title="تراجع">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRedo} title="إعادة">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditorToolbar;

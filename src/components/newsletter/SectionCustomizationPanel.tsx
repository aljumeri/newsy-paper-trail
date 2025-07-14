import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Image, Link as LinkIcon, Palette, Video, Youtube } from 'lucide-react';
import React from 'react';

interface ListItem {
  id: string;
  text: string;
  color: string;
}

interface ListData {
  id: string;
  type: 'bullet' | 'numbered';
  items: ListItem[];
}

interface Section {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  sideLineColor: string;
  subsections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  mediaItems?: any[];
  lists?: ListData[];
}

interface SectionCustomizationPanelProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onOpenMediaUploader: (
    type: 'image' | 'video' | 'youtube' | 'link',
    subsectionId?: string
  ) => void;
}

const bgOptions = [
  { label: 'وردي فاتح', value: 'bg-pink-50', color: '#fde4ec' },
  { label: 'أخضر فاتح', value: 'bg-green-50', color: '#e9fbe5' },
  { label: 'أزرق فاتح', value: 'bg-blue-50', color: '#e6f0fa' },
  { label: 'سماوي فاتح', value: 'bg-cyan-50', color: '#e0f7fa' },
  { label: 'بنفسجي فاتح', value: 'bg-purple-50', color: '#f3e8ff' },
  { label: 'أبيض', value: 'bg-white', color: '#fff' },
];

const colorOptions = [
  { label: 'أسود', value: '#000000', dot: 'bg-black' },
  { label: 'وردي', value: '#EC4899', dot: 'bg-pink-400' },
  { label: 'أخضر', value: '#10B981', dot: 'bg-green-500' },
  { label: 'أزرق', value: '#6366F1', dot: 'bg-indigo-400' },
  { label: 'سماوي', value: '#06B6D4', dot: 'bg-cyan-400' },
  { label: 'بنفسجي', value: '#A78BFA', dot: 'bg-purple-400' },
  { label: 'أحمر', value: '#EF4444', dot: 'bg-red-400' },
  { label: 'أصفر', value: '#EAB308', dot: 'bg-yellow-400' },
  { label: 'برتقالي', value: '#F59E42', dot: 'bg-orange-400' },
];

const SectionCustomizationPanel: React.FC<SectionCustomizationPanelProps> = ({
  section,
  onUpdate,
  onOpenMediaUploader,
}) => {
  const addList = (type: 'bullet' | 'numbered') => {
    const newList: ListData = {
      id: Date.now().toString(),
      type,
      items: [
        {
          id: `${Date.now()}-1`,
          text: 'عنصر القائمة الأول',
          color: '#4F46E5',
        },
      ],
    };

    const currentLists = section.lists || [];
    onUpdate({
      lists: [...currentLists, newList],
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="ml-1 h-4 w-4" />
          تخصيص
        </Button>
      </SheetTrigger>
      <SheetContent side="right" dir="rtl">
        <SheetHeader>
          <SheetTitle>تخصيص القسم</SheetTitle>
          <SheetDescription>قم بتخصيص شكل ومحتوى هذا القسم</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(100vh-120px)] pr-2 pb-32">
          <div>
            <label className="text-sm font-medium mb-2 block">
              لون الخلفية
            </label>
            <div className="grid grid-cols-2 gap-2">
              {bgOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`rounded-lg border px-4 py-3 flex items-center justify-center text-sm font-medium transition-colors ${
                    section.backgroundColor === opt.value
                      ? 'border-logo-blue ring-2 ring-logo-blue'
                      : 'border-gray-200'
                  } `}
                  style={{ background: opt.color }}
                  onClick={() => onUpdate({ backgroundColor: opt.value })}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              لون الخط الجانبي
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`rounded-lg border px-4 py-2 flex items-center justify-between text-sm font-medium transition-colors ${
                    section.sideLineColor === opt.value
                      ? 'border-logo-blue ring-2 ring-logo-blue'
                      : 'border-gray-200'
                  }`}
                  onClick={() => onUpdate({ sideLineColor: opt.value })}
                  type="button"
                >
                  <span>{opt.label}</span>
                  <span
                    className={`ml-2 w-4 h-4 rounded-full inline-block ${opt.dot}`}
                  ></span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              لون عنوان القسم
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`rounded-lg border px-4 py-2 flex items-center justify-between text-sm font-medium transition-colors ${
                    section.titleColor === opt.value
                      ? 'border-logo-blue ring-2 ring-logo-blue'
                      : 'border-gray-200'
                  }`}
                  onClick={() => onUpdate({ titleColor: opt.value })}
                  type="button"
                >
                  <span>{opt.label}</span>
                  <span
                    className={`ml-2 w-4 h-4 rounded-full inline-block ${opt.dot}`}
                  ></span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              لون محتوى القسم
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`rounded-lg border px-4 py-2 flex items-center justify-between text-sm font-medium transition-colors ${
                    section.contentColor === opt.value
                      ? 'border-logo-blue ring-2 ring-logo-blue'
                      : 'border-gray-200'
                  }`}
                  onClick={() => onUpdate({ contentColor: opt.value })}
                  type="button"
                >
                  <span>{opt.label}</span>
                  <span
                    className={`ml-2 w-4 h-4 rounded-full inline-block ${opt.dot}`}
                  ></span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-4 px-2 border-t z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium">إضافة محتوى</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenMediaUploader('image')}
              >
                <Image className="h-4 w-4 ml-1" /> صورة
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenMediaUploader('video')}
              >
                <Video className="h-4 w-4 ml-1" /> فيديو
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenMediaUploader('youtube')}
              >
                <Youtube className="h-4 w-4 ml-1" /> يوتيوب
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenMediaUploader('link')}
              >
                <LinkIcon className="h-4 w-4 ml-1" /> رابط
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SectionCustomizationPanel;

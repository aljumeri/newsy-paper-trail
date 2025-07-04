import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { List, ListOrdered, Palette, Settings } from 'lucide-react';
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
  onOpenMediaUploader: () => void;
}

const bgOptions = [
  { label: 'أزرق', value: 'bg-gradient-to-r from-blue-50 to-indigo-50' },
  { label: 'وردي', value: 'bg-gradient-to-r from-pink-50 to-rose-50' },
  { label: 'سماوي', value: 'bg-gradient-to-r from-cyan-50 to-blue-50' },
  { label: 'أخضر', value: 'bg-gradient-to-r from-green-50 to-lime-50' },
  { label: 'أصفر', value: 'bg-gradient-to-r from-yellow-50 to-amber-50' },
];

const colorOptions = [
  { label: 'أزرق', value: '#4F46E5' },
  { label: 'وردي', value: '#EC4899' },
  { label: 'سماوي', value: '#06B6D4' },
  { label: 'أخضر', value: '#10B981' },
  { label: 'أصفر', value: '#EAB308' },
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
        <div className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium  mb-2 block">
              لون الخلفية
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={section.backgroundColor}
                onChange={e => onUpdate({ backgroundColor: e.target.value })}
                className="rounded border px-2 py-1 text-sm"
                title="تغيير خلفية القسم"
              >
                {bgOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              لون الخط الجانبي
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={section.sideLineColor}
                onChange={e => onUpdate({ sideLineColor: e.target.value })}
                className="rounded border px-2 py-1 text-sm"
                title="تغيير لون الخط الجانبي"
              >
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">إضافة محتوى</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenMediaUploader}
                title="إضافة صورة أو فيديو أو رابط"
              >
                <Settings className="h-4 w-4 mr-1" />
                محتوى
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">إضافة قائمة</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addList('bullet')}
              >
                <List className="ml-1 h-4 w-4" />
                قائمة نقطية
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addList('numbered')}
              >
                <ListOrdered className="ml-1 h-4 w-4" />
                قائمة مرقمة
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SectionCustomizationPanel;

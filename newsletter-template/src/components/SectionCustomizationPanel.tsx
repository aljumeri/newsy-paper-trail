
import React from 'react';
import { Button } from "@/components/ui/button";
import { Palette, ImageIcon, Video, Link, List, ListOrdered } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

const backgroundOptions = [
  { name: 'أزرق فاتح', class: 'bg-gradient-to-r from-blue-50 to-indigo-50' },
  { name: 'وردي فاتح', class: 'bg-gradient-to-r from-pink-50 to-rose-50' },
  { name: 'سماوي فاتح', class: 'bg-gradient-to-r from-cyan-50 to-blue-50' },
  { name: 'أخضر فاتح', class: 'bg-gradient-to-r from-green-50 to-emerald-50' },
  { name: 'بنفسجي فاتح', class: 'bg-gradient-to-r from-purple-50 to-indigo-50' },
  { name: 'أبيض', class: 'bg-white' },
];

const sideLineColorOptions = [
  { name: 'أزرق', color: '#4F46E5' },
  { name: 'وردي', color: '#EC4899' },
  { name: 'سماوي', color: '#06B6D4' },
  { name: 'أخضر', color: '#10B981' },
  { name: 'بنفسجي', color: '#8B5CF6' },
  { name: 'أحمر', color: '#EF4444' },
  { name: 'برتقالي', color: '#F97316' },
  { name: 'أصفر', color: '#EAB308' },
];

const SectionCustomizationPanel: React.FC<SectionCustomizationPanelProps> = ({
  section,
  onUpdate,
  onOpenMediaUploader
}) => {
  const addList = (type: 'bullet' | 'numbered') => {
    const newList: ListData = {
      id: Date.now().toString(),
      type,
      items: [
        {
          id: `${Date.now()}-1`,
          text: 'عنصر القائمة الأول',
          color: '#4F46E5'
        }
      ]
    };
    
    const currentLists = section.lists || [];
    onUpdate({
      lists: [...currentLists, newList]
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="font-cairo">
          <Palette className="ml-1 h-4 w-4" />
          تخصيص
        </Button>
      </SheetTrigger>
      <SheetContent side="right" dir="rtl">
        <SheetHeader>
          <SheetTitle className="font-cairo">تخصيص القسم</SheetTitle>
          <SheetDescription className="font-cairo">
            قم بتخصيص شكل ومحتوى هذا القسم
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium font-cairo mb-2 block">
              لون الخلفية
            </label>
            <div className="grid grid-cols-2 gap-2">
              {backgroundOptions.map((option) => (
                <Button
                  key={option.class}
                  variant={section.backgroundColor === option.class ? "default" : "outline"}
                  className={`h-12 font-cairo ${option.class}`}
                  onClick={() => onUpdate({ backgroundColor: option.class })}
                >
                  {option.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium font-cairo mb-2 block">
              لون الخط الجانبي
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sideLineColorOptions.map((option) => (
                <Button
                  key={option.color}
                  variant={section.sideLineColor === option.color ? "default" : "outline"}
                  className="h-10 font-cairo flex items-center gap-2"
                  onClick={() => onUpdate({ sideLineColor: option.color })}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: option.color }}
                  />
                  {option.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium font-cairo">إضافة محتوى</label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="font-cairo"
                onClick={onOpenMediaUploader}
              >
                <ImageIcon className="ml-1 h-4 w-4" />
                صورة
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-cairo"
                onClick={onOpenMediaUploader}
              >
                <Video className="ml-1 h-4 w-4" />
                فيديو
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-cairo"
                onClick={onOpenMediaUploader}
              >
                <Link className="ml-1 h-4 w-4" />
                رابط
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium font-cairo">إضافة قائمة</label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="font-cairo"
                onClick={() => addList('bullet')}
              >
                <List className="ml-1 h-4 w-4" />
                قائمة نقطية
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-cairo"
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

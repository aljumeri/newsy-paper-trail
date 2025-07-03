import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Facebook, Linkedin, Plus, X } from 'lucide-react';
import { useState } from 'react';
import EditableSection from './EditableSection';
import NewsletterHeaderV2 from './NewsletterHeaderV2';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'youtube' | 'link';
  url: string;
  title?: string;
  description?: string;
}

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
  mediaItems?: MediaItem[];
  lists?: ListData[];
}

interface NewsletterProps {
  sections?: Section[];
  setSections?: (sections: Section[]) => void;
}

export const defaultSections: Section[] = [
  {
    id: '1',
    title: 'الأخبار الرئيسية',
    content:
      'محتوى القسم الرئيسي يمكن تحريره هنا. أضف النصوص والروابط والصور حسب الحاجة.',
    backgroundColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    sideLineColor: '#4F46E5',
    subsections: [
      {
        id: '1-1',
        title: 'عنوان فرعي أول',
        content: 'محتوى القسم الفرعي الأول',
      },
    ],
    mediaItems: [],
    lists: [],
  },
  {
    id: '2',
    title: 'التحديثات التقنية',
    content: 'آخر التطورات في عالم التكنولوجيا والذكاء الاصطناعي.',
    backgroundColor: 'bg-gradient-to-r from-pink-50 to-rose-50',
    sideLineColor: '#EC4899',
    subsections: [],
    mediaItems: [],
    lists: [],
  },
];

const Newsletter: React.FC<NewsletterProps> = ({
  sections: propSections,
  setSections: propSetSections,
}) => {
  const [internalSections, internalSetSections] =
    useState<Section[]>(defaultSections);
  const sections = propSections !== undefined ? propSections : internalSections;
  const setSections =
    propSetSections !== undefined ? propSetSections : internalSetSections;

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: 'قسم جديد',
      content: 'محتوى القسم الجديد',
      backgroundColor: 'bg-gradient-to-r from-cyan-50 to-blue-50',
      sideLineColor: '#06B6D4',
      subsections: [],
      mediaItems: [],
      lists: [],
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(
      sections.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  return (
    <div className="min-h-screen " dir="rtl">
      <div className="space-y-6">
        {/* Newsletter Header */}
        <NewsletterHeaderV2 />

        {/* Newsletter Sections */}
        <div className="space-y-6">
          {sections.map(section => (
            <EditableSection
              key={section.id}
              section={section}
              onUpdate={updates => updateSection(section.id, updates)}
              onDelete={() => deleteSection(section.id)}
            />
          ))}
        </div>

        {/* Add Section Button */}
        <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-logo-blue transition-colors">
          <Button
            onClick={addSection}
            variant="outline"
            className="w-full h-16 text-lg hover:bg-logo-blue hover:text-white transition-colors"
          >
            <Plus className="ml-2 h-6 w-6" />
            إضافة قسم جديد
          </Button>
        </Card>

        {/* Footer with Social Media and Subscription Info */}
        <div className="text-center py-8 border-t border-gray-200 space-y-6">
          {/* Social Media Icons */}
          <div className="flex justify-center items-center space-x-4 space-x-reverse">
            <a
              href="#"
              className="text-gray-600 hover:text-logo-blue transition-colors"
            >
              <X className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-logo-blue transition-colors"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-logo-blue transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>

          {/* Subscription Text */}
          <div className="text-gray-600 text-sm space-y-2">
            <p>
              هل وصلتك هذه النشرة عبر صديق؟{' '}
              <a
                href="#"
                className="text-logo-blue hover:underline font-medium"
              >
                اشترك من هنا
              </a>
              ، ليصلك جديدنا
            </p>
            <p>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 underline"
              >
                لإلغاء الاشتراك هنا
              </a>
            </p>
          </div>

          {/* Copyright and Logo */}
          <div className="flex justify-center items-center space-x-4 space-x-reverse pt-4 border-t border-gray-100">
            <img
              src="/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png"
              alt="Solo for AI Logo"
              className="h-8 w-8"
            />
            <p className="text-gray-600 text-sm">
              © 2025 جميع الحقوق محفوظة لـ سولو للذكاء الاصطناعي
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;

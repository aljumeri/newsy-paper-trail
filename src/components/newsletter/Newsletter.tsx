import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Linkedin, Plus, X } from 'lucide-react';
import { useState } from 'react';
import EditableSection from './EditableSection';
import NewsletterHeaderV2 from './NewsletterHeaderV2';
import SectionDisplay from './SectionDisplay';
import { Section, Subsection } from './types';

interface NewsletterProps {
  sections?: Section[];
  setSections?: (sections: Section[]) => void;
  readOnly?: boolean;
  mainTitle?: string;
  subTitle?: string;
  date?: string;
  onMainTitleChange?: (val: string) => void;
  onSubTitleChange?: (val: string) => void;
  onDateChange?: (val: string) => void;
}

export const defaultSections: Section[] = [
  {
    id: '1',
    title: 'الأخبار الرئيسية',
    content:
      'محتوى القسم الرئيسي يمكن تحريره هنا. أضف النصوص والروابط والصور حسب الحاجة.',
    backgroundColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    sideLineColor: '#4F46E5',
    titleFontSize: 'text-2xl',
    contentFontSize: 'text-lg',
    subsections: [
      {
        id: '1-1',
        title: 'عنوان فرعي أول',
        content: 'محتوى القسم الفرعي الأول',
        mediaItems: [],
        titleFontSize: 'text-lg',
        contentFontSize: 'text-base',
      } as Subsection,
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
    titleFontSize: 'text-2xl',
    contentFontSize: 'text-lg',
    subsections: [],
    mediaItems: [],
    lists: [],
  },
];

const Newsletter: React.FC<NewsletterProps> = ({
  sections: propSections,
  setSections: propSetSections,
  readOnly = false,
  mainTitle,
  subTitle,
  date,
  onMainTitleChange,
  onSubTitleChange,
  onDateChange,
}) => {
  const { toast } = useToast();
  
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
      titleFontSize: 'text-2xl',
      contentFontSize: 'text-lg',
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

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = mainTitle || 'النشرة الإخبارية';
  
  const handleShareX = () => {
    console.log('Share X clicked, URL:', shareUrl, 'Title:', shareTitle);
    try {
      const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareTitle)}`;
      console.log('Opening URL:', shareUrl);
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error sharing to X:', error);
      toast({
        title: 'حدث خطأ في المشاركة على X',
        description: error.message,
      });
    }
  };
  
  const handleShareFacebook = () => {
    console.log('Share Facebook clicked, URL:', shareUrl);
    try {
      // Copy link to clipboard and show instructions
              if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            toast({
              title: 'تم نسخ الرابط!',
              description: 'افتح Facebook وانسخ الرابط في منشورك',
            });
          });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            toast({
              title: 'تم نسخ الرابط!',
              description: 'افتح Facebook وانسخ الرابط في منشورك',
            });
          } catch (err) {
            toast({
              title: 'فشل في نسخ الرابط',
              description: 'يرجى نسخ الرابط يدوياً',
            });
          }
          document.body.removeChild(textArea);
        }
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      toast({
        title: 'حدث خطأ في المشاركة على Facebook',
        description: error.message,
      });
    }
  };
  
  const handleShareLinkedIn = () => {
    console.log('Share LinkedIn clicked, URL:', shareUrl);
    try {
      // Copy link to clipboard and show instructions
              if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            toast({
              title: 'تم نسخ الرابط!',
              description: 'افتح LinkedIn وانسخ الرابط في منشورك',
            });
          });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            toast({
              title: 'تم نسخ الرابط!',
              description: 'افتح LinkedIn وانسخ الرابط في منشورك',
            });
          } catch (err) {
            toast({
              title: 'فشل في نسخ الرابط',
              description: 'يرجى نسخ الرابط يدوياً',
            });
          }
          document.body.removeChild(textArea);
        }
    } catch (error) {
      console.error('Error sharing to LinkedIn:', error);
      toast({
        title: 'حدث خطأ في المشاركة على LinkedIn',
        description: error.message,
      });
    }
  };
  
  const handleCopyLink = () => {
    console.log('Copy link clicked, URL:', shareUrl);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          toast({
            title: 'تم نسخ رابط النشرة!',
            description: 'تم نسخ رابط النشرة!',
          });
        }).catch((err) => {
          console.error('Clipboard API failed:', err);
          fallbackCopyTextToClipboard(window.location.href);
        });
      } else {
        fallbackCopyTextToClipboard(window.location.href);
      }
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'حدث خطأ في نسخ الرابط',
        description: error.message,
      });
    }
  };

  // Fallback copy function for older browsers
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      toast({
        title: 'تم نسخ رابط النشرة!',
        description: 'تم نسخ رابط النشرة!',
      });
    } catch (err) {
      console.error('Fallback copy failed:', err);
      toast({
        title: 'فشل في نسخ الرابط',
        description: 'فشل في نسخ الرابط',
      });
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen " dir="rtl">
      <div className="space-y-6 px-2 sm:px-0">
        {/* Newsletter Header */}
        <NewsletterHeaderV2
          title={mainTitle}
          subtitle={subTitle}
          date={date}
          readOnly={readOnly}
          onTitleChange={onMainTitleChange}
          onSubtitleChange={onSubTitleChange}
          onDateChange={onDateChange}
        />

        {/* Newsletter Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) =>
            readOnly ? (
              <SectionDisplay key={section.id} section={section} />
            ) : (
              <EditableSection
                key={section.id}
                section={section}
                onUpdate={updates => updateSection(section.id, updates)}
                onDelete={() => deleteSection(section.id)}
                moveUp={() => moveSection(idx, 'up')}
                moveDown={() => moveSection(idx, 'down')}
                disableUp={idx === 0}
                disableDown={idx === sections.length - 1}
              />
            )
          )}
        </div>

        {/* Add Section Button */}
        {!readOnly && (
          <Card className="p-4 sm:p-6 border-2 border-dashed border-gray-300 hover:border-logo-blue transition-colors">
            <Button
              onClick={addSection}
              variant="outline"
              className="w-full h-14 sm:h-16 text-base sm:text-lg hover:bg-logo-blue hover:text-white transition-colors"
            >
              <Plus className="ml-2 h-6 w-6" />
              إضافة قسم جديد
            </Button>
          </Card>
        )}

        {/* Footer with Social Media and Subscription Info */}
        <div className="text-center py-8 border-t border-gray-200 space-y-6">
          {/* Social Media Icons */}
          <div className="flex justify-center items-center space-x-4 space-x-reverse mb-4">
            <h3 className="text-lg font-semibold mb-4">شارك هذا العدد</h3>
          </div>
          <div className="flex justify-center items-center space-x-4 space-x-reverse">
            <button
              onClick={handleShareX}
              className="p-3 bg-gray-100 hover:bg-blue-100 rounded-full transition-colors"
              title="مشاركة على X"
              type="button"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={handleShareFacebook}
              className="p-3 bg-gray-100 hover:bg-blue-100 rounded-full transition-colors"
              title="مشاركة على Facebook"
              type="button"
            >
              <Facebook className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="p-3 bg-gray-100 hover:bg-blue-100 rounded-full transition-colors"
              title="مشاركة على LinkedIn"
              type="button"
            >
              <Linkedin className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-3 bg-gray-100 hover:bg-blue-100 rounded-full transition-colors"
              title="نسخ رابط النشرة"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v3a2 2 0 002 2zm0 0v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3" />
              </svg>
            </button>
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

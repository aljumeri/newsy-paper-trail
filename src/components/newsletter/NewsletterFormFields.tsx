
import React from 'react';
import { Input } from '@/components/ui/input';
import EditorToolbar from '@/components/newsletter/EditorToolbar';

interface NewsletterFormFieldsProps {
  subject: string;
  setSubject: (subject: string) => void;
  content: string;
  setContent: (content: string) => void;
  textDirection: 'rtl' | 'ltr';
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onAlignment: (align: 'left' | 'center' | 'right') => void;
  onImageUpload: () => void;
  onYoutubeEmbed: () => void;
  onLink: () => void;
  onFontSize: (size: string) => void;
  onHeading: (level: number) => void;
  onList: (type: 'ordered' | 'unordered') => void;
  onTextColor: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onTextDirection: () => void;
}

const NewsletterFormFields: React.FC<NewsletterFormFieldsProps> = ({
  subject,
  setSubject,
  content,
  setContent,
  textDirection,
  onBold,
  onItalic,
  onUnderline,
  onAlignment,
  onImageUpload,
  onYoutubeEmbed,
  onLink,
  onFontSize,
  onHeading,
  onList,
  onTextColor,
  onUndo,
  onRedo,
  onTextDirection
}) => {
  return (
    <>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1 dark:text-white">
          عنوان النشرة
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="أدخل عنوان النشرة الإخبارية هنا"
          className="dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">
          محتوى النشرة
        </label>
        <EditorToolbar 
          onBold={onBold}
          onItalic={onItalic}
          onUnderline={onUnderline}
          onAlignLeft={() => onAlignment('left')}
          onAlignCenter={() => onAlignment('center')}
          onAlignRight={() => onAlignment('right')}
          onImageUpload={onImageUpload}
          onYoutubeEmbed={onYoutubeEmbed}
          onLink={onLink}
          onFontSize={onFontSize}
          onHeading={onHeading}
          onList={onList}
          onTextColor={onTextColor}
          onUndo={onUndo}
          onRedo={onRedo}
          onTextDirection={onTextDirection}
        />
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full p-3 border rounded-md mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="اكتب محتوى النشرة هنا..."
          style={{ direction: textDirection }}
        />
      </div>
    </>
  );
};

export default NewsletterFormFields;

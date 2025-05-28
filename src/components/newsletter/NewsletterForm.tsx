
import React, { useState } from 'react';
import YoutubeDialog from '@/components/newsletter/YoutubeDialog';
import ImageUploadDialog from '@/components/newsletter/ImageUploadDialog';
import LinkDialog from '@/components/newsletter/LinkDialog';
import NewsletterFormFields from '@/components/newsletter/NewsletterFormFields';
import NewsletterFormActions from '@/components/newsletter/NewsletterFormActions';
import { useNewsletterFormLogic } from '@/hooks/useNewsletterFormLogic';
import { useTextFormatting } from '@/hooks/useTextFormatting';
import { useMediaHandlers } from '@/hooks/useMediaHandlers';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface NewsletterFormProps {
  subject: string;
  setSubject: (subject: string) => void;
  content: string;
  setContent: (content: string) => void;
  onSave: () => void;
  onPreview: () => void;
  isSaving?: boolean;
  newsletterId?: string;
  onSend?: (id: string) => Promise<void>;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({
  subject,
  setSubject,
  content,
  setContent,
  onSave,
  onPreview,
  isSaving = false,
  newsletterId,
  onSend
}) => {
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  
  // Use custom hooks for logic separation
  const {
    textAlignment,
    setTextAlignment,
    textDirection,
    setTextDirection,
    addToHistory,
    handleUndo,
    handleRedo
  } = useNewsletterFormLogic(content, setContent);

  const {
    handleBold,
    handleItalic,
    handleUnderline,
    handleFontSize,
    handleTextColor,
    handleHeading,
    handleList
  } = useTextFormatting(content, setContent, addToHistory);

  const {
    handleLinkInsert,
    handleYoutubeEmbed,
    handleImageInsert
  } = useMediaHandlers(content, setContent, addToHistory);

  // Initialize drag and drop
  useDragAndDrop(content, setContent, addToHistory);
  
  // Text direction handler
  const handleTextDirection = () => {
    const newDirection = textDirection === 'rtl' ? 'ltr' : 'rtl';
    setTextDirection(newDirection);
    
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.direction = newDirection;
    }
  };
  
  // Alignment handlers
  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    setTextAlignment(align);
    
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<div style="text-align: ${align};">${selectedText}</div>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
    }
  };

  return (
    <div className="space-y-6">
      <NewsletterFormFields
        subject={subject}
        setSubject={setSubject}
        content={content}
        setContent={setContent}
        textDirection={textDirection}
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onAlignment={handleAlignment}
        onImageUpload={() => setShowImageUploadDialog(true)}
        onYoutubeEmbed={() => setShowYoutubeDialog(true)}
        onLink={() => setShowLinkDialog(true)}
        onFontSize={handleFontSize}
        onHeading={handleHeading}
        onList={handleList}
        onTextColor={handleTextColor}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTextDirection={handleTextDirection}
      />
      
      <NewsletterFormActions
        onPreview={onPreview}
        onSave={onSave}
        isSaving={isSaving}
        newsletterId={newsletterId}
        onSend={onSend}
      />
      
      <YoutubeDialog 
        isOpen={showYoutubeDialog}
        onClose={() => setShowYoutubeDialog(false)}
        onEmbed={handleYoutubeEmbed}
      />
      
      <ImageUploadDialog
        isOpen={showImageUploadDialog}
        onClose={() => setShowImageUploadDialog(false)}
        onInsertImage={handleImageInsert}
      />
      
      <LinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onInsertLink={handleLinkInsert}
      />
    </div>
  );
};

export default NewsletterForm;

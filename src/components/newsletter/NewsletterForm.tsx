import EditorToolbar from '@/components/newsletter/EditorToolbar';
import ImageUploadDialog from '@/components/newsletter/ImageUploadDialog';
import LinkDialog from '@/components/newsletter/LinkDialog';
import YoutubeDialog from '@/components/newsletter/YoutubeDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
  isSending?: boolean;
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
  onSend,
  isSending = false
}) => {
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('right');
  const [textDirection, setTextDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // Initial history state
  useEffect(() => {
    if (content && editHistory.length === 0) {
      setEditHistory([content]);
      setHistoryIndex(0);
    }
  }, []);

  // Add to history when content changes significantly
  const addToHistory = (newContent: string) => {
    // Only add to history if content changed significantly (more than 10 chars difference)
    if (
      editHistory.length === 0 || 
      Math.abs(editHistory[historyIndex].length - newContent.length) > 10
    ) {
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  // Undo/Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(editHistory[historyIndex - 1]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(editHistory[historyIndex + 1]);
    }
  };
  
  // Text formatting handlers
  const handleBold = () => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<strong>${selectedText}</strong>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
      
      // Reset selection after formatting
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + 8; // Length of <strong>
        textarea.selectionEnd = start + 8 + selectedText.length;
      }, 0);
    }
  };
  
  const handleItalic = () => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<em>${selectedText}</em>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
      
      // Reset selection after formatting
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + 4; // Length of <em>
        textarea.selectionEnd = start + 4 + selectedText.length;
      }, 0);
    }
  };
  
  const handleUnderline = () => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<u>${selectedText}</u>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
      
      // Reset selection after formatting
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + 3; // Length of <u>
        textarea.selectionEnd = start + 3 + selectedText.length;
      }, 0);
    }
  };

  // Font size handler
  const handleFontSize = (size: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<span style="font-size: ${size};">${selectedText}</span>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
    }
  };
  
  // Text color handler
  const handleTextColor = (color: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<span style="color: ${color};">${selectedText}</span>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
    }
  };
  
  // Heading handler
  const handleHeading = (level: number) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const newContent = 
        content.substring(0, start) + 
        `<h${level}>${selectedText}</h${level}>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
    }
  };
  
  // List handler
  const handleList = (type: 'ordered' | 'unordered') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const listItems = selectedText.split('\n').filter(item => item.trim() !== '');
      
      // Create HTML list
      let listHtml = type === 'ordered' ? '<ol>' : '<ul>';
      listItems.forEach(item => {
        listHtml += `<li>${item}</li>`;
      });
      listHtml += type === 'ordered' ? '</ol>' : '</ul>';
      
      const newContent = 
        content.substring(0, start) + 
        listHtml + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
    }
  };
  
  // Text direction handler
  const handleTextDirection = () => {
    const newDirection = textDirection === 'rtl' ? 'ltr' : 'rtl';
    setTextDirection(newDirection);
    
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    textarea.style.direction = newDirection;
  };

  // Link handler
  const handleLinkInsert = (url: string, text: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      const linkText = text || selectedText || url;
      
      const newContent = 
        content.substring(0, start) + 
        `<a href="${url}" target="_blank" style="color: #0066cc; text-decoration: underline;">${linkText}</a>` + 
        content.substring(end);
      
      setContent(newContent);
      addToHistory(newContent);
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
  
  // YouTube embedding with size and position
  const handleYoutubeEmbed = (youtubeUrl: string, size: string, position: string = 'center') => {
    // Extract video ID
    let videoId = '';
    
    // Handle different YouTube URL formats
    if (youtubeUrl.includes('youtube.com/watch')) {
      const url = new URL(youtubeUrl);
      videoId = url.searchParams.get('v') || '';
    } else if (youtubeUrl.includes('youtu.be/')) {
      const parts = youtubeUrl.split('/');
      videoId = parts[parts.length - 1].split('?')[0];
    }
    
    if (videoId) {
      // Determine responsive ratio and width based on selected size
      let containerStyle = 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;';
      let width = '100%';
      
      switch (size) {
        case 'small':
          width = '50%';
          break;
        case 'medium':
          width = '75%';
          break;
        case 'large':
          width = '85%';
          break;
        case 'full':
        default:
          width = '100%';
          break;
      }
      
      // Add float positioning based on the selected position
      let positionStyle = '';
      if (position === 'left') {
        positionStyle = 'float: left; margin-right: 15px; margin-bottom: 10px;';
      } else if (position === 'right') {
        positionStyle = 'float: right; margin-left: 15px; margin-bottom: 10px;';
      } else {
        positionStyle = 'margin: 0 auto;'; // center
      }
      
      containerStyle += ` max-width: ${width}; ${positionStyle}`;
      
      // Create responsive embed code with size and position
      const embedCode = `
<div style="${containerStyle}" class="youtube-embed" draggable="true" data-type="youtube" data-videoid="${videoId}" data-size="${size}" data-position="${position}">
  <iframe 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    src="https://www.youtube.com/embed/${videoId}" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
<div style="clear: both;"></div>
`;
      
      // Insert the embed code at the cursor position or append to the end
      const textarea = document.getElementById('content') as HTMLTextAreaElement;
      
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const newContent = content.substring(0, cursorPos) + embedCode + content.substring(cursorPos);
        setContent(newContent);
        addToHistory(newContent);
      } else {
        const newContent = content + embedCode;
        setContent(newContent);
        addToHistory(newContent);
      }
    }
  };
  
  // Image insertion with size and position
  const handleImageInsert = (imageUrl: string, altText: string, size: string, position: string = 'center') => {
    // Determine width based on selected size
    let width = '50%';
    
    switch (size) {
      case 'small':
        width = '25%';
        break;
      case 'medium':
        width = '50%';
        break;
      case 'large':
        width = '75%';
        break;
      case 'full':
        width = '100%';
        break;
    }
    
    // Add positioning styles
    let positionStyle = '';
    if (position === 'left') {
      positionStyle = 'float: left; margin-right: 15px;';
    } else if (position === 'right') {
      positionStyle = 'float: right; margin-left: 15px;';
    } else {
      positionStyle = 'margin-left: auto; margin-right: auto; display: block;'; // center
    }
    
    const imageHtml = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; width: ${width}; height: auto; margin-bottom: 10px; ${positionStyle}" class="newsletter-image" draggable="true" data-type="image" data-src="${imageUrl}" data-alt="${altText}" data-size="${size}" data-position="${position}" /><div style="clear: both;"></div>`;
    
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const newContent = content.substring(0, cursorPos) + imageHtml + content.substring(cursorPos);
      setContent(newContent);
      addToHistory(newContent);
    } else {
      const newContent = content + imageHtml;
      setContent(newContent);
      addToHistory(newContent);
    }
  };

  // Initialize editor drag and drop after component mounts
  React.useEffect(() => {
    const initializeDragDrop = () => {
      const editorContent = document.getElementById('content');
      if (!editorContent) return;
      
      // Make the content editable for preview purposes to see where we're dropping
      const handleDragStart = (e: DragEvent) => {
        const target = e.target as HTMLElement;
        if (target && (target.classList.contains('newsletter-image') || target.closest('.youtube-embed'))) {
          // Set drag data
          if (e.dataTransfer) {
            const element = target.classList.contains('newsletter-image') ? target : target.closest('.youtube-embed');
            e.dataTransfer.setData('text/plain', element?.outerHTML || '');
            e.dataTransfer.effectAllowed = 'move';
          }
        }
      };
      
      // Handle drop event
      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (!e.dataTransfer) return;
        
        const htmlContent = e.dataTransfer.getData('text/plain');
        if (!htmlContent || !htmlContent.includes('data-type')) return;
        
        // Remove the original element from the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        const isImage = htmlContent.includes('data-type="image"');
        let elementToRemove;
        
        if (isImage) {
          const imgSrc = htmlContent.match(/data-src="([^"]+)"/)?.[1];
          if (imgSrc) {
            elementToRemove = tempDiv.querySelector(`img[data-src="${imgSrc}"]`);
          }
        } else {
          const videoId = htmlContent.match(/data-videoid="([^"]+)"/)?.[1];
          if (videoId) {
            elementToRemove = tempDiv.querySelector(`div[data-videoid="${videoId}"]`);
          }
        }
        
        if (elementToRemove) {
          // Remove the element and its following clear div if it exists
          const nextElement = elementToRemove.nextElementSibling;
          if (nextElement && nextElement.tagName === 'DIV' && nextElement.style.clear === 'both') {
            nextElement.remove();
          }
          elementToRemove.remove();
        }
        
        // Insert at cursor position
        const textarea = document.getElementById('content') as HTMLTextAreaElement;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const newContent = 
            tempDiv.innerHTML.substring(0, cursorPos) +
            htmlContent +
            `<div style="clear: both;"></div>` +
            tempDiv.innerHTML.substring(cursorPos);
          
          setContent(newContent);
          addToHistory(newContent);
        }
      };
      
      // Allow dragover
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
      };
      
      // Add event listeners
      document.addEventListener('dragstart', handleDragStart);
      editorContent.addEventListener('dragover', handleDragOver);
      editorContent.addEventListener('drop', handleDrop);
      
      // Cleanup
      return () => {
        document.removeEventListener('dragstart', handleDragStart);
        editorContent.removeEventListener('dragover', handleDragOver);
        editorContent.removeEventListener('drop', handleDrop);
      };
    };
    
    // Initialize after a delay to ensure everything is rendered
    const timer = setTimeout(() => {
      initializeDragDrop();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, setContent]);

  const handleInsertYoutubeEmbed = (embedCode: string) => {
    setContent(content + embedCode);
    setShowYoutubeDialog(false);
  };
  
  const handleInsertImage = (imageUrl: string, altText: string) => {
    const imageHtml = `<img src="${imageUrl}" alt="${altText}" class="rounded-lg my-4 max-w-full" />`;
    setContent(content + imageHtml);
    setShowImageUploadDialog(false);
  };
  
  const handleInsertLink = (url: string, text: string) => {
    const linkHtml = `<a href="${url}" class="text-blue-600 hover:underline" target="_blank">${text}</a>`;
    setContent(content + linkHtml);
    setShowLinkDialog(false);
  };
  
  const handleSendNewsletter = async () => {
    if (!newsletterId || !onSend) return;
    await onSend(newsletterId);
  };

  return (
    <div className="space-y-6">
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
          onBold={handleBold}
          onItalic={handleItalic}
          onUnderline={handleUnderline}
          onAlignLeft={() => handleAlignment('left')}
          onAlignCenter={() => handleAlignment('center')}
          onAlignRight={() => handleAlignment('right')}
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
      
      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPreview}
          className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          معاينة
        </Button>
        
        <div className="flex gap-2">
          {newsletterId && onSend && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex items-center gap-1"
                  disabled={isSending || isSaving}
                >
                  <Send size={16} />
                  {isSending ? "جار الإرسال..." : "إرسال النشرة"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="dark:text-white">تأكيد إرسال النشرة</AlertDialogTitle>
                  <AlertDialogDescription className="dark:text-gray-300">
                    هل أنت متأكد من رغبتك في إرسال هذه النشرة إلى جميع المشتركين؟ لا يمكن التراجع عن هذا الإجراء.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendNewsletter}>إرسال</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button 
            type="button" 
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "جار الحفظ..." : "حفظ النشرة"}
          </Button>
        </div>
      </div>
      
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


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EditorToolbar from '@/components/newsletter/EditorToolbar';
import YoutubeDialog from '@/components/newsletter/YoutubeDialog';
import ImageUploadDialog from '@/components/newsletter/ImageUploadDialog';
import LinkDialog from '@/components/newsletter/LinkDialog';

interface NewsletterFormProps {
  subject: string;
  setSubject: (subject: string) => void;
  content: string;
  setContent: (content: string) => void;
  onSave: () => void;
  onPreview: () => void;
  isLoading: boolean;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({
  subject,
  setSubject,
  content,
  setContent,
  onSave,
  onPreview,
  isLoading
}) => {
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
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
      let listItems = selectedText.split('\n').filter(item => item.trim() !== '');
      
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
  const handleLink = (url: string, text: string) => {
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

  return (
    <>
      {/* YouTube Dialog with Size and Position Control */}
      <YoutubeDialog 
        isOpen={showYoutubeDialog} 
        onClose={() => setShowYoutubeDialog(false)} 
        onEmbed={handleYoutubeEmbed} 
      />
      
      {/* Image Upload Dialog with Size Control */}
      <ImageUploadDialog 
        isOpen={showImageDialog} 
        onClose={() => setShowImageDialog(false)} 
        onInsertImage={handleImageInsert} 
      />

      {/* Link Dialog */}
      <LinkDialog 
        isOpen={showLinkDialog} 
        onClose={() => setShowLinkDialog(false)} 
        onInsertLink={handleLink} 
      />
    
      <div className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">عنوان النشرة الإخبارية</label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="أدخل عنوان النشرة الإخبارية"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">محتوى النشرة الإخبارية</label>
          
          <EditorToolbar 
            onBold={handleBold}
            onItalic={handleItalic}
            onUnderline={handleUnderline}
            onAlignLeft={() => handleAlignment('left')}
            onAlignCenter={() => handleAlignment('center')}
            onAlignRight={() => handleAlignment('right')}
            onImageUpload={() => setShowImageDialog(true)}
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
          
          <div className={`border rounded-md ${textAlignment === 'right' ? 'text-right' : textAlignment === 'center' ? 'text-center' : 'text-left'}`}>
            <textarea
              id="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                // Don't add to history for every keystroke
                if (e.target.value.length % 50 === 0) { // Every ~50 chars
                  addToHistory(e.target.value);
                }
              }}
              placeholder="أدخل محتوى النشرة الإخبارية..."
              className={`min-h-[300px] w-full p-2 rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-primary`}
              style={{direction: textDirection}}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1">
            <p className="text-xs text-gray-500">
              يمكنك استخدام وسوم HTML الأساسية وسيظهر النص بالتنسيق المطلوب في النشرة الإخبارية. اسحب الصور ومقاطع الفيديو لتغيير موقعها.
            </p>
            <div className="text-xs text-gray-500 mt-2 sm:mt-0">
              {editHistory.length > 0 && (
                <span>
                  تغييرات: {historyIndex + 1}/{editHistory.length}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onPreview}>
            معاينة
          </Button>
          
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? "جارِ الحفظ..." : "حفظ النشرة الإخبارية"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default NewsletterForm;


import { useEffect } from 'react';

export const useDragAndDrop = (content: string, setContent: (content: string) => void, addToHistory: (content: string) => void) => {
  useEffect(() => {
    const initializeDragDrop = () => {
      const editorContent = document.getElementById('content');
      if (!editorContent) return;
      
      // Handle drag start
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
  }, [content, setContent, addToHistory]);
};

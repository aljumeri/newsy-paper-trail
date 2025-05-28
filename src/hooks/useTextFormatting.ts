
export const useTextFormatting = (content: string, setContent: (content: string) => void, addToHistory: (content: string) => void) => {
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

  return {
    handleBold,
    handleItalic,
    handleUnderline,
    handleFontSize,
    handleTextColor,
    handleHeading,
    handleList
  };
};

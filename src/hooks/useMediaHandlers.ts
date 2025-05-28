
export const useMediaHandlers = (content: string, setContent: (content: string) => void, addToHistory: (content: string) => void) => {
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

  return {
    handleLinkInsert,
    handleYoutubeEmbed,
    handleImageInsert
  };
};

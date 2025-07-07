import { useCallback, useRef, useState } from 'react';

interface SelectionRange {
  start: number;
  end: number;
}

interface ButtonPosition {
  x: number;
  y: number;
}

interface LinkInfo {
  isLink: boolean;
  linkText: string;
  url: string;
  fullLink: string;
}

export const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [showLinkButton, setShowLinkButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>({ x: 0, y: 0 });
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = useCallback((originalText?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setShowLinkButton(false);
      setSelectedText('');
      setLinkInfo(null);
      return;
    }
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length === 0) {
      setShowLinkButton(false);
      setSelectedText('');
      setLinkInfo(null);
      return;
    }
    if (!containerRef.current) {
      setShowLinkButton(false);
      setLinkInfo(null);
      return;
    }
    const range = selection.getRangeAt(0);
    
    // More strict container checking to prevent interference with other text areas
    const isWithinContainer = containerRef.current.contains(range.commonAncestorContainer) &&
                             (containerRef.current === range.commonAncestorContainer || 
                              containerRef.current.contains(range.commonAncestorContainer.parentElement));
    
    // Additional check to ensure we're not interfering with other text areas
    const selectedElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
      ? range.commonAncestorContainer.parentElement 
      : range.commonAncestorContainer as Element;
    
    if (selectedElement && selectedElement.hasAttribute('data-text-id')) {
      const containerElement = containerRef.current.querySelector('[data-text-id]');
      if (containerElement && containerElement.getAttribute('data-text-id') !== selectedElement.getAttribute('data-text-id')) {
        setShowLinkButton(false);
        setSelectedText('');
        setLinkInfo(null);
        return;
      }
    }
    
    if (!isWithinContainer) {
      setShowLinkButton(false);
      setSelectedText('');
      setLinkInfo(null);
      return;
    }

    // Check if the selected text is a markdown link
    const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
    const linkMatch = selectedText.match(linkRegex);
    
    let foundLink = null;
    if (linkMatch) {
      foundLink = {
        isLink: true,
        linkText: linkMatch[1],
        url: linkMatch[2],
        fullLink: selectedText
      };
    } else if (originalText) {
      // Try to find if the selected text corresponds to a link in the original text
      const linkRegexGlobal = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegexGlobal.exec(originalText)) !== null) {
        if (match[1] === selectedText) {
          foundLink = {
            isLink: true,
            linkText: match[1],
            url: match[2],
            fullLink: match[0]
          };
          break;
        }
      }
    }
    setLinkInfo(foundLink);

    setSelectedText(selectedText);
    const rect = range.getBoundingClientRect();
    let buttonX = rect.left + rect.width / 2;
    let buttonY = rect.top - 50;
    const viewportWidth = window.innerWidth;
    const minX = 60;
    const maxX = viewportWidth - 120;
    buttonX = Math.max(minX, Math.min(buttonX, maxX));
    if (buttonY < 10) {
      buttonY = rect.bottom + 10;
    }
    setButtonPosition({
      x: buttonX,
      y: Math.max(10, buttonY)
    });
    
    // Calculate selection range based on original text
    if (originalText) {
      if (foundLink) {
        // If we found a link, use the position of the full markdown link
        const startOffset = originalText.indexOf(foundLink.fullLink);
        if (startOffset !== -1) {
          setSelectionRange({
            start: startOffset,
            end: startOffset + foundLink.fullLink.length
          });
        }
      } else {
        // For regular text, find the position of the selected text
        const startOffset = originalText.indexOf(selectedText);
        if (startOffset !== -1) {
          setSelectionRange({
            start: startOffset,
            end: startOffset + selectedText.length
          });
        }
      }
    } else {
      // Fallback to container text content
      const containerText = containerRef.current.textContent || '';
      const startOffset = containerText.indexOf(selectedText);
      if (startOffset !== -1) {
        setSelectionRange({
          start: startOffset,
          end: startOffset + selectedText.length
        });
      }
    }
    setShowLinkButton(true);
  }, []);

  const clearSelection = useCallback(() => {
    setShowLinkButton(false);
    setSelectionRange(null);
    setSelectedText('');
    setLinkInfo(null);
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  const hideButton = useCallback(() => {
    setShowLinkButton(false);
  }, []);

  return {
    selectedText,
    selectionRange,
    showLinkButton,
    buttonPosition,
    linkInfo,
    containerRef,
    handleTextSelection,
    clearSelection,
    hideButton
  };
}; 

import { useState, useRef, useCallback } from 'react';

interface SelectionRange {
  start: number;
  end: number;
}

interface ButtonPosition {
  x: number;
  y: number;
}

export const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [showLinkButton, setShowLinkButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = useCallback(() => {
    console.log('Text selection triggered');
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      console.log('No selection available');
      setShowLinkButton(false);
      setSelectedText('');
      return;
    }

    const selectedText = selection.toString().trim();
    console.log('Selected text:', selectedText);
    
    if (!selectedText || selectedText.length === 0) {
      console.log('No text selected');
      setShowLinkButton(false);
      setSelectedText('');
      return;
    }

    if (!containerRef.current) {
      console.log('No container ref');
      setShowLinkButton(false);
      return;
    }

    // Get the range and check if it's within our container
    const range = selection.getRangeAt(0);
    
    // Check if selection is within our container
    const isWithinContainer = containerRef.current.contains(range.commonAncestorContainer) ||
                             containerRef.current.contains(range.startContainer) ||
                             containerRef.current.contains(range.endContainer);

    console.log('Selection within container:', isWithinContainer);

    if (!isWithinContainer) {
      console.log('Selection not within container');
      setShowLinkButton(false);
      setSelectedText('');
      return;
    }

    // Store the selected text
    setSelectedText(selectedText);
    
    // Calculate position for the link button
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate button position relative to viewport for proper positioning
    let buttonX = rect.left + rect.width / 2;
    let buttonY = rect.top - 50; // Position above the selection
    
    // Ensure button stays within viewport
    const viewportWidth = window.innerWidth;
    const minX = 60;
    const maxX = viewportWidth - 120;
    
    buttonX = Math.max(minX, Math.min(buttonX, maxX));
    
    // If no space above, position below
    if (buttonY < 10) {
      buttonY = rect.bottom + 10;
    }
    
    console.log('Button position:', { x: buttonX, y: buttonY });
    console.log('Range rect:', rect);
    console.log('Container rect:', containerRect);
    
    setButtonPosition({
      x: buttonX,
      y: Math.max(10, buttonY)
    });
    
    // Store selection range relative to container text
    const containerText = containerRef.current.textContent || '';
    const startOffset = containerText.indexOf(selectedText);
    if (startOffset !== -1) {
      setSelectionRange({
        start: startOffset,
        end: startOffset + selectedText.length
      });
      console.log('Selection range set:', { start: startOffset, end: startOffset + selectedText.length });
    }
    
    setShowLinkButton(true);
    console.log('Link button should now be visible with text:', selectedText);
  }, []);

  const clearSelection = useCallback(() => {
    console.log('Clearing selection');
    setShowLinkButton(false);
    setSelectionRange(null);
    setSelectedText('');
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  const hideButton = useCallback(() => {
    console.log('Hiding button');
    setShowLinkButton(false);
  }, []);

  return {
    selectedText,
    selectionRange,
    showLinkButton,
    buttonPosition,
    containerRef,
    handleTextSelection,
    clearSelection,
    hideButton
  };
};

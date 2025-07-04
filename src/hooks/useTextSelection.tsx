import { useCallback, useRef, useState } from 'react';

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
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setShowLinkButton(false);
      setSelectedText('');
      return;
    }
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length === 0) {
      setShowLinkButton(false);
      setSelectedText('');
      return;
    }
    if (!containerRef.current) {
      setShowLinkButton(false);
      return;
    }
    const range = selection.getRangeAt(0);
    const isWithinContainer = containerRef.current.contains(range.commonAncestorContainer) ||
                             containerRef.current.contains(range.startContainer) ||
                             containerRef.current.contains(range.endContainer);
    if (!isWithinContainer) {
      setShowLinkButton(false);
      setSelectedText('');
      return;
    }
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
    const containerText = containerRef.current.textContent || '';
    const startOffset = containerText.indexOf(selectedText);
    if (startOffset !== -1) {
      setSelectionRange({
        start: startOffset,
        end: startOffset + selectedText.length
      });
    }
    setShowLinkButton(true);
  }, []);

  const clearSelection = useCallback(() => {
    setShowLinkButton(false);
    setSelectionRange(null);
    setSelectedText('');
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
    containerRef,
    handleTextSelection,
    clearSelection,
    hideButton
  };
}; 
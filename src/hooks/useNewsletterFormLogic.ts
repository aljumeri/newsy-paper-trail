
import { useState, useEffect } from 'react';

export const useNewsletterFormLogic = (content: string, setContent: (content: string) => void) => {
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
  }, [content, editHistory.length]);

  // Add to history when content changes significantly
  const addToHistory = (newContent: string) => {
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

  return {
    textAlignment,
    setTextAlignment,
    textDirection,
    setTextDirection,
    addToHistory,
    handleUndo,
    handleRedo
  };
};

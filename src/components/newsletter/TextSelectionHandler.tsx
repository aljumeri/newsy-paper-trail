import React, { useEffect, useState } from 'react';
import { useTextSelection } from '../../hooks/useTextSelection';
import LinkButton from './LinkButton';
import LinkModal from './LinkModal';

interface TextSelectionHandlerProps {
  children: React.ReactNode;
  onTextChange: (newText: string) => void;
  value: string;
}

const TextSelectionHandler: React.FC<TextSelectionHandlerProps> = ({
  children,
  onTextChange,
  value
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const {
    selectedText,
    selectionRange,
    showLinkButton,
    buttonPosition,
    containerRef,
    handleTextSelection,
    clearSelection,
    hideButton
  } = useTextSelection();

  const handleAddLink = (url: string, linkText: string) => {
    if (!selectionRange) return;
    const { start, end } = selectionRange;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    const linkMarkdown = `[${linkText}](${url})`;
    const newText = beforeText + linkMarkdown + afterText;
    onTextChange(newText);
    clearSelection();
    setIsLinkModalOpen(false);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setTimeout(() => {
      handleTextSelection();
    }, 150);
  };

  const handleLinkButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsLinkModalOpen(true);
  };

  const handleModalClose = () => {
    setIsLinkModalOpen(false);
    hideButton();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      hideButton();
    }
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (showLinkButton && !isLinkModalOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-link-button]') && !target.closest('[role="dialog"]')) {
          hideButton();
        }
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [showLinkButton, isLinkModalOpen, hideButton]);

  return (
    <div 
      ref={containerRef}
      className="relative"
      onMouseUp={handleMouseUp}
      onClick={handleContainerClick}
    >
      {children}
      {showLinkButton && (
        <div data-link-button>
          <LinkButton
            position={buttonPosition}
            onClick={handleLinkButtonClick}
          />
        </div>
      )}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={handleModalClose}
        onAddLink={handleAddLink}
        selectedText={selectedText}
      />
    </div>
  );
};

export default TextSelectionHandler; 
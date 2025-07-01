
import React, { useState, useEffect } from 'react';
import LinkModal from './LinkModal';
import LinkButton from './LinkButton';
import { useTextSelection } from '../hooks/useTextSelection';

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
    console.log('Adding link:', { url, linkText, selectionRange });
    if (!selectionRange) {
      console.log('No selection range available');
      return;
    }

    const { start, end } = selectionRange;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    // Create the link markdown
    const linkMarkdown = `[${linkText}](${url})`;
    const newText = beforeText + linkMarkdown + afterText;
    
    console.log('New text with link:', newText);
    onTextChange(newText);
    clearSelection();
    setIsLinkModalOpen(false);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    console.log('Mouse up event triggered');
    // Delay to ensure selection is complete
    setTimeout(() => {
      handleTextSelection();
    }, 150);
  };

  const handleLinkButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Link button clicked - opening modal with selected text:', selectedText);
    setIsLinkModalOpen(true);
  };

  const handleModalClose = () => {
    console.log('Modal closing');
    setIsLinkModalOpen(false);
    hideButton();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only hide if clicking directly on the container, not child elements
    if (e.target === e.currentTarget) {
      console.log('Container clicked directly, hiding button');
      hideButton();
    }
  };

  // Handle document click to hide button when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (showLinkButton && !isLinkModalOpen) {
        const target = e.target as HTMLElement;
        // Don't hide if clicking on the button itself or modal
        if (!target.closest('[data-link-button]') && !target.closest('[role="dialog"]')) {
          console.log('Document clicked, hiding button');
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

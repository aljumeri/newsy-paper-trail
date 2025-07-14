import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, List, ListOrdered } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import TextSelectionHandler from './TextSelectionHandler';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  isTitle?: boolean;
  readOnly?: boolean;
  showPlaceholder?: boolean;
  fontSize?: string;
  uniqueId?: string;
  style?: React.CSSProperties;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  multiline = false,
  isTitle = false,
  readOnly = false,
  showPlaceholder = true,
  fontSize,
  uniqueId,
  style,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!readOnly) {
      setIsEditing(true);
      setTempValue(value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Only save content if it's not empty or just whitespace
    const trimmedValue = tempValue.trim();
    if (trimmedValue !== '') {
      onChange(trimmedValue);
    } else {
      // If the content is empty or just whitespace, save empty string
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value);
    }
  };

  const handleList = (type: 'ordered' | 'unordered') => {
    if (!isEditing) return;

    const textarea = inputRef.current;
    if (!textarea) return;

    // Prevent blur event from firing when clicking toolbar buttons
    textarea.focus();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = tempValue.substring(start, end);

    if (selectedText) {
      const lines = selectedText.split('\n');

      // Check if most lines are already formatted as the selected list type
      const isOrderedList = type === 'ordered';
      const orderedRegex = /^\d+\.\s/;
      const unorderedRegex = /^•\s/;

      const formattedLines = lines.filter(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return false; // Don't count empty lines

        if (isOrderedList) {
          return orderedRegex.test(trimmedLine);
        } else {
          return unorderedRegex.test(trimmedLine);
        }
      });

      const nonEmptyLines = lines.filter(line => line.trim() !== '');
      const mostLinesFormatted =
        formattedLines.length > 0 &&
        formattedLines.length >= nonEmptyLines.length * 0.5;

      if (mostLinesFormatted) {
        // Remove list formatting from all lines
        const unformattedLines = lines.map(line => {
          const trimmedLine = line.trim();
          if (trimmedLine === '') return line; // Keep empty lines as is

          if (isOrderedList) {
            return line.replace(orderedRegex, '');
          } else {
            return line.replace(unorderedRegex, '');
          }
        });

        const unformattedText = unformattedLines.join('\n');

        const newText =
          tempValue.substring(0, start) +
          unformattedText +
          tempValue.substring(end);
        setTempValue(newText);

        // Set cursor position after the unformatted text
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.selectionStart = start + unformattedText.length;
            textarea.selectionEnd = start + unformattedText.length;
          }
        }, 0);
      } else {
        // Add list formatting to all non-empty lines
        let itemCounter = 1;
        const formattedLines = lines.map(line => {
          const trimmedLine = line.trim();
          if (trimmedLine === '') return line; // Keep empty lines as is

          if (isOrderedList) {
            return `${itemCounter++}. ${trimmedLine}`;
          } else {
            return `• ${trimmedLine}`;
          }
        });

        const formattedText = formattedLines.join('\n');

        const newText =
          tempValue.substring(0, start) +
          formattedText +
          tempValue.substring(end);
        setTempValue(newText);

        // Set cursor position after the formatted text
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.selectionStart = start + formattedText.length;
            textarea.selectionEnd = start + formattedText.length;
          }
        }, 0);
      }
    } else {
      // If no text is selected, add a list item at cursor position
      const listItem = type === 'ordered' ? '1. ' : '• ';

      const newText =
        tempValue.substring(0, start) + listItem + tempValue.substring(start);
      setTempValue(newText);

      // Set cursor position after the list item
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.selectionStart = start + listItem.length;
          textarea.selectionEnd = start + listItem.length;
        }
      }, 0);
    }
  };

  const handleBold = () => {
    if (!isEditing) return;

    const textarea = inputRef.current;
    if (!textarea) return;

    // Prevent blur event from firing when clicking toolbar buttons
    textarea.focus();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = tempValue.substring(start, end);

    if (selectedText) {
      // Check if the selected text starts and ends with ** (allowing for whitespace)
      const trimmedText = selectedText.trim();
      const boldRegex = /^\*\*(.*)\*\*$/;
      const match = trimmedText.match(boldRegex);

      if (match) {
        // Text is already bold, remove the bold formatting
        const unboldText = match[1];

        const newText =
          tempValue.substring(0, start) + unboldText + tempValue.substring(end);
        setTempValue(newText);

        // Set cursor position after the unbolded text
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.selectionStart = start + unboldText.length;
            textarea.selectionEnd = start + unboldText.length;
          }
        }, 0);
      } else {
        // Text is not bold, add bold formatting
        const boldText = `**${selectedText}**`;

        const newText =
          tempValue.substring(0, start) + boldText + tempValue.substring(end);
        setTempValue(newText);

        // Set cursor position after the bold text
        setTimeout(() => {
          if (textarea) {
            textarea.focus();
            textarea.selectionStart = start + boldText.length;
            textarea.selectionEnd = start + boldText.length;
          }
        }, 0);
      }
    } else {
      // If no text is selected, add bold markers at cursor position
      const boldMarkers = '**';

      const newText =
        tempValue.substring(0, start) +
        boldMarkers +
        tempValue.substring(start);
      setTempValue(newText);

      // Set cursor position between the bold markers
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.selectionStart = start + boldMarkers.length;
          textarea.selectionEnd = start + boldMarkers.length;
        }
      }, 0);
    }
  };

  // Function to render markdown links and bold text
  const renderTextWithLinks = (text: string) => {
    if (!text || text.trim() === '') {
      // Only show placeholder text when not in readOnly mode and showPlaceholder is true
      return !readOnly && showPlaceholder ? placeholder : '';
    }

    // Process bold text first: **text** -> <strong>text</strong>
    const boldRegex = /\*\*(.*?)\*\*/g;
    let processedText = text;
    let boldMatches = [];
    let boldMatch;

    // Find all bold matches
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      boldMatches.push({
        index: boldMatch.index,
        text: boldMatch[1],
        fullMatch: boldMatch[0],
      });
    }

    // Simple markdown link regex: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(processedText)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        const textBefore = processedText.substring(lastIndex, match.index);
        // Process bold text in this segment
        parts.push(processBoldText(textBefore));
      }

      // Add the link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
          onClick={e => e.stopPropagation()}
        >
          {match[1]}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < processedText.length) {
      const remainingText = processedText.substring(lastIndex);
      parts.push(processBoldText(remainingText));
    }

    return parts.length > 0 ? parts : processBoldText(processedText);
  };

  // Helper function to process bold text
  const processBoldText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Add the bold text
      parts.push(<strong key={match.index}>{match[1]}</strong>);

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  if (readOnly) {
    return (
      <div
        className={`${className} ${
          fontSize || 'text-base'
        } rounded px-2 text-justify min-h-[1.5rem] select-text whitespace-pre-line`}
        dir="rtl"
        data-text-id={uniqueId}
        style={style}
      >
        {renderTextWithLinks(value)}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        {/* Toolbar */}
        <div className="flex gap-1 p-1 border rounded-md bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleList('unordered')}
            onMouseDown={e => e.preventDefault()}
            title="قائمة نقطية"
            className="h-8 px-2"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleList('ordered')}
            onMouseDown={e => e.preventDefault()}
            title="قائمة مرقمة"
            className="h-8 px-2"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBold}
            onMouseDown={e => e.preventDefault()}
            title="ملفوف"
            className="h-8 px-2"
          >
            <Bold className="h-4 w-4" />
          </Button>
        </div>

        {/* Textarea */}
        <Textarea
          ref={inputRef}
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${className} ${
            fontSize || ''
          } resize-none text-black border-2 border-logo-blue`}
          placeholder={placeholder}
          rows={multiline ? 3 : 1}
          dir="rtl"
        />
      </div>
    );
  }

  return (
    <TextSelectionHandler value={value} onTextChange={onChange}>
      <div
        onDoubleClick={handleDoubleClick}
        className={`${className} ${
          fontSize || 'text-base'
        } rounded px-2  transition-colors min-h-[1.5rem] select-text whitespace-pre-line ${
          !value || value.trim() === '' ? 'text-black italic' : ''
        }`}
        dir="rtl"
        data-text-id={uniqueId}
        style={style}
      >
        {!value || value.trim() === ''
          ? placeholder
          : renderTextWithLinks(value)}
      </div>
    </TextSelectionHandler>
  );
};

export default EditableText;

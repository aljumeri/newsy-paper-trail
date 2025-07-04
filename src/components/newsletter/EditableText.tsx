import { Textarea } from '@/components/ui/textarea';
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
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  multiline = false,
  isTitle = false,
  readOnly = false,
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
    onChange(tempValue);
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

  // Function to render markdown links as actual links
  const renderTextWithLinks = (text: string) => {
    if (!text) return placeholder;

    // Simple markdown link regex: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
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
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  if (readOnly) {
    return (
      <div
        className={`${className} rounded px-2 py-1 min-h-[1.5rem] select-text ${!value ? 'text-gray-400' : ''}`}
        dir="rtl"
      >
        {renderTextWithLinks(value)}
      </div>
    );
  }

  if (isEditing) {
    return (
      <Textarea
        ref={inputRef}
        value={tempValue}
        onChange={e => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} resize-none text-black border-2 border-logo-blue`}
        placeholder={placeholder}
        rows={multiline ? 3 : 1}
        dir="rtl"
      />
    );
  }

  return (
    <TextSelectionHandler value={value} onTextChange={onChange}>
      <div
        onDoubleClick={handleDoubleClick}
        className={`${className} rounded px-2 py-1 transition-colors min-h-[1.5rem] select-text ${
          !value ? 'text-gray-400' : ''
        }`}
        dir="rtl"
      >
        {renderTextWithLinks(value)}
      </div>
    </TextSelectionHandler>
  );
};

export default EditableText;

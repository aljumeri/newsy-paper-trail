import React from 'react';

interface ListItem {
  id: string;
  text: string;
  color: string;
}

interface ListData {
  id: string;
  type: 'bullet' | 'numbered';
  items: ListItem[];
}

interface ListDisplayProps {
  lists: ListData[];
}

const ListDisplay: React.FC<ListDisplayProps> = ({ lists }) => {
  // Function to render markdown links as actual links
  const renderTextWithLinks = (text: string) => {
    if (!text) return '';

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

  if (lists.length === 0) return null;

  return (
    <div className="space-y-6">
      {lists.map((list) => (
        <div key={list.id} className="space-y-3">
          {list.items.map((item, itemIndex) => (
            <div key={item.id} className="flex items-start gap-4 text-right" dir="rtl">
              {/* Bullet or Number */}
              <div className="flex-shrink-0 mt-1">
                {list.type === 'bullet' ? (
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                ) : (
                  <span
                    className="font-bold text-xl leading-none"
                    style={{ color: item.color }}
                  >
                    {String(itemIndex + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {renderTextWithLinks(item.text)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ListDisplay; 
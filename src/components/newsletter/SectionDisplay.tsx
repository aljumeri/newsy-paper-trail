import { Card } from '@/components/ui/card';
import ListDisplay from './ListDisplay';
import MediaDisplay from './MediaDisplay';
import SubsectionList from './SubsectionList';
import { Section } from './types';

interface SectionDisplayProps {
  section: Section;
}

const SectionDisplay: React.FC<SectionDisplayProps> = ({ section }) => {
  // Function to render markdown links and bold text
  const renderTextWithLinks = (text: string) => {
    if (!text) return '';

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
        fullMatch: boldMatch[0]
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
      parts.push(
        <strong key={match.index}>
          {match[1]}
        </strong>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Helper function to render styled bullet/numbered lists inside content
  const renderStyledContent = (content: string, fontSize: string, bulletColor: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    const elements = [];
    let inList = false;
    let listType: 'bullet' | 'numbered' | null = null;
    let listItems: string[] = [];
    const flushList = () => {
      if (listItems.length > 0 && listType) {
        elements.push(
          <ul key={elements.length} className={`mb-2 pl-6`} style={{ listStyle: 'none' }}>
            {listItems.map((item, idx) => (
              <li key={idx} className={`flex items-start gap-2 ${fontSize || 'text-lg'}`}>
                {listType === 'bullet' ? (
                  <span className="inline-block mt-2 w-3 h-3 rounded-full" style={{ backgroundColor: bulletColor, minWidth: '0.75rem' }} />
                ) : (
                  <span className="inline-block font-bold mr-1" style={{ color: bulletColor }}>{idx + 1}.</span>
                )}
                <span className="break-words">{item.replace(/^([•\d]+\.\s)/, '')}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
        listType = null;
      }
    };
    lines.forEach(line => {
      if (/^•\s/.test(line)) {
        if (!inList || listType !== 'bullet') flushList();
        inList = true;
        listType = 'bullet';
        listItems.push(line);
      } else if (/^\d+\.\s/.test(line)) {
        if (!inList || listType !== 'numbered') flushList();
        inList = true;
        listType = 'numbered';
        listItems.push(line);
      } else {
        flushList();
        elements.push(
          <div key={elements.length} className={`mb-2 ${fontSize || 'text-lg'} break-words`}>{line}</div>
        );
      }
    });
    flushList();
    return elements;
  };

  return (
    <Card className={`${section.backgroundColor} relative overflow-hidden shadow-lg`}>
      {/* Decorative side line - right side only for RTL layout */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 rounded-r-lg"
        style={{ backgroundColor: section.sideLineColor }}
      />
      <div className="p-3 sm:p-6 pr-4 sm:pr-8 pl-3 sm:pl-6">
        {/* Section Title */}
        <h2
          className={`font-bold mb-3 sm:mb-4 break-words w-full ${section.titleFontSize || 'text-2xl'}`}
          style={section.titleColor ? { color: section.titleColor } : undefined}
        >
          {renderTextWithLinks(section.title)}
        </h2>
        {/* Section Content */}
        <div className={`text-gray-700 mb-4 sm:mb-6 leading-relaxed break-words w-full`}>
          {renderStyledContent(section.content, section.contentFontSize || 'text-lg', section.sideLineColor || '#4F46E5')}
        </div>
        {/* Media Items */}
        <MediaDisplay items={section.mediaItems || []} onRemove={() => {}} readOnly={true} />
        {/* Lists */}
        <div className="mb-4 sm:mb-6">
          <ListDisplay lists={section.lists || []} />
        </div>
        {section.afterListContent && (
          <div className={`text-gray-700 leading-relaxed mt-2 ${section.afterListContentFontSize || section.contentFontSize || 'text-lg'}`}>{section.afterListContent}</div>
        )}
        {/* Subsections */}
        <SubsectionList subsections={section.subsections} readOnly={true} />
      </div>
    </Card>
  );
};

export default SectionDisplay; 
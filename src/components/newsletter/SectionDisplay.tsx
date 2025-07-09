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

  return (
    <Card className={`${section.backgroundColor} relative overflow-hidden shadow-lg`}>
      {/* Decorative side line - right side only for RTL layout */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 rounded-r-lg"
        style={{ backgroundColor: section.sideLineColor }}
      />
      <div className="p-6 pr-8 pl-6">
        {/* Section Title */}
        <h2
          className={`font-bold mb-4 ${section.titleFontSize || 'text-2xl'}`}
          style={section.titleColor ? { color: section.titleColor } : undefined}
        >
          {renderTextWithLinks(section.title)}
        </h2>
        {/* Section Content */}
        <div className={`text-gray-700 mb-6 leading-relaxed ${section.contentFontSize || 'text-lg'} whitespace-pre-line`}>{renderTextWithLinks(section.content)}</div>
        {/* Media Items */}
        <MediaDisplay items={section.mediaItems || []} onRemove={() => {}} readOnly={true} />
        {/* Lists */}
        <div className="mb-6">
          <ListDisplay lists={section.lists || []} />
        </div>
        {/* Subsections */}
        <SubsectionList subsections={section.subsections} readOnly={true} />
      </div>
    </Card>
  );
};

export default SectionDisplay; 
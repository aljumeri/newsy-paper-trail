import { Card } from '@/components/ui/card';
import ListDisplay from './ListDisplay';
import MediaDisplay from './MediaDisplay';
import SubsectionList from './SubsectionList';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'youtube' | 'link';
  url: string;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
}

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

interface Subsection {
  id: string;
  title: string;
  content: string;
  mediaItems?: MediaItem[];
  titleFontSize?: string;
  contentFontSize?: string;
}

interface Section {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  sideLineColor: string;
  subsections: Subsection[];
  mediaItems?: MediaItem[];
  lists?: ListData[];
  titleFontSize?: string;
  contentFontSize?: string;
}

interface SectionDisplayProps {
  section: Section;
}

const SectionDisplay: React.FC<SectionDisplayProps> = ({ section }) => {
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

  return (
    <Card className={`${section.backgroundColor} relative overflow-hidden shadow-lg`}>
      {/* Decorative side line - right side only for RTL layout */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 rounded-r-lg"
        style={{ backgroundColor: section.sideLineColor }}
      />
      <div className="p-6 pr-8 pl-6">
        {/* Section Title */}
        <h2 className={`font-bold text-gray-800 mb-4 ${section.titleFontSize || 'text-2xl'}`}>{renderTextWithLinks(section.title)}</h2>
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
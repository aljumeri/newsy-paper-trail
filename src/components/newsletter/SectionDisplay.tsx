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
}

interface SectionDisplayProps {
  section: Section;
}

const SectionDisplay: React.FC<SectionDisplayProps> = ({ section }) => {
  return (
    <Card className={`${section.backgroundColor} relative overflow-hidden shadow-lg`}>
      {/* Decorative side line - right side only for RTL layout */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 rounded-r-lg"
        style={{ backgroundColor: section.sideLineColor }}
      />
      <div className="p-6 pr-8 pl-6">
        {/* Section Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{section.title}</h2>
        {/* Section Content */}
        <div className="text-gray-700 mb-6 leading-relaxed text-lg whitespace-pre-line">{section.content}</div>
        {/* Media Items */}
        <MediaDisplay items={section.mediaItems || []} onRemove={() => {}} />
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
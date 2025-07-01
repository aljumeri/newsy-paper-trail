
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import EditableText from './EditableText';
import MediaUploader from './MediaUploader';
import MediaDisplay from './MediaDisplay';
import ListEditor from './ListEditor';
import ListDisplay from './ListDisplay';
import SectionHeader from './SectionHeader';
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

interface EditableSectionProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
}

const EditableSection: React.FC<EditableSectionProps> = ({ 
  section, 
  onUpdate, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMediaUploaderOpen, setIsMediaUploaderOpen] = useState(false);

  const addSubsection = () => {
    const newSubsection: Subsection = {
      id: Date.now().toString(),
      title: 'عنوان فرعي جديد',
      content: 'محتوى القسم الفرعي'
    };
    onUpdate({
      subsections: [...section.subsections, newSubsection]
    });
  };

  const updateSubsection = (subsectionId: string, updates: Partial<Subsection>) => {
    onUpdate({
      subsections: section.subsections.map(sub =>
        sub.id === subsectionId ? { ...sub, ...updates } : sub
      )
    });
  };

  const deleteSubsection = (subsectionId: string) => {
    onUpdate({
      subsections: section.subsections.filter(sub => sub.id !== subsectionId)
    });
  };

  const addMediaItem = (mediaData: Omit<MediaItem, 'id'>) => {
    const newMediaItem: MediaItem = {
      ...mediaData,
      id: Date.now().toString(),
      size: 'medium',
      alignment: 'center'
    };
    const currentMedia = section.mediaItems || [];
    onUpdate({
      mediaItems: [...currentMedia, newMediaItem]
    });
  };

  const removeMediaItem = (mediaId: string) => {
    const currentMedia = section.mediaItems || [];
    onUpdate({
      mediaItems: currentMedia.filter(item => item.id !== mediaId)
    });
  };

  const updateMediaItem = (mediaId: string, updates: Partial<MediaItem>) => {
    const currentMedia = section.mediaItems || [];
    onUpdate({
      mediaItems: currentMedia.map(item => 
        item.id === mediaId ? { ...item, ...updates } : item
      )
    });
  };

  const updateLists = (lists: ListData[]) => {
    onUpdate({ lists });
  };

  return (
    <>
      <Card className={`${section.backgroundColor} relative overflow-hidden shadow-lg`}>
        {/* Decorative side line - right side only for RTL layout */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-2 rounded-r-lg"
          style={{ backgroundColor: section.sideLineColor }}
        />
        
        <div className="p-6 pr-8 pl-6">
          {/* Section Header */}
          <SectionHeader
            section={section}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onOpenMediaUploader={() => setIsMediaUploaderOpen(true)}
          />

          {/* Section Title */}
          <EditableText
            value={section.title}
            onChange={(title) => onUpdate({ title })}
            className="text-2xl font-bold text-gray-800 mb-4"
            placeholder="عنوان القسم..."
            isTitle={true}
          />

          {/* Section Content */}
          <EditableText
            value={section.content}
            onChange={(content) => onUpdate({ content })}
            className="text-gray-700 mb-6 leading-relaxed text-lg"
            placeholder="محتوى القسم..."
            multiline
            isTitle={false}
          />

          {/* Media Items */}
          <MediaDisplay 
            items={section.mediaItems || []} 
            onRemove={removeMediaItem}
            onUpdate={updateMediaItem}
          />

          {/* Lists */}
          {isEditing ? (
            <div className="mb-6">
              <ListEditor 
                lists={section.lists || []} 
                onUpdate={updateLists}
              />
            </div>
          ) : (
            <div className="mb-6">
              <ListDisplay lists={section.lists || []} />
            </div>
          )}

          {/* Subsections */}
          <SubsectionList
            subsections={section.subsections}
            onAddSubsection={addSubsection}
            onUpdateSubsection={updateSubsection}
            onDeleteSubsection={deleteSubsection}
          />
        </div>
      </Card>

      {/* Media Uploader Dialog */}
      <MediaUploader
        isOpen={isMediaUploaderOpen}
        onClose={() => setIsMediaUploaderOpen(false)}
        onAddMedia={addMediaItem}
      />
    </>
  );
};

export default EditableSection;

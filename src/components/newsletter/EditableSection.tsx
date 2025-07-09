import { Card } from '@/components/ui/card';
import React, { useState } from 'react';
import EditableText from './EditableText';
import ListDisplay from './ListDisplay';
import ListEditor from './ListEditor';
import MediaDisplay from './MediaDisplay';
import MediaUploader from './MediaUploader';
import SectionHeader from './SectionHeader';
import SubsectionList from './SubsectionList';
import TextSizeSelector from './TextSizeSelector';
import { ListData, MediaItem, Section, Subsection } from './types';

interface EditableSectionProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
}

const EditableSection: React.FC<EditableSectionProps> = ({
  section,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMediaUploaderOpen, setIsMediaUploaderOpen] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | 'youtube' | 'link'>('image');
  const [selectedSubsectionId, setSelectedSubsectionId] = useState<string | null>(null);

  const addSubsection = () => {
    const newSubsection: Subsection = {
      id: Date.now().toString(),
      title: 'عنوان فرعي جديد',
      content: 'محتوى القسم الفرعي',
      mediaItems: [],
      titleFontSize: 'text-lg',
      contentFontSize: 'text-base',
    };
    onUpdate({
      subsections: [...section.subsections, newSubsection],
    });
  };

  const updateSubsection = (
    subsectionId: string,
    updates: Partial<Subsection>
  ) => {
    onUpdate({
      subsections: section.subsections.map(sub =>
        sub.id === subsectionId ? { ...sub, ...updates } : sub
      ),
    });
  };

  const deleteSubsection = (subsectionId: string) => {
    onUpdate({
      subsections: section.subsections.filter(sub => sub.id !== subsectionId),
    });
  };

  const addMediaItem = (mediaData: Omit<MediaItem, 'id'>) => {
    const newMediaItem: MediaItem = {
      ...mediaData,
      id: Date.now().toString(),
      size: 'medium',
      alignment: 'center',
    };
    
    if (selectedSubsectionId) {
      // Add to subsection
      addSubsectionMediaItem(selectedSubsectionId, mediaData);
      setSelectedSubsectionId(null);
    } else {
      // Add to main section
      const currentMedia = section.mediaItems || [];
      onUpdate({
        mediaItems: [...currentMedia, newMediaItem],
      });
    }
  };

  const removeMediaItem = (mediaId: string) => {
    const currentMedia = section.mediaItems || [];
    const mediaToRemove = currentMedia.find(item => item.id === mediaId);
    
    // If the media item has text content, preserve it by adding it to the section's text content
    if (mediaToRemove?.textContent) {
      const currentContent = section.content || '';
      const newContent = currentContent + (currentContent ? '\n\n' : '') + mediaToRemove.textContent;
      onUpdate({
        content: newContent,
        mediaItems: currentMedia.filter(item => item.id !== mediaId),
      });
    } else {
      onUpdate({
        mediaItems: currentMedia.filter(item => item.id !== mediaId),
      });
    }
  };

  const updateMediaItem = (mediaId: string, updates: Partial<MediaItem>) => {
    const currentMedia = section.mediaItems || [];
    const itemToUpdate = currentMedia.find(item => item.id === mediaId);
    
    // If this is a link, prevent size changes
    if (itemToUpdate?.type === 'link' && updates.size !== undefined) {
      // Remove size from updates for links
      const { size, ...updatesWithoutSize } = updates;
      onUpdate({
        mediaItems: currentMedia.map(item =>
          item.id === mediaId ? { ...item, ...updatesWithoutSize } : item
        ),
      });
    } else {
      onUpdate({
        mediaItems: currentMedia.map(item =>
          item.id === mediaId ? { ...item, ...updates } : item
        ),
      });
    }
  };

  const updateLists = (lists: ListData[]) => {
    onUpdate({ lists });
  };

  const addSubsectionMediaItem = (subsectionId: string, mediaData: Omit<MediaItem, 'id'>) => {
    const newMediaItem: MediaItem = {
      ...mediaData,
      id: Date.now().toString(),
      size: 'medium',
      alignment: 'center',
    };
    
    onUpdate({
      subsections: section.subsections.map(sub =>
        sub.id === subsectionId 
          ? { 
              ...sub, 
              mediaItems: [...(sub.mediaItems || []), newMediaItem] 
            }
          : sub
      ),
    });
  };

  const removeSubsectionMediaItem = (subsectionId: string, mediaId: string) => {
    const subsection = section.subsections.find(sub => sub.id === subsectionId);
    if (!subsection) return;
    
    const currentMedia = subsection.mediaItems || [];
    const mediaToRemove = currentMedia.find(item => item.id === mediaId);
    
    // If the media item has text content, preserve it by adding it to the subsection's content
    if (mediaToRemove?.textContent) {
      const currentContent = subsection.content || '';
      const newContent = currentContent + (currentContent ? '\n\n' : '') + mediaToRemove.textContent;
      
      onUpdate({
        subsections: section.subsections.map(sub =>
          sub.id === subsectionId 
            ? { 
                ...sub, 
                content: newContent,
                mediaItems: currentMedia.filter(item => item.id !== mediaId) 
              }
            : sub
        ),
      });
    } else {
      onUpdate({
        subsections: section.subsections.map(sub =>
          sub.id === subsectionId 
            ? { 
                ...sub, 
                mediaItems: currentMedia.filter(item => item.id !== mediaId) 
              }
            : sub
        ),
      });
    }
  };

  const updateSubsectionMediaItem = (subsectionId: string, mediaId: string, updates: Partial<MediaItem>) => {
    onUpdate({
      subsections: section.subsections.map(sub =>
        sub.id === subsectionId 
          ? { 
              ...sub, 
              mediaItems: (sub.mediaItems || []).map(item => {
                if (item.id === mediaId) {
                  // If this is a link, prevent size changes
                  if (item.type === 'link' && updates.size !== undefined) {
                    // Remove size from updates for links
                    const { size, ...updatesWithoutSize } = updates;
                    return { ...item, ...updatesWithoutSize };
                  } else {
                    return { ...item, ...updates };
                  }
                }
                return item;
              })
            }
          : sub
      ),
    });
  };

  const handleOpenMediaUploader = (type: 'image' | 'video' | 'youtube' | 'link', subsectionId?: string) => {
    setSelectedMediaType(type);
    setSelectedSubsectionId(subsectionId || null);
    setIsMediaUploaderOpen(true);
  };

  return (
    <>
      <Card
        className={`${section.backgroundColor} relative overflow-hidden shadow-lg`}
      >
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
            onOpenMediaUploader={handleOpenMediaUploader}
          />

          {/* Section Title */}
          <div className="flex items-center justify-between mb-4">
            <EditableText
              value={section.title}
              onChange={title => onUpdate({ title })}
              className="font-bold text-gray-800"
              fontSize={section.titleFontSize || 'text-2xl'}
              placeholder="عنوان القسم..."
              isTitle={true}
              style={section.titleColor ? { color: section.titleColor } : undefined}
            />
            {isEditing && (
              <TextSizeSelector
                currentSize={section.titleFontSize || 'text-2xl'}
                onSizeChange={(size) => onUpdate({ titleFontSize: size })}
                label="حجم عنوان القسم"
              />
            )}
          </div>

          {/* Section Content */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <EditableText
                value={section.content}
                onChange={content => onUpdate({ content })}
                className="text-gray-700 leading-relaxed"
                fontSize={section.contentFontSize || 'text-lg'}
                placeholder="محتوى القسم..."
                multiline
                isTitle={false}
              />
            </div>
            {isEditing && (
              <TextSizeSelector
                currentSize={section.contentFontSize || 'text-lg'}
                onSizeChange={(size) => onUpdate({ contentFontSize: size })}
                label="حجم محتوى القسم"
                className="ml-2"
              />
            )}
          </div>

          {/* Media Items */}
          <MediaDisplay
            items={section.mediaItems || []}
            onRemove={removeMediaItem}
            onUpdate={updateMediaItem}
          />

          {/* Lists */}
          {isEditing ? (
            <div className="mb-6">
              <ListEditor lists={section.lists || []} onUpdate={updateLists} />
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
            onAddSubsectionMedia={addSubsectionMediaItem}
            onRemoveSubsectionMedia={removeSubsectionMediaItem}
            onUpdateSubsectionMedia={updateSubsectionMediaItem}
            onOpenMediaUploader={handleOpenMediaUploader}
          />
        </div>
      </Card>

      {/* Media Uploader Dialog */}
      <MediaUploader
        isOpen={isMediaUploaderOpen}
        onClose={() => setIsMediaUploaderOpen(false)}
        onAddMedia={addMediaItem}
        defaultTab={selectedMediaType}
      />
    </>
  );
};

export default EditableSection;

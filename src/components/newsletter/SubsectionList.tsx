import { Button } from "@/components/ui/button";
import { Image, Link, Plus, Trash2, Video, X, Youtube } from "lucide-react";
import React from 'react';
import EditableText from './EditableText';
import MediaDisplay from './MediaDisplay';
import TextSizeSelector from './TextSizeSelector';
import { MediaItem, Subsection } from './types';

interface SubsectionListProps {
  subsections: Subsection[];
  onAddSubsection?: () => void;
  onUpdateSubsection?: (subsectionId: string, updates: Partial<Subsection>) => void;
  onDeleteSubsection?: (subsectionId: string) => void;
  onAddSubsectionMedia?: (subsectionId: string, mediaData: Omit<MediaItem, 'id'>) => void;
  onRemoveSubsectionMedia?: (subsectionId: string, mediaId: string) => void;
  onUpdateSubsectionMedia?: (subsectionId: string, mediaId: string, updates: Partial<MediaItem>) => void;
  onOpenMediaUploader?: (type: 'image' | 'video' | 'youtube' | 'link', subsectionId: string) => void;
  readOnly?: boolean;
}

const SubsectionList: React.FC<SubsectionListProps> = ({
  subsections,
  onAddSubsection,
  onUpdateSubsection,
  onDeleteSubsection,
  onAddSubsectionMedia,
  onRemoveSubsectionMedia,
  onUpdateSubsectionMedia,
  onOpenMediaUploader,
  readOnly = false,
}) => {
  const clearSubsectionContent = (subsectionId: string) => {
    onUpdateSubsection && onUpdateSubsection(subsectionId, { content: '' });
  };

  const hasContent = (subsection: Subsection) => {
    return subsection.content && subsection.content.trim();
  };

  const handleAddMedia = (subsectionId: string, type: 'image' | 'video' | 'youtube' | 'link') => {
    if (onOpenMediaUploader) {
      onOpenMediaUploader(type, subsectionId);
    }
  };

  return (
    <>
      {/* Subsections */}
      {subsections.map((subsection) => (
        <div key={subsection.id} className="mb-4 pr-4 border-r-2 border-gray-300 min-h-[2rem]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <EditableText
                value={subsection.title}
                onChange={title => onUpdateSubsection && onUpdateSubsection(subsection.id, { title })}
                className="font-semibold text-gray-700"
                fontSize={subsection.titleFontSize || 'text-lg'}
                placeholder="عنوان القسم الفرعي..."
                isTitle={true}
                readOnly={readOnly}
              />
              {!readOnly && (
                <TextSizeSelector
                  currentSize={subsection.titleFontSize || 'text-lg'}
                  onSizeChange={(size) => onUpdateSubsection && onUpdateSubsection(subsection.id, { titleFontSize: size })}
                  label="حجم عنوان القسم الفرعي"
                />
              )}
            </div>
            {!readOnly && (
              <div className="flex gap-1">
                {/* Media buttons */}
                <div className="flex gap-1 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddMedia(subsection.id, 'image')}
                    className="text-blue-500 hover:text-blue-600"
                    title="إضافة صورة"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddMedia(subsection.id, 'video')}
                    className="text-green-500 hover:text-green-600"
                    title="إضافة فيديو"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddMedia(subsection.id, 'youtube')}
                    className="text-red-500 hover:text-red-600"
                    title="إضافة فيديو يوتيوب"
                  >
                    <Youtube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddMedia(subsection.id, 'link')}
                    className="text-purple-500 hover:text-purple-600"
                    title="إضافة رابط"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                {/* Clear content button - only show if there's content */}
                {hasContent(subsection) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSubsectionContent(subsection.id)}
                    className="text-orange-500 hover:text-orange-600"
                    title="مسح المحتوى"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {/* Delete entire subsection button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSubsection && onDeleteSubsection(subsection.id)}
                  className="text-red-500 hover:text-red-600"
                  title="حذف القسم الفرعي"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className={`${hasContent(subsection) ? 'min-h-[3rem]' : 'min-h-[1rem]'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <EditableText
                  value={subsection.content}
                  onChange={content => onUpdateSubsection && onUpdateSubsection(subsection.id, { content })}
                  className="text-gray-600"
                  fontSize={subsection.contentFontSize || 'text-base'}
                  placeholder="محتوى القسم الفرعي..."
                  multiline
                  isTitle={false}
                  readOnly={readOnly}
                  showPlaceholder={!!(subsection.content && subsection.content.trim())}
                />
              </div>
              {!readOnly && (
                <TextSizeSelector
                  currentSize={subsection.contentFontSize || 'text-base'}
                  onSizeChange={(size) => onUpdateSubsection && onUpdateSubsection(subsection.id, { contentFontSize: size })}
                  label="حجم محتوى القسم الفرعي"
                  className="ml-2"
                />
              )}
            </div>
          </div>
          
          {/* Subsection Media Items */}
          {subsection.mediaItems && subsection.mediaItems.length > 0 && (
            <div className="mt-4">
              <MediaDisplay
                items={subsection.mediaItems}
                onRemove={(mediaId) => onRemoveSubsectionMedia && onRemoveSubsectionMedia(subsection.id, mediaId)}
                onUpdate={(mediaId, updates) => onUpdateSubsectionMedia && onUpdateSubsectionMedia(subsection.id, mediaId, updates)}
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      ))}

      {/* Add Subsection Button */}
      {!readOnly && onAddSubsection && (
        <Button
          onClick={onAddSubsection}
          variant="outline"
          className="w-full mt-4 hover:bg-logo-blue hover:text-white transition-colors"
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة قسم فرعي
        </Button>
      )}
    </>
  );
};

export default SubsectionList; 
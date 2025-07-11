import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Image, Link, Palette, Plus, Trash2, Video, X, Youtube } from "lucide-react";
import React from 'react';
import EditableText from './EditableText';
import ListDisplay from './ListDisplay';
import ListEditor from './ListEditor';
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
            <li key={idx} className="flex items-start gap-2">
              {listType === 'bullet' ? (
                <span className="inline-block mt-2 w-3 h-3 rounded-full" style={{ backgroundColor: bulletColor, minWidth: '0.75rem' }} />
              ) : (
                <span className="inline-block font-bold mr-1" style={{ color: bulletColor }}>{idx + 1}.</span>
              )}
              <span className={`break-words ${fontSize || 'text-base'}`}>{item.replace(/^([•\d]+\.\s)/, '')}</span>
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
        <div key={elements.length} className={`mb-2 ${fontSize || 'text-base'} break-words`}>{line}</div>
      );
    }
  });
  flushList();
  return elements;
};

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

  const handleAddMedia = (subsectionId: string, type: 'image' | 'video' | 'youtube' | 'link') => {
    if (onOpenMediaUploader) {
      onOpenMediaUploader(type, subsectionId);
    }
  };

  return (
    <>
      {/* Subsections */}
      {subsections.map((subsection) => {
        const isEmpty = (!subsection.content || !subsection.content.trim()) && (!subsection.lists || subsection.lists.length === 0);
        return (
          // Only render the title div if readOnly and empty, otherwise render everything
          readOnly && isEmpty ? (
            <div
              key={subsection.id}
              className={`pr-2 sm:pr-4 border-r-2 border-gray-300 min-h-[2rem] w-full mb-1`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <EditableText
                    value={subsection.title}
                    onChange={title => onUpdateSubsection && onUpdateSubsection(subsection.id, { title })}
                    className="font-semibold text-gray-700 break-words w-full"
                    fontSize={subsection.titleFontSize || 'text-lg'}
                    placeholder="عنوان القسم الفرعي..."
                    isTitle={true}
                    readOnly={readOnly}
                    style={subsection.titleColor ? { color: subsection.titleColor } : undefined}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              key={subsection.id}
              className={`pr-2 sm:pr-4 border-r-2 border-gray-300 min-h-[2rem] w-full ${isEmpty ? 'mb-1' : 'mb-4'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <EditableText
                    value={subsection.title}
                    onChange={title => onUpdateSubsection && onUpdateSubsection(subsection.id, { title })}
                    className="font-semibold text-gray-700 break-words w-full"
                    fontSize={subsection.titleFontSize || 'text-lg'}
                    placeholder="عنوان القسم الفرعي..."
                    isTitle={true}
                    readOnly={readOnly}
                    style={subsection.titleColor ? { color: subsection.titleColor } : undefined}
                  />
                  {!readOnly && (
                    <>
                      <TextSizeSelector
                        currentSize={subsection.titleFontSize || 'text-lg'}
                        onSizeChange={(size) => onUpdateSubsection && onUpdateSubsection(subsection.id, { titleFontSize: size })}
                        label="حجم عنوان القسم الفرعي"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-6 h-6 rounded-full border ml-1 flex items-center justify-center"
                            style={{ backgroundColor: subsection.titleColor || '#6366F1' }}
                            title="تغيير لون العنوان"
                            type="button"
                          >
                            <Palette size={16} className="text-white" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="flex gap-2 p-2 w-auto min-w-0">
                          {["#EC4899", "#10B981", "#6366F1", "#06B6D4", "#A78BFA", "#EF4444", "#EAB308", "#F59E42"].map(color => (
                            <button
                              key={color}
                              className={`w-5 h-5 rounded-full border-2 ${subsection.titleColor === color ? 'border-logo-blue ring-2 ring-logo-blue' : 'border-gray-200'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => onUpdateSubsection && onUpdateSubsection(subsection.id, { titleColor: color })}
                              type="button"
                            />
                          ))}
                        </PopoverContent>
                      </Popover>
                    </>
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
                    {subsection.content && subsection.content.trim() && (
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
              <div className={`${subsection.content && subsection.content.trim() ? 'min-h-[2rem]' : 'min-h-[1rem]'}`}> 
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <EditableText
                      value={subsection.content}
                      onChange={content => onUpdateSubsection && onUpdateSubsection(subsection.id, { content })}
                      className="text-gray-600 break-words w-full"
                      fontSize={subsection.contentFontSize || 'text-base'}
                      placeholder="محتوى القسم الفرعي..."
                      multiline
                      isTitle={false}
                      readOnly={readOnly}
                      showPlaceholder={!!(subsection.content && subsection.content.trim())}
                      renderStyledContent={(content) => renderStyledContent(content, subsection.contentFontSize || 'text-base', subsection.titleColor || '#4F46E5')}
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

              {/* Subsection Lists */}
              {!readOnly ? (
                <>
                  <div className="mb-4">
                    <ListEditor
                      lists={subsection.lists || []}
                      onUpdate={lists => onUpdateSubsection && onUpdateSubsection(subsection.id, { lists })}
                    />
                  </div>
                  <div className="flex items-start justify-between mt-2">
                    <div className="flex-1">
                      <EditableText
                        value={subsection.afterListContent || ''}
                        onChange={val => onUpdateSubsection && onUpdateSubsection(subsection.id, { afterListContent: val })}
                        className="text-gray-600"
                        fontSize={subsection.afterListContentFontSize || subsection.contentFontSize || 'text-base'}
                        placeholder="أضف محتوى بعد القائمة..."
                        multiline
                        isTitle={false}
                      />
                    </div>
                    <TextSizeSelector
                      currentSize={subsection.afterListContentFontSize || subsection.contentFontSize || 'text-base'}
                      onSizeChange={size => onUpdateSubsection && onUpdateSubsection(subsection.id, { afterListContentFontSize: size })}
                      label="حجم الخط بعد القائمة"
                      className="ml-2"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <ListDisplay lists={subsection.lists || []} />
                  </div>
                  {subsection.afterListContent && (
                    <div className={`text-gray-600 mt-2 ${subsection.afterListContentFontSize || subsection.contentFontSize || 'text-base'}`}>{subsection.afterListContent}</div>
                  )}
                </>
              )}
              
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
          )
        );
      })}

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
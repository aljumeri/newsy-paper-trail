import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Trash2 } from "lucide-react";
import React, { useState } from 'react';
import EditableText from './EditableText';
import TextSizeSelector from './TextSizeSelector';
import { MediaItem } from './types';

interface MediaDisplayProps {
  items: MediaItem[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<MediaItem>) => void;
  readOnly?: boolean;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ items, onRemove, onUpdate, readOnly = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const getSizeClass = (size: string = 'medium') => {
    switch (size) {
      case 'small': return 'max-w-xs';
      case 'medium': return 'max-w-md';
      case 'large': return 'max-w-lg';
      case 'full': return 'w-full max-w-full';
      default: return 'max-w-md';
    }
  };

  const getIframeContainerClass = (size: string = 'medium') => {
    switch (size) {
      case 'small': return 'max-w-xs';
      case 'medium': return 'max-w-md';
      case 'large': return 'max-w-lg';
      case 'full': return 'w-full max-w-full';
      default: return 'max-w-md';
    }
  };

  const getAlignmentClass = (alignment: string = 'center') => {
    switch (alignment) {
      case 'left': return 'mr-auto';
      case 'right': return 'ml-auto';
      case 'center': return 'mx-auto';
      default: return 'mx-auto';
    }
  };

  const getContainerAlignmentClass = (alignment: string = 'center') => {
    switch (alignment) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-center';
    }
  };

  const updateMediaItem = (id: string, field: string, value: string) => {
    if (onUpdate) {
      onUpdate(id, { [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id}>
          <div className="border rounded-lg p-4 bg-white/50">
            {!readOnly && (
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {editingId === item.id && (
                    <div className="flex items-center gap-2">
                      {/* Only show size selector for non-link items */}
                      {item.type !== 'link' && (
                        <Select
                          value={item.size || 'medium'}
                          onValueChange={(value) => updateMediaItem(item.id, 'size', value)}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">صغير</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="large">كبير</SelectItem>
                            <SelectItem value="full">كامل</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Select
                        value={item.alignment || 'center'}
                        onValueChange={(value) => updateMediaItem(item.id, 'alignment', value)}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">يسار</SelectItem>
                          <SelectItem value="center">وسط</SelectItem>
                          <SelectItem value="right">يمين</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className={`flex-1 ${getContainerAlignmentClass(item.alignment)}`}>
              {item.type === 'image' && (
                <div className="w-full">
                  <img 
                    src={item.url} 
                    alt="Uploaded content" 
                    className={`${getSizeClass(item.size)} ${item.size === 'full' ? 'w-full' : getAlignmentClass(item.alignment)} object-cover rounded`}
                  />
                </div>
              )}
              
              {item.type === 'video' && (
                <div className="w-full">
                  <video 
                    src={item.url} 
                    controls 
                    className={`${getSizeClass(item.size)} ${item.size === 'full' ? 'w-full' : getAlignmentClass(item.alignment)} rounded`}
                  />
                </div>
              )}
              
              {item.type === 'youtube' && (
                <div className={`${getIframeContainerClass(item.size)} ${item.size === 'full' ? 'w-full' : getAlignmentClass(item.alignment)}`}>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={item.url}
                      className="absolute top-0 left-0 w-full h-full rounded"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              
              {item.type === 'link' && (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-blue-600 hover:text-blue-800 hover:underline ${getAlignmentClass(item.alignment)} ${getSizeClass(item.size)} block`}
                >
                  {item.title || item.url}
                </a>
              )}
            </div>
          </div>

          {/* Text content after media item - outside the media block */}
          <div className="mt-3" data-media-text-container={item.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <EditableText
                  value={item.textContent || ''}
                  onChange={(text) => updateMediaItem(item.id, 'textContent', text)}
                  className="text-gray-700 leading-relaxed"
                  fontSize={item.textFontSize || 'text-base'}
                  placeholder="أضف النص هنا..."
                  multiline
                  isTitle={false}
                  readOnly={readOnly}
                  key={`media-text-${item.id}`}
                  uniqueId={`media-text-${item.id}`}
                />
              </div>
              {!readOnly && (
                <TextSizeSelector
                  currentSize={item.textFontSize || 'text-base'}
                  onSizeChange={(size) => updateMediaItem(item.id, 'textFontSize', size)}
                  label="حجم النص"
                  className="ml-2"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaDisplay; 
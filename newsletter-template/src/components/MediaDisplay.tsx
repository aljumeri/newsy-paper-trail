
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ExternalLink, Settings } from "lucide-react";

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'youtube' | 'link';
  url: string;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
}

interface MediaDisplayProps {
  items: MediaItem[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<MediaItem>) => void;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ items, onRemove, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const getSizeClass = (size: string = 'medium') => {
    switch (size) {
      case 'small': return 'max-w-xs h-32';
      case 'medium': return 'max-w-md h-48';
      case 'large': return 'max-w-lg h-64';
      case 'full': return 'max-w-2xl h-96';
      default: return 'max-w-md h-48';
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
        <div key={item.id} className="border rounded-lg p-4 bg-white/50">
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className={`flex-1 ${getContainerAlignmentClass(item.alignment)}`}>
            {item.type === 'image' && (
              <div>
                <img 
                  src={item.url} 
                  alt="Uploaded content" 
                  className={`${getSizeClass(item.size)} ${getAlignmentClass(item.alignment)} object-cover rounded`}
                />
              </div>
            )}
            
            {item.type === 'video' && (
              <div>
                <video 
                  src={item.url} 
                  controls 
                  className={`${getSizeClass(item.size)} ${getAlignmentClass(item.alignment)} rounded`}
                />
              </div>
            )}
            
            {item.type === 'youtube' && (
              <div className={`${getAlignmentClass(item.alignment)}`}>
                <iframe
                  src={item.url}
                  className={`${getSizeClass(item.size)} rounded aspect-video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            {item.type === 'link' && (
              <div className={`flex items-center gap-2 p-3 bg-blue-50 rounded border-r-4 border-blue-500 ${getAlignmentClass(item.alignment)} mt-2`}>
                <ExternalLink className="h-5 w-5 text-blue-600" />
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-cairo text-lg hover:underline"
                >
                  {item.title || item.url}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaDisplay;

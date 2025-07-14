import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { List, ListOrdered, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import TextSizeSelector from './TextSizeSelector';

interface ListItem {
  id: string;
  text: string;
  color: string;
  fontSize?: string;
}

interface ListData {
  id: string;
  type: 'bullet' | 'numbered';
  items: ListItem[];
  fontSize?: string;
}

interface ListEditorProps {
  lists: ListData[];
  onUpdate: (lists: ListData[]) => void;
}

const colorOptions = [
  { name: 'أسود', value: '#000000' },
  { name: 'أزرق', value: '#4F46E5' },
  { name: 'بنفسجي', value: '#8B5CF6' },
  { name: 'أخضر', value: '#10B981' },
  { name: 'وردي', value: '#EC4899' },
  { name: 'أحمر', value: '#EF4444' },
  { name: 'برتقالي', value: '#F97316' },
  { name: 'سماوي', value: '#06B6D4' },
  { name: 'أصفر', value: '#EAB308' },
];

// Remove the old fontSizeOptions and define only working sizes for per-item selector

function fontSizeToRem(fontSize: string) {
  switch (fontSize) {
    case 'text-xs':
      return '0.75rem'; // 12px
    case 'text-sm':
      return '0.875rem'; // 14px
    case 'text-base':
      return '1rem'; // 16px
    case 'text-lg':
      return '1.125rem'; // 18px
    case 'text-xl':
      return '1.25rem'; // 20px
    case 'text-2xl':
      return '1.5rem'; // 24px
    case 'text-3xl':
      return '1.875rem'; // 30px
    case 'text-4xl':
      return '2.25rem'; // 36px
    case 'text-5xl':
  }
}

const ListEditor: React.FC<ListEditorProps> = ({ lists, onUpdate }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const addList = (type: 'bullet' | 'numbered') => {
    const newList: ListData = {
      id: Date.now().toString(),
      type,
      items: [
        {
          id: `${Date.now()}-1`,
          text: 'عنصر القائمة الأول',
          color: '#000000',
        },
      ],
      fontSize: 'text-lg',
    };
    onUpdate([...lists, newList]);
  };

  const addListItem = (listId: string) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        const newItem: ListItem = {
          id: `${Date.now()}-${list.items.length + 1}`,
          text: 'عنصر جديد',
          color: '#000000',
          fontSize: 'text-lg',
        };
        return { ...list, items: [...list.items, newItem] };
      }
      return list;
    });
    onUpdate(updatedLists);
  };

  const updateListItem = (
    listId: string,
    itemId: string,
    updates: Partial<ListItem>
  ) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        };
      }
      return list;
    });
    onUpdate(updatedLists);
  };

  const removeListItem = (listId: string, itemId: string) => {
    const updatedLists = lists
      .map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.filter(item => item.id !== itemId),
          };
        }
        return list;
      })
      .filter(list => list.items.length > 0);
    onUpdate(updatedLists);
  };

  const removeList = (listId: string) => {
    onUpdate(lists.filter(list => list.id !== listId));
  };

  if (lists.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button onClick={() => addList('bullet')} variant="outline" size="sm">
            <List className="ml-1 h-4 w-4" />
            قائمة نقطية
          </Button>
          <Button
            onClick={() => addList('numbered')}
            variant="outline"
            size="sm"
          >
            <ListOrdered className="ml-1 h-4 w-4" />
            قائمة مرقمة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lists.map((list, listIndex) => (
        <div key={list.id} className="border rounded-lg p-4 bg-white/50">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {list.type === 'bullet' ? 'قائمة نقطية' : 'قائمة مرقمة'}
            </h4>
            <div className="flex gap-2 items-center">
              {/* Remove the TextSizeSelector for the whole list (inside the list header) */}
              <Button
                onClick={() => addListItem(list.id)}
                variant="outline"
                size="sm"
              >
                <Plus className="ml-1 h-4 w-4" />
                إضافة عنصر
              </Button>
              <Button
                onClick={() => removeList(list.id)}
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            {list.items.map((item, itemIndex) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 ${
                  itemIndex === 0 ? 'mt-3' : ''
                }`}
              >
                {/* Bullet or Number */}
                <div className="flex-shrink-0">
                  {list.type === 'bullet' ? (
                    <div
                      className={`rounded-full`}
                      style={{
                        backgroundColor: item.color,
                        width: `calc(${fontSizeToRem(
                          item.fontSize || 'text-lg'
                        )} - 6px)`,
                        height: `calc(${fontSizeToRem(
                          item.fontSize || 'text-lg'
                        )} - 6px)`,
                      }}
                    />
                  ) : (
                    <span
                      className={`font-bold ${item.fontSize || 'text-lg'}`}
                      style={{ color: item.color }}
                    >
                      {String(itemIndex + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Text Content and Font Size Selector */}
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={item.text}
                    onChange={e =>
                      updateListItem(list.id, item.id, { text: e.target.value })
                    }
                    className="text-black border-none bg-transparent p-0 focus:ring-0 whitespace-pre-line"
                    style={{
                      fontSize: fontSizeToRem(item.fontSize || 'text-lg'),
                    }}
                    dir="rtl"
                  />
                  <TextSizeSelector
                    currentSize={item.fontSize || 'text-lg'}
                    onSizeChange={size =>
                      updateListItem(list.id, item.id, { fontSize: size })
                    }
                    label="حجم العنصر"
                  />
                </div>

                {/* Color Selector and Delete */}
                <div className="flex items-center gap-2">
                  <Select
                    value={item.color}
                    onValueChange={color =>
                      updateListItem(list.id, item.id, { color })
                    }
                  >
                    <SelectTrigger className="w-24 h-8">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(colorOption => (
                        <SelectItem
                          key={colorOption.value}
                          value={colorOption.value}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: colorOption.value }}
                            />
                            <span>{colorOption.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => removeListItem(list.id, item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Button onClick={() => addList('bullet')} variant="outline" size="sm">
          <List className="ml-1 h-4 w-4" />
          قائمة نقطية جديدة
        </Button>
        <Button onClick={() => addList('numbered')} variant="outline" size="sm">
          <ListOrdered className="ml-1 h-4 w-4" />
          قائمة مرقمة جديدة
        </Button>
      </div>
    </div>
  );
};

export default ListEditor;

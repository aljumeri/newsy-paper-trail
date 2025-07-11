import React from 'react';

interface ListItem {
  id: string;
  text: string;
  color: string;
  fontSize?: string; // Added fontSize to ListItem interface
}

interface ListData {
  id: string;
  type: 'bullet' | 'numbered';
  items: ListItem[];
  fontSize?: string; // Added fontSize to ListData interface
}

interface ListDisplayProps {
  lists: ListData[];
}

function bulletSizeClass(fontSize) {
  switch (fontSize) {
    case 'text-xs': return 'w-2 h-2';
    case 'text-sm': return 'w-2.5 h-2.5';
    case 'text-base': return 'w-3 h-3';
    case 'text-lg': return 'w-3.5 h-3.5';
    case 'text-xl': return 'w-4 h-4';
    default: return 'w-3 h-3';
  }
}

const ListDisplay: React.FC<ListDisplayProps> = ({ lists }) => {
  if (lists.length === 0) return null;

  return (
    <div className="space-y-6">
      {lists.map((list) => (
        <div key={list.id} className="space-y-3">
          {list.items.map((item, itemIndex) => (
            <div key={item.id} className={`flex items-start gap-1 text-right w-full ${itemIndex === 0 ? 'mt-3' : ''}`} dir="rtl">
              {/* Bullet or Number */}
              <div className="flex-shrink-0 mt-1">
                {list.type === 'bullet' ? (
                  <div
                    className={`rounded-full shadow-sm ${bulletSizeClass(item.fontSize || list.fontSize || 'text-lg')}`}
                    style={{ backgroundColor: item.color }}
                  />
                ) : (
                  <span
                    className="font-bold text-xl leading-none"
                    style={{ color: item.color }}
                  >
                    {String(itemIndex + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 w-full">
                <p className={`text-gray-700 leading-relaxed whitespace-pre-line break-words w-full ${item.fontSize || list.fontSize || 'text-lg'}`}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ListDisplay; 
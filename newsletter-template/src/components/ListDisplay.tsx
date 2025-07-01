
import React from 'react';

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

interface ListDisplayProps {
  lists: ListData[];
}

const ListDisplay: React.FC<ListDisplayProps> = ({ lists }) => {
  if (lists.length === 0) return null;

  return (
    <div className="space-y-6">
      {lists.map((list) => (
        <div key={list.id} className="space-y-3">
          {list.items.map((item, itemIndex) => (
            <div key={item.id} className="flex items-start gap-4 text-right" dir="rtl">
              {/* Bullet or Number */}
              <div className="flex-shrink-0 mt-1">
                {list.type === 'bullet' ? (
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                ) : (
                  <span
                    className="font-bold text-xl font-cairo leading-none"
                    style={{ color: item.color }}
                  >
                    {String(itemIndex + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <p className="font-cairo text-gray-700 text-lg leading-relaxed">
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

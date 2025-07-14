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

const ListDisplay: React.FC<ListDisplayProps> = ({ lists }) => {
  if (lists.length === 0) return null;

  return (
    <div className="space-y-4">
      {lists.map(list => (
        <div key={list.id} className="space-y-1">
          {list.items.map((item, itemIndex) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 text-right w-full ${
                itemIndex === 0 ? 'mt-3' : ''
              }`}
              dir="rtl"
            >
              {/* Bullet or Number */}
              <div className="flex-shrink-0">
                {list.type === 'bullet' ? (
                  <div
                    className={`rounded-full shadow-sm`}
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
                    className="font-bold leading-none"
                    style={{
                      color: item.color,
                      fontSize: fontSizeToRem(item.fontSize || 'text-lg'),
                    }}
                  >
                    {String(itemIndex + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 w-full">
                <p
                  className={`text-black leading-relaxed whitespace-pre-line break-words w-full ${
                    item.fontSize || 'text-lg'
                  }`}
                >
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

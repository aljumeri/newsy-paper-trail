import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Type } from "lucide-react";
import React from 'react';

interface TextSizeSelectorProps {
  currentSize: string;
  onSizeChange: (size: string) => void;
  label?: string;
  className?: string;
}

const textSizes = [
  { label: 'صغير جداً', value: 'text-xs', size: '12px' },
  { label: 'صغير', value: 'text-sm', size: '14px' },
  { label: 'عادي', value: 'text-base', size: '16px' },
  { label: 'كبير', value: 'text-lg', size: '18px' },
  { label: 'كبير جداً', value: 'text-xl', size: '20px' },
  { label: 'عنوان صغير', value: 'text-2xl', size: '24px' },
  { label: 'عنوان متوسط', value: 'text-3xl', size: '30px' },
  { label: 'عنوان كبير', value: 'text-4xl', size: '36px' },
];

const TextSizeSelector: React.FC<TextSizeSelectorProps> = ({
  currentSize,
  onSizeChange,
  label = "حجم الخط",
  className = ""
}) => {
  const getCurrentSizeLabel = () => {
    const size = textSizes.find(s => s.value === currentSize);
    return size ? size.label : 'عادي';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-1 ${className}`}
          title={label}
        >
          <Type className="h-4 w-4" />
          <span className="text-xs">{getCurrentSizeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {textSizes.map((size) => (
          <DropdownMenuItem 
            key={size.value} 
            onClick={() => onSizeChange(size.value)}
            className={currentSize === size.value ? 'bg-blue-50' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span>{size.label}</span>
              <span className="text-xs text-gray-500">{size.size}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TextSizeSelector; 
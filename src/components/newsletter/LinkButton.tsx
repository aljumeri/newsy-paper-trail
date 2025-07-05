import { Button } from "@/components/ui/button";
import { Edit3, Link2, Unlink } from "lucide-react";
import React from 'react';

interface LinkInfo {
  isLink: boolean;
  linkText: string;
  url: string;
  fullLink: string;
}

interface LinkButtonProps {
  position: { x: number; y: number };
  onClick: (e: React.MouseEvent, action: 'add' | 'edit' | 'remove') => void;
  linkInfo: LinkInfo | null;
}

const LinkButton: React.FC<LinkButtonProps> = ({ position, onClick, linkInfo }) => {
  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="flex gap-1 bg-white rounded-lg shadow-lg border p-1">
        {linkInfo?.isLink ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 whitespace-nowrap"
              onClick={(e) => onClick(e, 'edit')}
              title="تعديل الرابط"
            >
              <Edit3 className="ml-1 h-3 w-3" />
              تعديل
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
              onClick={(e) => onClick(e, 'remove')}
              title="إزالة الرابط"
            >
              <Unlink className="ml-1 h-3 w-3" />
              إزالة
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            onClick={(e) => onClick(e, 'add')}
            title="إضافة رابط"
          >
            <Link2 className="ml-1 h-4 w-4" />
            إضافة رابط
          </Button>
        )}
      </div>
    </div>
  );
};

export default LinkButton; 
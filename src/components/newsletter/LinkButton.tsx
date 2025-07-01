import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import React from 'react';

interface LinkButtonProps {
  position: { x: number; y: number };
  onClick: (e: React.MouseEvent) => void;
}

const LinkButton: React.FC<LinkButtonProps> = ({ position, onClick }) => {
  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <Button
        size="sm"
        className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
        onClick={onClick}
      >
        <Link2 className="ml-1 h-4 w-4" />
        إضافة رابط
      </Button>
    </div>
  );
};

export default LinkButton; 
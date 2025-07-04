import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import React from 'react';
import SectionCustomizationPanel from './SectionCustomizationPanel';

interface Section {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  sideLineColor: string;
  subsections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  mediaItems?: any[];
  lists?: any[];
}

interface SectionHeaderProps {
  section: Section;
  isEditing: boolean;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onToggleEdit: () => void;
  onOpenMediaUploader: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  section,
  isEditing,
  onUpdate,
  onDelete,
  onToggleEdit,
  onOpenMediaUploader
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <SectionCustomizationPanel
          section={section}
          onUpdate={onUpdate}
          onOpenMediaUploader={onOpenMediaUploader}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleEdit}
        >
          <Edit3 className="ml-1 h-4 w-4" />
          {isEditing ? 'حفظ' : 'تحرير'}
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="ml-1 h-4 w-4" />
        حذف
      </Button>
    </div>
  );
};

export default SectionHeader; 
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";
import React from 'react';
import EditableText from './EditableText';

interface Subsection {
  id: string;
  title: string;
  content: string;
}

interface SubsectionListProps {
  subsections: Subsection[];
  onAddSubsection: () => void;
  onUpdateSubsection: (subsectionId: string, updates: Partial<Subsection>) => void;
  onDeleteSubsection: (subsectionId: string) => void;
}

const SubsectionList: React.FC<SubsectionListProps> = ({
  subsections,
  onAddSubsection,
  onUpdateSubsection,
  onDeleteSubsection
}) => {
  const clearSubsectionContent = (subsectionId: string) => {
    onUpdateSubsection(subsectionId, { content: '' });
  };

  return (
    <>
      {/* Subsections */}
      {subsections.map((subsection) => (
        <div key={subsection.id} className="mb-4 pr-4 border-r-2 border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <EditableText
              value={subsection.title}
              onChange={(title) => onUpdateSubsection(subsection.id, { title })}
              className="text-lg font-semibold text-gray-700"
              placeholder="عنوان القسم الفرعي..."
              isTitle={true}
            />
            <div className="flex gap-1">
              {/* Clear content button - only show if there's content */}
              {subsection.content && subsection.content.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearSubsectionContent(subsection.id)}
                  className="text-orange-500 hover:text-orange-600"
                  title="مسح المحتوى"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {/* Delete entire subsection button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteSubsection(subsection.id)}
                className="text-red-500 hover:text-red-600"
                title="حذف القسم الفرعي"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <EditableText
            value={subsection.content}
            onChange={(content) => onUpdateSubsection(subsection.id, { content })}
            className="text-gray-600 text-base"
            placeholder="محتوى القسم الفرعي..."
            multiline
            isTitle={false}
          />
        </div>
      ))}

      {/* Add Subsection Button */}
      <Button
        onClick={onAddSubsection}
        variant="outline"
        className="w-full mt-4 hover:bg-logo-blue hover:text-white transition-colors"
      >
        <Plus className="ml-2 h-4 w-4" />
        إضافة قسم فرعي
      </Button>
    </>
  );
};

export default SubsectionList; 
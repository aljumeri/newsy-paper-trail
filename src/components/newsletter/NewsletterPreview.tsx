import { Button } from '@/components/ui/button';
import React from 'react';

interface NewsletterPreviewProps {
  subject: string;
  content: string;
  onEdit: () => void;
}

const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({
  subject,
  content,
  onEdit
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border rounded-md">
        <h2 className="text-2xl font-bold mb-4">{subject}</h2>
        <div className="prose max-w-none whitespace-pre-line" dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onEdit}>
          تعديل
        </Button>
      </div>
    </div>
  );
};

export default NewsletterPreview;

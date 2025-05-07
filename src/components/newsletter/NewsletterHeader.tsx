
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NewsletterHeaderProps {
  title?: string;
}

const NewsletterHeader: React.FC<NewsletterHeaderProps> = ({ title = "النشرة الإخبارية" }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow">
      <div className="container py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png" 
            alt="نشرة سولو"
            className="h-10 mr-3"
          />
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin-control/panel')}
          >
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterHeader;

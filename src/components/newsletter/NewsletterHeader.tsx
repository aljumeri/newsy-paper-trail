
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NewsletterHeaderProps {
  title: string;
}

const NewsletterHeader: React.FC<NewsletterHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow">
      <div className="container py-4 flex justify-between items-center">
        <div>
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

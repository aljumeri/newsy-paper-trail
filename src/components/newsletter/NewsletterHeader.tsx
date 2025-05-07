
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface NewsletterHeaderProps {
  title?: string;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

const NewsletterHeader: React.FC<NewsletterHeaderProps> = ({ 
  title = "النشرة الإخبارية",
  onThemeToggle,
  isDarkMode = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow dark:bg-gray-800">
      <div className="container py-4 px-2 sm:px-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png" 
            alt="نشرة سولو"
            className="h-8 sm:h-10 mr-2 sm:mr-3"
          />
          <h1 className="text-lg sm:text-2xl font-bold dark:text-white">{title}</h1>
        </div>
        <div className="flex gap-2">
          {onThemeToggle && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onThemeToggle}
              className="mr-1"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin-control/panel')}
            className="text-xs sm:text-sm whitespace:nowrap"
          >
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterHeader;

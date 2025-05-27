import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Users, Mail, Plus, Star, BookOpen, Send } from 'lucide-react';

type IconType = 'users' | 'mail' | 'plus' | 'star' | 'book' | 'send';

interface AdminActionCardProps {
  title: string;
  value?: number;
  description: string;
  icon: IconType;
  buttonText?: string;
  buttonAction?: () => void;
}

const AdminActionCard = ({
  title,
  value,
  description,
  icon,
  buttonText,
  buttonAction
}: AdminActionCardProps) => {
  
  const renderIcon = () => {
    const iconClass = "h-8 w-8 text-blue-500";
    
    switch (icon) {
      case 'users':
        return <Users className={iconClass} />;
      case 'mail':
        return <Mail className={iconClass} />;
      case 'plus':
        return <Plus className={iconClass} />;
      case 'star':
        return <Star className={iconClass} />;
      case 'book':
        return <BookOpen className={iconClass} />;
      case 'send':
        return <Send className={iconClass} />;
      default:
        return <Star className={iconClass} />;
    }
  };
  
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className="mx-auto bg-blue-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          {renderIcon()}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {value !== undefined && (
          <p className="text-3xl font-bold text-blue-600 mb-2">{value}</p>
        )}
        <p className="text-gray-600">{description}</p>
      </CardContent>
      
      {buttonText && buttonAction && (
        <CardFooter className="pt-0 pb-4 justify-center">
          <Button 
            onClick={buttonAction} 
            variant="secondary"
            className="w-full"
          >
            {buttonText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AdminActionCard; 
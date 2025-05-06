
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User | null;
  handleSignOut: () => Promise<void>;
}

const DashboardHeader = ({ user, handleSignOut }: DashboardHeaderProps) => {
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
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم المسؤول</h1>
            <p className="text-sm text-gray-500">مرحبًا، {user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin-control/compose')}
          >
            إنشاء نشرة إخبارية جديدة
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

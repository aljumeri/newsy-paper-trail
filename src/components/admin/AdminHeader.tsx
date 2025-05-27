import React from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AdminHeaderProps {
  user: User | null;
  onLogout: () => void;
}

const AdminHeader = ({ user, onLogout }: AdminHeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">لوحة التحكم</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-600 dark:text-gray-300 ml-4">
              {user.email}
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout} 
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 
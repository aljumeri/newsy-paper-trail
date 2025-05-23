
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthErrorAlertProps {
  error: string | null;
}

const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default AuthErrorAlert;


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AuthErrorAlert from './AuthErrorAlert';

interface AuthTabsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
}

const AuthTabs: React.FC<AuthTabsProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  handleRegister,
  isLoading,
  authError
}) => {
  return (
    <>
      <AuthErrorAlert error={authError} />
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
          <TabsTrigger value="register">إنشاء حساب جديد</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleLogin}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="register">
          <RegisterForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleRegister}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AuthTabs;

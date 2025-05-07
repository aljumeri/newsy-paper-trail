
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetPasswordForm from './ResetPasswordForm';
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
  const [currentTab, setCurrentTab] = useState<string>("login");
  
  console.log("AuthTabs rendering, email:", email ? "present" : "empty", "current tab:", currentTab);
  
  return (
    <>
      {authError && <AuthErrorAlert error={authError} />}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
          <TabsTrigger value="register">إنشاء حساب جديد</TabsTrigger>
          <TabsTrigger value="reset">نسيت كلمة المرور</TabsTrigger>
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
          <div className="mt-4 text-center">
            <button 
              type="button"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
              onClick={() => setCurrentTab("reset")}
            >
              نسيت كلمة المرور؟ انقر هنا لإعادة تعيينها
            </button>
          </div>
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

        <TabsContent value="reset">
          <ResetPasswordForm
            email={email}
            setEmail={setEmail}
          />
          <div className="mt-4 text-center">
            <button 
              type="button"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
              onClick={() => setCurrentTab("login")}
            >
              العودة إلى تسجيل الدخول
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AuthTabs;

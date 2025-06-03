
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading
}) => {
  const handleTestLogin = () => {
    setEmail('test@example.com');
    setPassword('password123');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium">البريد الإلكتروني</label>
        <Input
          id="login-email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium">كلمة المرور</label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "جارِ تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={handleTestLogin}
          disabled={isLoading}
        >
          تسجيل دخول تجريبي
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 text-center mt-2">
        <p>بيانات الدخول التجريبي:</p>
        <p>البريد: test@example.com</p>
        <p>كلمة المرور: password123</p>
      </div>
    </form>
  );
};

export default LoginForm;

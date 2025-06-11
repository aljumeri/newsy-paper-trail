import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import AuthTabs from '@/components/admin/AuthTabs';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminControl: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    toast({
      title: 'تم تسجيل الدخول بنجاح',
      description: `مرحبًا بك ${email}`,
    });
    navigate('/admin-control/panel');
  };

  // We disable in-app registration
  const handleRegister = async () => {
    toast({
      title: 'غير مدعوم',
      description: 'يرجى دعوة المسؤولين الجدد من داخل لوحة Supabase Authentication.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">لوحة تحكم المسؤول</h1>
            <p className="text-gray-500">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
          </div>

          <AuthTabs
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            isLoading={loading}
            authError={error}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminControl;
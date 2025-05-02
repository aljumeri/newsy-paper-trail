
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthTabs from '@/components/admin/AuthTabs';
import AuthSessionChecker from '@/components/admin/AuthSessionChecker';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';

const AdminLogin = () => {
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    authError,
    handleLogin,
    handleRegister
  } = useAuthHandlers();

  console.log("AdminLogin component rendering");

  const handleSessionCheckComplete = () => {
    setSessionCheckComplete(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        {!sessionCheckComplete ? (
          <AuthSessionChecker onSessionCheckComplete={handleSessionCheckComplete} />
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">منطقة المسؤول</CardTitle>
              <CardDescription>قم بتسجيل الدخول أو أنشئ حساب مسؤول جديد</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthTabs
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleLogin={handleLogin}
                handleRegister={handleRegister}
                isLoading={isLoading}
                authError={authError}
              />
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;

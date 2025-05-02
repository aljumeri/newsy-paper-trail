
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthTabs from '@/components/admin/AuthTabs';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import AuthLoadingState from '@/components/admin/AuthLoadingState';

const AdminLogin = () => {
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
  
  const { user, session, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user && session) {
      console.log("AdminLogin: User already authenticated, redirecting to dashboard");
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, session, authLoading, navigate]);

  if (authLoading) {
    return <AuthLoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
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
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;

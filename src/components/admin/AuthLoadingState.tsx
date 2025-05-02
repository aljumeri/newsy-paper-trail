
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AuthLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="text-center p-4">
          <p className="text-lg">جارٍ التحميل...</p>
          <p className="text-sm text-gray-500 mt-2">يتم التحقق من حالة الجلسة...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLoadingState;

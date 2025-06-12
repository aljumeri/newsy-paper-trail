import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      const email = searchParams.get('email');
      const token = searchParams.get('token');

      if (!email || !token) {
        setStatus('error');
        setMessage('رابط إلغاء الاشتراك غير صالح');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ email, token })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('تم إلغاء اشتراكك بنجاح');
        } else {
          throw new Error(data.error || 'حدث خطأ أثناء إلغاء الاشتراك');
        }
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء إلغاء الاشتراك');
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">
              {status === 'loading' ? 'جاري إلغاء الاشتراك...' :
               status === 'success' ? 'تم إلغاء الاشتراك' :
               'خطأ في إلغاء الاشتراك'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {status === 'loading' && (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              )}
              <p className="text-gray-600">{message}</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe; 
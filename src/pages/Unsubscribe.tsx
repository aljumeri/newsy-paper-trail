import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Unsubscribe = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract email and token from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  const handleUnsubscribe = async () => {
    if (!email) {
      setError('البريد الإلكتروني مفقود. يرجى التحقق من الرابط.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the unsubscribe Edge Function
      const { data, error } = await supabase.functions.invoke('unsubscribe', {
        body: { 
          email,
          token 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setIsUnsubscribed(true);
        toast({
          title: 'تم إلغاء الاشتراك بنجاح',
          description: 'لقد تم إلغاء اشتراكك من قائمة البريد الإلكتروني.',
        });
      } else {
        throw new Error(data.message || 'حدث خطأ أثناء إلغاء الاشتراك.');
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إلغاء الاشتراك.');
      toast({
        title: 'فشل إلغاء الاشتراك',
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء إلغاء الاشتراك.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Try to unsubscribe automatically if email and token are in URL
  useEffect(() => {
    if (email && token && !isUnsubscribed && !isLoading) {
      handleUnsubscribe();
    }
  }, [email, token]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">إلغاء الاشتراك</h1>
            
            {isLoading && (
              <div className="my-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p>جارٍ إلغاء اشتراكك...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
                <p className="text-sm mt-2">يرجى التحقق من صحة الرابط أو المحاولة لاحقًا.</p>
              </div>
            )}

            {isUnsubscribed ? (
              <div className="my-8">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  <p className="font-medium">تم إلغاء الاشتراك بنجاح</p>
                  <p className="text-sm mt-2">تم إزالة {email} من قائمة البريد الإلكتروني.</p>
                </div>
                <p className="text-gray-600 mb-4">نأسف لرؤيتك تغادر! يمكنك الاشتراك مرة أخرى في أي وقت من الصفحة الرئيسية.</p>
                <Button 
                  onClick={() => navigate('/')}
                  className="mt-4"
                >
                  العودة إلى الصفحة الرئيسية
                </Button>
              </div>
            ) : (
              <div className="my-8">
                {email ? (
                  <>
                    <p className="text-gray-600 mb-6">هل أنت متأكد من رغبتك في إلغاء اشتراك <span className="font-bold">{email}</span> من النشرة الإخبارية؟</p>
                    <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                      <Button 
                        onClick={handleUnsubscribe}
                        disabled={isLoading}
                        variant="destructive"
                      >
                        {isLoading ? 'جارٍ إلغاء الاشتراك...' : 'تأكيد إلغاء الاشتراك'}
                      </Button>
                      <Button 
                        onClick={() => navigate('/')}
                        variant="outline"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">يرجى استخدام الرابط المرسل إلى بريدك الإلكتروني لإلغاء الاشتراك.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe; 
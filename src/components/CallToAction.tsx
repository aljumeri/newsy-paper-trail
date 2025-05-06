
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSubscribe } from '@/hooks/useSubscribe';

const CallToAction = () => {
  const { email, setEmail, isLoading, handleSubscribe } = useSubscribe();

  return (
    <section className="section bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="container px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">هل تود البقاء على اطلاع بآخر أخبار الذكاء الاصطناعي؟</h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            اشترك معنا لتصلك مختارات من الأخبار والأدوات والمصادر المفيدة مباشرة إلى بريدك الإلكتروني
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="flex-grow py-6 bg-white/10 border-white/20 placeholder:text-white/70 text-white text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit"
              className="bg-white text-blue-700 hover:bg-blue-50 py-6 px-8 font-medium" 
              disabled={isLoading}
            >
              {isLoading ? "جارِ الاشتراك..." : "اشترك الآن"}
            </Button>
          </form>
          
          <p className="mt-6 opacity-80 text-sm">
            لا رسائل مزعجة، لا مشاركة بيانات. يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

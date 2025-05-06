
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useSubscribe } from '@/hooks/useSubscribe';

const HeroSection = () => {
  const { email, setEmail, isLoading, handleSubscribe } = useSubscribe();

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="container px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            نشرة سولو <span className="text-purple-300">للذكاء الاصطناعي</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            محتوى عربي مختار ومشروح باحترافية عن آخر تطورات الذكاء الاصطناعي التي تناسب احتياجاتك
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
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
              {isLoading ? "جارٍ الاشتراك..." : "اشترك الآن"}
            </Button>
          </form>
          
          <p className="text-sm opacity-75">
            رسالة كل أسبوع، بدون إزعاج، يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';
import { useSubscribe } from '@/hooks/useSubscribe';

const HeroSection = () => {
  const { email, setEmail, isLoading, handleSubscribe } = useSubscribe();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 max-w-lg animate-fade-in">
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Bell size={20} />
            <span>نشرة دورية</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight whitespace-nowrap">
            نشرة سولو للذكاء الاصطناعي
          </h1>
          <p className="text-lg text-neutral-600">
            انضم إلى أصدقاء سولو الذي يحرصون على متابعة أحدث ما يهمهم في الذكاء الاصطناعي والتقنية والأدوات المفيدة — تُرسل إليك مختاراتنا بعناية إلى بريدك الإلكتروني من وقت لآخر.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
            <Input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="flex-grow text-base py-6 text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8" 
              disabled={isLoading}
            >
              {isLoading ? "جاري الاشتراك..." : "اشترك الآن"}
            </Button>
          </form>
          
          <div className="text-neutral-500 text-sm">
            انضم إلى قراء يفضلون المحتوى المختصر والمفيد. لا رسائل مزعجة، ويمكنك الإلغاء متى أردت.
          </div>
        </div>
        
        <div className="hidden lg:flex justify-end animate-fade-in">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-20 h-20 bg-blue-200/50 rounded-full"></div>
            <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-blue-100/80 rounded-full"></div>
            <img 
              src="https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
              alt="معاينة النشرة الإخبارية" 
              className="w-full max-w-md rounded-lg shadow-xl relative z-10"
            />
          </div>
        </div>
      </div>
      
      {/* العناصر الزخرفية */}
      <div className="absolute top-1/3 left-0 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

export default HeroSection;

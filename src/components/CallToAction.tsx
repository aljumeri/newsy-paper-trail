
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const CallToAction = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "تم بنجاح!",
        description: "لقد تم اشتراكك في نشرتنا الإخبارية.",
      });
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <section className="section bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 whitespace-nowrap">هل أنت مستعد للارتقاء بتفكيرك؟</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            انضم إلى مجتمعنا من المحترفين ذوي التفكير المستقبلي واستلم رؤى أسبوعية مباشرة في بريدك الوارد.
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

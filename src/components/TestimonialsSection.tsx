
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    content: "أكثر شيء يعجبني في النشرة أنها توصلني لأخبار وأدوات ما كنت أسمع عنها، بدون ما أضيع وقتي في تويتر أو أتابع كل المواقع.",
    author: "عبدالله القحطاني",
    role: "مدير تطوير أعمال",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
  },
  {
    content: "أحب بساطتها وتنظيمها. دائمًا ألقى فيها شيء مفيد سواء خبر أو أداة أو رابط يستحق الحفظ.",
    author: "نورة العبدالله",
    role: "باحثة تقنية",
    avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
  },
  {
    content: "جرّبت كثير نشرات بس أغلبها فيها حشو أو إعلانات. نشرة سولو مختلفة، خفيفة ومباشرة وفيها محتوى فعلاً له قيمة.",
    author: "خالد الزهراني",
    role: "مؤسس مشروع ناشئ",
    avatar: "https://images.unsplash.com/photo-1618374789415-3bd5c16483c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1015&q=80"
  },
  {
    content: "وصلتني من توصية، وصارت جزء من روتيني الأسبوعي. تعجبني لأنها ما تتكلف، وتحط أشياء أحسّها فعلاً مفيدة.",
    author: "ريما السبيعي",
    role: "مهتمة بالتقنية والذكاء الاصطناعي",
    avatar: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ماذا يقول قراؤنا</h2>
          <p className="text-lg text-neutral-600">
            انضم إلى آلاف المشتركين الراضين الذين يثقون برؤانا كل أسبوع.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-50 border-none">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <svg 
                      className="h-8 w-8 text-blue-300" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  
                  <p className="text-neutral-700 flex-grow">
                    {testimonial.content}
                  </p>
                  
                  <div className="flex items-center mt-6">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="mr-3">
                      <div className="font-medium">{testimonial.author}</div>
                      <div className="text-sm text-neutral-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

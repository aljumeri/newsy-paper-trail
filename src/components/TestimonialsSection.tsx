
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    content: "أصبحت هذه النشرة الإخبارية طقسي الأسبوعي. الرؤى دائماً جديدة، مدروسة بعمق، ومفاجئة في تطبيقها على عملي.",
    author: "أليكس مورغان",
    role: "مدير المنتج، سترايب",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    content: "لقد اشتركت في عشرات النشرات الإخبارية على مر السنين، ونشرة سولو هي الوحيدة التي أخصص وقتاً لقراءتها كل أسبوع.",
    author: "جيمس ويلسون",
    role: "الرئيس التنفيذي، فيوتشرتك",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    content: "عمق التحليل مع الإيجاز في التقديم يجعل هذه النشرة متميزة. إنها مثل وجود محلل بارع في فريقك.",
    author: "سارة تشن",
    role: "استراتيجي استثمار",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    content: "ما يثير إعجابي أكثر هو كيف تحدد النشرة الاتجاهات الناشئة قبل أسابيع أو شهور من وصولها إلى التغطية الإعلامية السائدة.",
    author: "مايكل ديفيس",
    role: "رئيس الابتكار",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg"
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


import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// بيانات الإصدارات السابقة
const newsletterIssues = [
  {
    id: 1,
    title: "مستقبل الذكاء الاصطناعي في الصناعات الإبداعية",
    excerpt: "كيف يُغير الذكاء الاصطناعي إنشاء المحتوى والتصميم وطريقة تفكيرنا في الإبداع.",
    date: "25 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1655635643532-fa9ba2648cbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2232&q=80",
  },
  {
    id: 2,
    title: "التقنية المستدامة: ما وراء الكلمات الرنانة",
    excerpt: "نظرة متعمقة حول كيفية معالجة شركات التكنولوجيا للمخاوف البيئية في عام 2025.",
    date: "18 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80",
  },
  {
    id: 3,
    title: "ثورة العمل عن بُعد: بعد 5 سنوات",
    excerpt: "دراسة التأثير المستمر لتبني العمل عن بُعد عالميًا على الشركات والإنتاجية وثقافة العمل.",
    date: "11 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80",
  }
];

const FeaturedSection = () => {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">آخر الإصدارات</h2>
          <p className="text-neutral-600">
            تذوق الرؤى التي نقدمها أسبوعياً. تصفح بعض نشراتنا الإخبارية الأخيرة.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsletterIssues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-slide-up">
              <div className="aspect-[16/9] overflow-hidden">
                <img 
                  src={issue.imageUrl} 
                  alt={issue.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </div>
              <CardHeader className="pt-5 pb-2">
                <div className="text-sm text-neutral-500 mb-1">{issue.date}</div>
                <h3 className="text-xl font-semibold font-serif leading-tight">{issue.title}</h3>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-neutral-600">{issue.excerpt}</p>
              </CardContent>
              <CardFooter className="pt-2 pb-5">
                <Button 
                  variant="outline" 
                  className="hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                  asChild
                >
                  <Link to={`/newsletter/${issue.id}`}>
                    قراءة العدد
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="link" className="text-blue-600 hover:text-blue-700 text-lg" asChild>
            <Link to="/archives">عرض كل الأرشيف ←</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;

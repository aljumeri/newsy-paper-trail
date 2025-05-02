
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// بيانات موسعة للإصدارات السابقة
const archiveIssues = [
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
  },
  {
    id: 4,
    title: "الخصوصية الرقمية في عصر الذكاء الاصطناعي",
    excerpt: "فهم كيفية إعادة تشكيل التطورات في الذكاء الاصطناعي لفهمنا للخصوصية وحماية البيانات.",
    date: "4 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1566837945700-30057527ade0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: 5,
    title: "اقتصاد المبدعين: نماذج أعمال جديدة",
    excerpt: "كيف يبني المبدعون الأفراد أعماًلا مستدامة ويعيدون تشكيل الاقتصاد الرقمي.",
    date: "28 مارس 2025",
    imageUrl: "https://images.unsplash.com/photo-1661956602139-ec64991b8b16?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=665&q=80",
  },
  {
    id: 6,
    title: "الويب 3.0: بين الوعد والواقع",
    excerpt: "دراسة متوازنة حول أماكن تقديم تقنيات الويب 3.0 للقيمة وأين تقصر.",
    date: "21 مارس 2025",
    imageUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80",
  },
];

const Archives = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-purple-50 py-16 md:py-24">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-center font-serif mb-6">أرشيف النشرات الإخبارية</h1>
            <p className="text-center text-neutral-600 max-w-2xl mx-auto">
              تصفح إصداراتنا السابقة واطلع على الرؤى التي ربما فاتتك.
            </p>
          </div>
        </div>
        
        <section className="section">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {archiveIssues.map((issue) => (
                <Card key={issue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <div className="mt-4">
                      <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                        قراءة العدد ←
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Archives;

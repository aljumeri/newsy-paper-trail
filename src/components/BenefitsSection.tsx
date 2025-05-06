
import React from 'react';
import { MessageSquare, Globe, Settings, BookOpen, Bell, Users, FileText, Award } from 'lucide-react';

const benefits = [
  {
    icon: <Award className="h-10 w-10 text-blue-600" />,
    title: "رؤى منتقاة",
    description: "نختار لك أفضل الأخبار والمصادر التعليمية بعناية نشارك معك محتوى مختار بعناية من أخبار وأدوات ومقابلات متخصصة في الذكاء الاصطناعي، لتواكب الجديد بأقل جهد وفي وقتك المناسب."
  },
  {
    icon: <Globe className="h-10 w-10 text-blue-600" />,
    title: "أخبار حديثة",
    description: "أحدث تطورات الذكاء الاصطناعي حول العالم نغطي الأخبار العالمية المتعلقة بالتقنيات الحديثة في الذكاء الاصطناعي وتطبيقاته في الحياة اليومية والقطاعات المختلفة."
  },
  {
    icon: <Settings className="h-10 w-10 text-blue-600" />,
    title: "أدوات وتقنيات",
    description: "مراجعات سريعة لأدوات الذكاء الاصطناعي الجديدة نستعرض أحدث الأدوات والبرمجيات المدعومة بالذكاء الاصطناعي مع روابط مباشرة لتجربتها."
  },
  {
    icon: <BookOpen className="h-10 w-10 text-blue-600" />,
    title: "مقابلات ومحتوى من الخبراء",
    description: "محتوى موثوق من قادة المجال نشاركك مقتطفات أو روابط لمقابلات ومقالات مميزة من خبراء الذكاء الاصطناعي والتقنية."
  },
  {
    icon: <Bell className="h-10 w-10 text-blue-600" />,
    title: "بدون إزعاج",
    description: "النشرة تصل إليك عندما يكون هناك شيء يستحق القراءة لا وقت محدد لإرسال النشرة، بل تصل فقط عندما تتوفر لدينا أخبار وأدوات ومصادر مميزة تستحق أن نشاركها معك."
  },
  {
    icon: <Users className="h-10 w-10 text-blue-600" />,
    title: "شارك وتفاعل",
    description: "انضم لمجتمع مهتم بنفس المجال يمكنك الرد على النشرة أو إرسال أفكار وأدوات ترى أنها تستحق المشاركة معنا في الإصدارات القادمة."
  },
  {
    icon: <FileText className="h-10 w-10 text-blue-600" />,
    title: "بدون تعقيد",
    description: "نقدم المعلومة كما هي من مصدرها لا نحلل أو نضيف توقعات، فقط ننقل لك المعلومة المفيدة كما وردت من مصادرها الموثوقة."
  }
];

const BenefitsSection = () => {
  return (
    <section className="section bg-blue-50">
      <div className="container">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تشترك معنا؟</h2>
          <p className="text-lg text-neutral-600">
            أكثر من مجرد نشرة إخبارية أخرى. نحن نقدم رؤى مصممة بعناية تساعدك على البقاء في المقدمة.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="ml-3">{benefit.icon}</div>
                <h3 className="headline text-xl font-semibold">{benefit.title}</h3>
              </div>
              <p className="text-neutral-600 text-right">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">العناوين الرئيسية هذا الأسبوع</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "الذكاء الاصطناعي يغير مستقبل الصناعات الإبداعية",
              "تأثير التكنولوجيا المستدامة على الاقتصاد العالمي",
              "ثورة العمل عن بعد: 5 سنوات لاحقًا",
              "أمن المعلومات في عصر الذكاء الاصطناعي",
              "مستقبل العملات الرقمية وتأثيرها على الاقتصاد",
              "اتجاهات التسويق الرقمي لعام 2025"
            ].map((headline, index) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-600 font-bold ml-2 text-lg">•</span>
                <h4 className="font-bold text-lg">{headline}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

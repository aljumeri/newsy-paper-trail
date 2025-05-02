
import React from 'react';
import { Mail, Calendar, Inbox, MessageSquare, Newspaper, TrendingUp, Globe, Award } from 'lucide-react';

const benefits = [
  {
    icon: <Newspaper className="h-10 w-10 text-blue-600" />,
    title: "أخبار الذكاء الاصطناعي",
    description: "آخر التطورات والاتجاهات في عالم الذكاء الاصطناعي والتكنولوجيا والابتكار."
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-blue-600" />,
    title: "تحليل الأسواق",
    description: "تحليلات عميقة للأسواق المالية واتجاهات الاستثمار الرئيسية في مجال التقنيات الناشئة."
  },
  {
    icon: <Globe className="h-10 w-10 text-blue-600" />,
    title: "أخبار عالمية",
    description: "تغطية شاملة للأحداث العالمية ذات التأثير على الذكاء الاصطناعي والاقتصاد والمجتمع."
  },
  {
    icon: <Mail className="h-10 w-10 text-blue-600" />,
    title: "رؤى مختارة",
    description: "تم اختيار كل إصدار وصياغته بعناية لتقديم أقصى قيمة في أقل وقت."
  },
  {
    icon: <Calendar className="h-10 w-10 text-blue-600" />,
    title: "تسليم أسبوعي",
    description: "احصل على نشرتنا الإخبارية كل صباح ثلاثاء، وهو وقت مثالي لتشكيل تفكيرك الاستراتيجي للأسبوع."
  },
  {
    icon: <Inbox className="h-10 w-10 text-blue-600" />,
    title: "محتوى حصري",
    description: "الوصول إلى المقابلات والتحليلات التي لن تجدها في أي مكان آخر، من قادة الصناعة والمبتكرين."
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-blue-600" />,
    title: "انضم إلى المحادثة",
    description: "يمكن للمشتركين المشاركة في مناقشات مجتمعنا الخاص وجلسات الأسئلة والأجوبة الشهرية."
  },
  {
    icon: <Award className="h-10 w-10 text-blue-600" />,
    title: "تقارير متميزة",
    description: "تقارير عميقة عن المواضيع الأكثر أهمية في عالم الذكاء الاصطناعي والأعمال والتكنولوجيا."
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

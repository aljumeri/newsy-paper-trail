
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define the newsletter data structure
interface NewsletterData {
  id: string;
  subject: string;
  content: string;
  created_at: string;
  sent_at: string | null;
  recipients_count?: number;
}

// Newsletter static examples (as fallback)
interface StaticNewsletterData {
  id: number;
  title: string;
  date: string;
  imageUrl: string;
  content: React.ReactNode;
}

const newsletterData: Record<number, StaticNewsletterData> = {
  1: {
    id: 1,
    title: "مستقبل الذكاء الاصطناعي في الصناعات الإبداعية",
    date: "25 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1655635643532-fa9ba2648cbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2232&q=80",
    content: (
      <div className="space-y-6">
        <p>
          عزيزي القارئ، أهلاً بك في عدد جديد من نشرة سولو للذكاء الاصطناعي. في هذا العدد نتناول موضوعاً مهماً يشغل بال الكثيرين في المجال الإبداعي - كيف يُغير الذكاء الاصطناعي من عمليات الإبداع والتصميم وإنتاج المحتوى؟
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">الثورة الإبداعية الجديدة</h2>
        <p>
          لم يعد الذكاء الاصطناعي مجرد أداة للمهام الروتينية، بل أصبح شريكاً في العملية الإبداعية. نشهد اليوم طفرة هائلة في قدرات نماذج الذكاء الاصطناعي على إنتاج وتحرير الصور والنصوص والموسيقى وحتى الفيديو. شركات مثل OpenAI و Google وAnthropic تتنافس لتقديم نماذج أكثر قدرة على فهم السياق الإبداعي والاستجابة بشكل أفضل للتوجيهات الفنية.
        </p>

        <div className="my-8 border-r-4 border-blue-600 pr-4 italic">
          "الذكاء الاصطناعي لا يحل محل المبدعين، بل يوسع من قدراتهم ويفتح آفاقاً جديدة للتعبير" - سارة جونسون، خبيرة تقنيات الإبداع
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">تحولات في صناعة التصميم</h2>
        <p>
          أصبح مصممو الجرافيك والمحتوى البصري يعتمدون على أدوات مثل Midjourney وDALL-E 3 وStable Diffusion لتسريع عمليات استكشاف الأفكار وإنتاج التصاميم الأولية. هذا لا يعني استبدال المصممين، بل تحولهم إلى "موجهين" للعملية الإبداعية، حيث يركزون على الجوانب الاستراتيجية والتفاعلية بينما تتولى الآلة الجوانب التنفيذية.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">التحديات الأخلاقية</h2>
        <p>
          مع هذه التطورات تظهر تحديات أخلاقية وقانونية متعلقة بحقوق الملكية الفكرية وأصالة الإبداع. من يملك حقوق عمل فني تم إنتاجه بمساعدة الذكاء الاصطناعي؟ هل يمكن اعتبار محتوى منتج بالكامل بواسطة الآلة عملاً إبداعياً؟ هذه أسئلة تتطلب إعادة تعريف لمفاهيم الإبداع والملكية في العصر الرقمي.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">أدوات للمبدعين</h2>
        <p>
          إليك بعض الأدوات المثيرة للاهتمام التي ظهرت مؤخراً:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>Runway Gen-3:</strong> منصة متطورة لإنتاج الفيديو باستخدام الذكاء الاصطناعي.
          </li>
          <li>
            <strong>Adobe Firefly:</strong> مجموعة من أدوات الذكاء الاصطناعي المدمجة في منتجات Adobe لتعزيز قدرات التصميم.
          </li>
          <li>
            <strong>Soundraw:</strong> منصة لإنتاج الموسيقى الأصلية باستخدام الذكاء الاصطناعي.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">النظرة المستقبلية</h2>
        <p>
          نتوقع في السنوات القادمة مزيداً من التكامل بين الإبداع البشري والذكاء الاصطناعي، مع ظهور أدوات أكثر تخصصاً تستهدف مجالات إبداعية محددة. سنشهد أيضاً تطوراً في الأطر القانونية والتنظيمية لمعالجة القضايا المتعلقة بالملكية الفكرية والأخلاقيات.
        </p>

        <p className="mt-8">
          نأمل أن تكون هذه النظرة المعمقة قد قدمت لك رؤى جديدة حول مستقبل الإبداع في عصر الذكاء الاصطناعي. نرحب بتعليقاتكم وأفكاركم دائماً.
        </p>
      </div>
    )
  },
  2: {
    id: 2,
    title: "التقنية المستدامة: ما وراء الكلمات الرنانة",
    date: "18 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80",
    content: (
      <div className="space-y-6">
        <p>
          أهلاً بكم في إصدار جديد من نشرة سولو للذكاء الاصطناعي. في هذا العدد، نتناول موضوعاً مهماً وهو التقنية المستدامة وكيف تتعامل شركات التكنولوجيا مع التحديات البيئية في عام 2025.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">ما وراء العبارات التسويقية</h2>
        <p>
          أصبحت "الاستدامة" كلمة طنانة في عالم التكنولوجيا، لكن ما مدى جدية الشركات في تبنيها؟ في هذا التقرير، نلقي نظرة متعمقة على الإجراءات الفعلية التي تتخذها الشركات الكبرى لتقليل بصمتها الكربونية وتأثيرها البيئي.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">استهلاك الطاقة في مراكز البيانات</h2>
        <p>
          مع تزايد الاعتماد على الحوسبة السحابية وخدمات الذكاء الاصطناعي، ارتفع استهلاك مراكز البيانات للطاقة بشكل كبير. تشير التقديرات إلى أن مراكز البيانات تستهلك حوالي 1-2% من الكهرباء العالمية، وهذا الرقم في ازدياد.
        </p>
        
        <p>
          لكن هناك بعض التطورات الإيجابية:
        </p>
        
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>Google:</strong> تعمل على تشغيل جميع مراكز بياناتها باستخدام الطاقة المتجددة بنسبة 100% بحلول عام 2030.
          </li>
          <li>
            <strong>Microsoft:</strong> أعلنت عن خطط لتكون سلبية الكربون بحلول عام 2030.
          </li>
          <li>
            <strong>Amazon:</strong> تستثمر بكثافة في مشاريع الطاقة المتجددة مع هدف الوصول إلى صافي انبعاثات صفرية بحلول عام 2040.
          </li>
        </ul>

        <div className="my-8 border-r-4 border-blue-600 pr-4 italic">
          "التحول الحقيقي نحو الاستدامة يتطلب إعادة التفكير في كيفية تصميم وبناء وتشغيل البنية التحتية التقنية" - أحمد خالد، مدير الاستدامة البيئية في شركة تكنولوجية رائدة
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">تصميم الأجهزة المستدامة</h2>
        <p>
          بدأت شركات مثل Apple وSamsung في اتخاذ خطوات جادة نحو:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>استخدام مواد معاد تدويرها في تصنيع الأجهزة</li>
          <li>تصميم منتجات أسهل في الإصلاح وإعادة التدوير</li>
          <li>تقليل النفايات الإلكترونية عبر برامج استعادة المنتجات</li>
          <li>تقليل استخدام المواد السامة في عمليات التصنيع</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">الذكاء الاصطناعي كأداة للاستدامة</h2>
        <p>
          من المفارقات أن الذكاء الاصطناعي، رغم استهلاكه الكبير للطاقة، يساهم أيضاً في حلول الاستدامة:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>تحسين كفاءة استخدام الطاقة في المباني والمصانع</li>
          <li>التنبؤ بأنماط الطقس لتعزيز إنتاج الطاقة المتجددة</li>
          <li>مراقبة التلوث وتتبع الموارد الطبيعية</li>
          <li>تحسين الزراعة المستدامة وإدارة المحاصيل</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">ما وراء الأرباح: قياس التأثير الحقيقي</h2>
        <p>
          تتجه بعض الشركات نحو نماذج قياس أكثر شمولاً تتجاوز مجرد الأرباح المالية، لتشمل تقييم التأثير البيئي والاجتماعي. هذا يمثل تحولاً جذرياً في كيفية تقييم نجاح الشركات التقنية.
        </p>

        <p className="mt-8">
          نأمل أن تكون هذه النظرة قد أعطتكم صورة أوضح عن واقع الاستدامة في قطاع التكنولوجيا. في الإصدارات القادمة، سنواصل متابعة هذا الموضوع المهم ومدى التقدم الذي تحرزه الشركات في هذا المجال.
        </p>
      </div>
    )
  },
  3: {
    id: 3,
    title: "ثورة العمل عن بُعد: بعد 5 سنوات",
    date: "11 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80",
    content: (
      <div className="space-y-6">
        <p>
          مرحباً بكم في عدد جديد من نشرة سولو للذكاء الاصطناعي. اليوم نستعرض تجربة العمل عن بُعد بعد خمس سنوات من تبنيها على نطاق واسع، وكيف أعادت تشكيل ثقافة العمل والإنتاجية والتوازن بين الحياة المهنية والشخصية.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">نظرة على الإحصائيات</h2>
        <p>
          وفقاً لأحدث الدراسات، أصبح 45% من القوى العاملة العالمية تعمل بنظام هجين (مزيج من العمل عن بُعد والحضور المكتبي)، بينما يعمل 30% عن بُعد بشكل كامل. هذا تحول جذري مقارنة بما قبل عام 2020.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">البنية التحتية الرقمية الجديدة</h2>
        <p>
          شهدت السنوات الخمس الماضية ثورة في أدوات التعاون الرقمي:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>منصات اجتماعات افتراضية ثلاثية الأبعاد تحاكي تجربة اللقاءات الواقعية</li>
          <li>أدوات تعاون تعتمد على الذكاء الاصطناعي لتبسيط التواصل عبر المناطق الزمنية المختلفة</li>
          <li>تقنيات الواقع المعزز للتدريب والتوجيه عن بُعد</li>
          <li>منصات إدارة المهام التي تتكيف مع أنماط عمل كل فرد</li>
        </ul>

        <div className="my-8 border-r-4 border-blue-600 pr-4 italic">
          "العمل عن بُعد لم يعد مجرد ميزة إضافية، بل أصبح جزءاً أساسياً من استراتيجية جذب المواهب والاحتفاظ بها" - ليلى المهندس، خبيرة الموارد البشرية
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">تأثير العمل عن بُعد على الإنتاجية</h2>
        <p>
          تُظهر الدراسات الحديثة أن الإنتاجية في نموذج العمل الهجين ارتفعت بنسبة 22% مقارنة بنموذج العمل المكتبي التقليدي. لكن هناك تفاوت كبير حسب:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>طبيعة الصناعة والوظيفة</li>
          <li>جودة البنية التحتية التقنية</li>
          <li>مهارات الإدارة عن بُعد</li>
          <li>ثقافة الشركة</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">إعادة تشكيل المساحات المكتبية</h2>
        <p>
          تحولت المكاتب من أماكن للعمل اليومي إلى مراكز للتعاون والإبداع:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>مساحات مفتوحة مرنة يمكن إعادة ترتيبها حسب الحاجة</li>
          <li>غرف اجتماعات مجهزة بتقنيات متطورة للتواصل مع الفرق البعيدة</li>
          <li>مناطق للاسترخاء والتفكير الإبداعي</li>
          <li>تقنيات ذكية لحجز المساحات وتتبع الاستخدام</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">التحديات المستمرة</h2>
        <p>
          رغم التقدم الكبير، لا تزال هناك تحديات:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>الشعور بالعزلة والانفصال عن ثقافة الشركة</li>
          <li>صعوبة بناء العلاقات والشبكات المهنية</li>
          <li>تحديات التوازن بين العمل والحياة الشخصية</li>
          <li>قضايا الأمن السيبراني والخصوصية</li>
          <li>التفاوت في الوصول إلى التكنولوجيا والبنية التحتية</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">الاتجاهات المستقبلية</h2>
        <p>
          نتوقع في السنوات القادمة:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>توسع المناطق الريفية والمدن الصغيرة مع انتقال العاملين عن بُعد بعيداً عن المدن الكبرى</li>
          <li>ظهور "عقود العمل الذكية" التي تتكيف تلقائياً مع أنماط العمل والإنتاجية</li>
          <li>تطوير أطر قانونية وتنظيمية جديدة للعمل عن بُعد على المستوى العالمي</li>
          <li>تحول نحو قياس النتائج بدلاً من وقت العمل</li>
        </ul>

        <p className="mt-8">
          نأمل أن تكون هذه النظرة المعمقة حول مستقبل العمل قد قدمت لكم رؤى مفيدة. سنواصل متابعة هذا الموضوع المهم في إصدارات قادمة.
        </p>
      </div>
    )
  },
  4: {
    id: 4,
    title: "الخصوصية الرقمية في عصر الذكاء الاصطناعي",
    date: "4 أبريل 2025",
    imageUrl: "https://images.unsplash.com/photo-1566837945700-30057527ade0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    content: (
      <div className="space-y-6">
        <p>
          أهلاً بكم في عدد جديد من نشرة سولو للذكاء الاصطناعي. في هذا العدد نتناول قضية محورية وهي الخصوصية الرقمية في عصر الذكاء الاصطناعي، وكيف تتغير مفاهيم الخصوصية وحماية البيانات مع تطور هذه التقنيات.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">المعضلة الأساسية</h2>
        <p>
          تواجه تقنيات الذكاء الاصطناعي معضلة جوهرية: فهي تحتاج إلى كميات هائلة من البيانات للتعلم والتحسن، لكن جمع هذه البيانات يثير مخاوف جدية تتعلق بالخصوصية. كيف نوازن بين الابتكار وحماية خصوصية الأفراد؟
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">الاتجاهات التشريعية العالمية</h2>
        <p>
          شهدت السنوات الأخيرة تطوراً كبيراً في التشريعات المتعلقة بالخصوصية:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>الاتحاد الأوروبي:</strong> قانون الذكاء الاصطناعي (AI Act) الذي يصنف تطبيقات الذكاء الاصطناعي حسب مستوى المخاطر ويفرض قيوداً صارمة على الأنظمة عالية الخطورة.
          </li>
          <li>
            <strong>الولايات المتحدة:</strong> قوانين خصوصية البيانات على مستوى الولايات، مع مناقشات لإصدار قانون فيدرالي شامل.
          </li>
          <li>
            <strong>الصين:</strong> قانون حماية المعلومات الشخصية وقانون أمن البيانات الذي ينظم جمع واستخدام البيانات الشخصية.
          </li>
          <li>
            <strong>المنطقة العربية:</strong> تطوير أطر تنظيمية تتماشى مع المعايير العالمية مع مراعاة الخصوصيات الثقافية المحلية.
          </li>
        </ul>

        <div className="my-8 border-r-4 border-blue-600 pr-4 italic">
          "الخصوصية ليست مجرد قضية تقنية، بل هي قضية حقوق إنسان أساسية في العصر الرقمي" - نورة الأحمد، خبيرة أخلاقيات التكنولوجيا
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">تقنيات حماية الخصوصية</h2>
        <p>
          ظهرت مجموعة من التقنيات المبتكرة لحماية الخصوصية:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>التعلم الفيدرالي (Federated Learning):</strong> تدريب نماذج الذكاء الاصطناعي دون نقل البيانات الأصلية من أجهزة المستخدمين.
          </li>
          <li>
            <strong>التشفير المتجانس (Homomorphic Encryption):</strong> معالجة البيانات المشفرة دون الحاجة إلى فك تشفيرها.
          </li>
          <li>
            <strong>الخصوصية التفاضلية (Differential Privacy):</strong> إضافة ضوضاء إحصائية للبيانات لحماية هوية الأفراد مع الحفاظ على فائدة البيانات للتحليل.
          </li>
          <li>
            <strong>المعالجة المحلية:</strong> تنفيذ عمليات الذكاء الاصطناعي على الأجهزة المحلية بدلاً من السحابة.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">مستقبل التعرف على الوجه والقياسات الحيوية</h2>
        <p>
          أثارت تقنيات التعرف على الوجه وأنظمة القياسات الحيوية جدلاً واسعاً:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>حظر استخدام هذه التقنيات في بعض المدن والبلدان</li>
          <li>تطوير معايير أخلاقية لاستخدامها</li>
          <li>البحث عن توازن بين الأمن والخصوصية</li>
          <li>مخاوف من المراقبة الجماعية وتأثيرها على الحريات المدنية</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">الذكاء الاصطناعي كحامٍ للخصوصية</h2>
        <p>
          من المفارقات أن الذكاء الاصطناعي نفسه يمكن أن يكون أداة لحماية الخصوصية:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>أنظمة كشف الاختراقات والهجمات السيبرانية</li>
          <li>اكتشاف تسريبات البيانات والتنبيه عنها بسرعة</li>
          <li>إخفاء الهوية التلقائي للمعلومات الحساسة</li>
          <li>تحليل المخاطر وتقييم نقاط الضعف في أنظمة حماية البيانات</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">نحو نموذج جديد للخصوصية</h2>
        <p>
          يتجه العالم نحو نموذج جديد للخصوصية يتسم بـ:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>تمكين المستخدمين من التحكم الكامل في بياناتهم</li>
          <li>الشفافية في كيفية جمع واستخدام البيانات</li>
          <li>المساءلة والمسؤولية عن إساءة استخدام البيانات</li>
          <li>التصميم المراعي للخصوصية من البداية (Privacy by Design)</li>
        </ul>

        <p className="mt-8">
          في الختام، يبقى تحقيق التوازن بين الابتكار والخصوصية تحدياً مستمراً، لكنه ضروري لبناء مستقبل رقمي يحترم حقوق الأفراد ويحميها. سنواصل متابعة هذا الموضوع الحيوي في الإصدارات القادمة من نشرة سولو.
        </p>
      </div>
    )
  },
  5: {
    id: 5,
    title: "اقتصاد المبدعين: نماذج أعمال جديدة",
    date: "28 مارس 2025",
    imageUrl: "https://images.unsplash.com/photo-1661956602139-ec64991b8b16?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=665&q=80",
    content: (
      <div className="space-y-6">
        <p>
          مرحباً بكم في عدد جديد من نشرة سولو للذكاء الاصطناعي. اليوم نستكشف اقتصاد المبدعين (Creator Economy) وكيف أصبح المبدعون الأفراد قادرين على بناء أعمال مستدامة وإعادة تشكيل الاقتصاد الرقمي.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">صعود اقتصاد المبدعين</h2>
        <p>
          شهدت السنوات الأخيرة تحولاً جذرياً في النظام الاقتصادي الرقمي، حيث أصبح بإمكان الأفراد المبدعين تحويل شغفهم إلى مصدر دخل مستدام. يقدر حجم اقتصاد المبدعين عالمياً في عام 2025 بأكثر من 650 مليار دولار، مع وجود أكثر من 200 مليون شخص يعرّفون أنفسهم كمبدعين محترفين.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">نماذج الأعمال المبتكرة</h2>
        <p>
          تطورت نماذج الأعمال في هذا المجال بشكل ملحوظ:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>الاشتراكات المباشرة:</strong> منصات مثل Patreon وSubstack تتيح للمبدعين الحصول على دخل مباشر من جمهورهم.
          </li>
          <li>
            <strong>الاقتصاد الرقمي:</strong> بيع المنتجات الرقمية مثل الدورات التدريبية والكتب الإلكترونية والبرامج.
          </li>
          <li>
            <strong>الرموز غير القابلة للاستبدال (NFTs):</strong> تحويل الأعمال الإبداعية إلى أصول رقمية فريدة يمكن امتلاكها وتداولها.
          </li>
          <li>
            <strong>شراكات العلامات التجارية:</strong> تعاون المبدعين مع العلامات التجارية بطرق أكثر أصالة وشفافية.
          </li>
          <li>
            <strong>الخدمات الحصرية:</strong> تقديم استشارات واستضافة فعاليات للجمهور المخلص.
          </li>
        </ul>

        <div className="my-8 border-r-4 border-blue-600 pr-4 italic">
          "نحن في عصر ذهبي للمبدعين المستقلين، حيث يمكن للشخص الذي لديه مهارة أو معرفة أو رؤية فريدة أن يجد جمهوره ويبني اقتصاده الخاص" - يوسف مراد، خبير اقتصاد المبدعين
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">دور الذكاء الاصطناعي في تمكين المبدعين</h2>
        <p>
          يلعب الذكاء الاصطناعي دوراً محورياً في تمكين المبدعين:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>أتمتة المهام الروتينية مثل التحرير والجدولة</li>
          <li>تحليل بيانات الجمهور لفهم اهتماماتهم بشكل أفضل</li>
          <li>تخصيص المحتوى لشرائح مختلفة من الجمهور</li>
          <li>إنشاء محتوى مساعد يكمل عمل المبدع البشري</li>
          <li>تحسين جودة الإنتاج بتكلفة منخفضة</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">تحديات اقتصاد المبدعين</h2>
        <p>
          رغم الفرص الهائلة، يواجه المبدعون تحديات متعددة:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>الاستدامة المالية على المدى الطويل</li>
          <li>الإرهاق والضغط النفسي نتيجة الحاجة للإنتاج المستمر</li>
          <li>مخاطر الاعتماد على منصات قد تغير سياساتها أو خوارزمياتها</li>
          <li>المنافسة المتزايدة مع دخول المزيد من المبدعين إلى السوق</li>
          <li>قضايا الملكية الفكرية وسهولة نسخ المحتوى الرقمي</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">الاتجاهات المستقبلية</h2>
        <p>
          نرى العديد من الاتجاهات التي ستشكل مستقبل اقتصاد المبدعين:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>اللامركزية المتزايدة:</strong> منصات وأدوات تتيح للمبدعين السيطرة الكاملة على علاقتهم مع جمهورهم دون وسطاء.
          </li>
          <li>
            <strong>الواقع المعزز والافتراضي:</strong> تجارب تفاعلية جديدة تربط المبدعين بجمهورهم.
          </li>
          <li>
            <strong>منتجات الذكاء الاصطناعي:</strong> مبدعون يطورون أدوات ذكاء اصطناعي مخصصة لجمهورهم.
          </li>
          <li>
            <strong>التحول من التسويق إلى بناء المجتمع:</strong> التركيز على إنشاء مجتمعات مترابطة بدلاً من مجرد جذب المشاهدات.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">نصائح للمبدعين الناشئين</h2>
        <p>
          إذا كنت تفكر في الانضمام إلى اقتصاد المبدعين، إليك بعض النصائح:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>ابدأ بتحديد مجال تخصص واضح يجمع بين شغفك ومهاراتك</li>
          <li>ركز على بناء جمهور مخلص بدلاً من السعي وراء الأرقام الكبيرة</li>
          <li>نوّع مصادر دخلك ولا تعتمد على منصة واحدة</li>
          <li>استثمر في تطوير مهاراتك التقنية والتسويقية</li>
          <li>تواصل مع مبدعين آخرين وابنِ شبكة علاقات داعمة</li>
        </ul>

        <p className="mt-8">
          نأمل أن تكون هذه النظرة العميقة عن اقتصاد المبدعين قد ألهمتكم وقدمت لكم رؤى قيمة. سنواصل متابعة تطورات هذا المجال المثير في إصدارات قادمة.
        </p>
      </div>
    )
  },
  6: {
    id: 6,
    title: "الويب 3.0: بين الوعد والواقع",
    date: "21 مارس 2025",
    imageUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80",
    content: (
      <div className="space-y-6">
        <p>
          أهلاً بكم في عدد جديد من نشرة سولو للذكاء الاصطناعي. في هذا العدد نتناول موضوع الويب 3.0 من منظور متوازن، مستعرضين إنجازاته الحقيقية والتحديات التي تواجهه والفجوة بين الوعود النظرية والتطبيق العملي.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">ماذا نعني بالويب 3.0؟</h2>
        <p>
          الويب 3.0 هو مصطلح يشير إلى الجيل الثالث من خدمات الإنترنت، ويتميز بالتركيز على:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>اللامركزية وتقليل سيطرة الشركات الكبرى</li>
          <li>التكنولوجيات القائمة على البلوكتشين</li>
          <li>استخدام الرموز الرقمية والعملات المشفرة</li>
          <li>ملكية المستخدمين لبياناتهم ومحتواهم</li>
          <li>الويب الدلالي (Semantic Web) الذي يفهم سياق المعلومات</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">نجاحات حقيقية</h2>
        <p>
          رغم كل الضجيج، هناك بالفعل نجاحات ملموسة للويب 3.0:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>DeFi (التمويل اللامركزي):</strong> وصلت قيمة الأصول المقفلة في بروتوكولات DeFi إلى مئات المليارات، مما يوفر خدمات مالية لمن لا يملكون حسابات مصرفية.
          </li>
          <li>
            <strong>DAOs (المنظمات المستقلة اللامركزية):</strong> نماذج جديدة للحوكمة التعاونية تمكن المجتمعات من إدارة الموارد والمشاريع بشكل ديمقراطي.
          </li>
          <li>
            <strong>أنظمة الهوية اللامركزية:</strong> تتيح للمستخدمين التحكم في هوياتهم الرقمية دون الاعتماد على منصات مركزية.
          </li>
          <li>
            <strong>مشاريع التخزين اللامركزي:</strong> مثل IPFS وFilecoin التي توفر بدائل للتخزين السحابي المركزي.
          </li>
        </ul>

        <div className="my-8 border-r-4 border-blue-600 pr-4 italic">
          "الويب 3.0 ليس ثورة شاملة بل تطور تدريجي، حيث نرى تبنياً متفاوتاً لمفاهيمه وتقنياته في قطاعات مختلفة" - فراس الخطيب، محلل تقني
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">التحديات والعقبات</h2>
        <p>
          يواجه الويب 3.0 عدة تحديات جوهرية:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>تعقيد تجربة المستخدم:</strong> لا تزال تطبيقات الويب 3.0 معقدة وليست سهلة الاستخدام للمستخدم العادي.
          </li>
          <li>
            <strong>قابلية التوسع:</strong> تواجه شبكات البلوكتشين تحديات في معالجة حجم كبير من المعاملات بسرعة وبتكلفة معقولة.
          </li>
          <li>
            <strong>استهلاك الطاقة:</strong> بعض تقنيات الويب 3.0، خاصة البيتكوين، تستهلك كميات هائلة من الطاقة.
          </li>
          <li>
            <strong>الجوانب التنظيمية:</strong> عدم وضوح الإطار القانوني والتنظيمي في العديد من البلدان.
          </li>
          <li>
            <strong>الأمان والاحتيال:</strong> مشاكل متكررة مع الاختراقات وعمليات الاحتيال.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">الفجوة بين الوعد والواقع</h2>
        <p>
          هناك تباين ملحوظ بين ما يُروّج له وما تحقق بالفعل:
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">الادعاء: اللامركزية الكاملة</h3>
        <p>
          <strong>الواقع:</strong> العديد من مشاريع الويب 3.0 لا تزال مركزية جزئياً، مع سيطرة المطورين الرئيسيين أو المستثمرين على القرارات المهمة.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">الادعاء: سهولة الوصول للجميع</h3>
        <p>
          <strong>الواقع:</strong> لا تزال معظم تقنيات الويب 3.0 حكراً على النخبة التقنية والمجتمعات المتخصصة.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-2">الادعاء: حل جميع مشاكل الخصوصية</h3>
        <p>
          <strong>الواقع:</strong> على الرغم من إمكانية التشفير، فإن سجلات البلوكتشين العامة قد تكشف أنماطاً ومعلومات حساسة.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">المجالات الواعدة حقاً</h2>
        <p>
          بعيداً عن الضجيج، هناك مجالات يظهر فيها الويب 3.0 إمكانات حقيقية:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>
            <strong>إثبات المصدر والأصالة:</strong> تتبع أصول المنتجات وإثبات ملكية الأصول الرقمية.
          </li>
          <li>
            <strong>النظم المالية البديلة:</strong> خاصة في المناطق ذات الوصول المحدود للخدمات المصرفية.
          </li>
          <li>
            <strong>الحوكمة الرقمية:</strong> نماذج جديدة للمشاركة والتصويت والإدارة الجماعية.
          </li>
          <li>
            <strong>توثيق السجلات:</strong> مثل السجلات الطبية والأكاديمية والعقارية.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">نظرة مستقبلية متوازنة</h2>
        <p>
          يبدو أن مستقبل الويب 3.0 سيتسم بـ:
        </p>
        <ul className="list-disc pr-8 space-y-2">
          <li>انتقاء تطبيق تقنياته في المجالات التي توفر قيمة حقيقية</li>
          <li>تبني جزئي لمفاهيمه من قبل شركات الويب التقليدية</li>
          <li>نضوج تدريجي للحلول التقنية المرتبطة بالتوسعية والأداء</li>
          <li>خلق هجين من الويب 2.0 والويب 3.0 يجمع بين مزايا كليهما</li>
        </ul>

        <p className="mt-8">
          في الختام، يمثل الويب 3.0 اتجاهاً تطورياً مهماً في الإنترنت، لكن تحقيق وعوده يتطلب نهجاً واقعياً بعيداً عن المبالغات. سنواصل متابعة تطوره ونقدم لكم تحليلات موضوعية في الإصدارات القادمة.
        </p>
      </div>
    )
  }
};

const NewsletterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [newsletter, setNewsletter] = useState<NewsletterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        if (!id) {
          throw new Error("Newsletter ID is missing");
        }

        console.log("Fetching newsletter with ID:", id);
        
        // Attempt to fetch from database
        const { data, error } = await supabase
          .from('newsletters')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Error fetching newsletter:", error);
          throw error;
        }
        
        if (data) {
          console.log("Newsletter fetched successfully:", data.subject);
          setNewsletter(data);
        } else {
          // Fallback to static data if available
          const staticId = parseInt(id);
          if (newsletterData[staticId]) {
            console.log("Using static newsletter data as fallback");
            // Convert static data to match NewsletterData interface
            const staticNewsletter = newsletterData[staticId];
            const convertedNewsletter: NewsletterData = {
              id: staticNewsletter.id.toString(),
              subject: staticNewsletter.title,
              content: typeof staticNewsletter.content === 'string' ? staticNewsletter.content : '',
              created_at: staticNewsletter.date,
              sent_at: null
            };
            setNewsletter(convertedNewsletter);
          } else {
            throw new Error("Newsletter not found");
          }
        }
      } catch (err) {
        console.error("Failed to fetch newsletter:", err);
        setError(err instanceof Error ? err.message : "Failed to load newsletter");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-16">
          <div className="text-center">جاري التحميل...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">عذراً، لم يتم العثور على النشرة المطلوبة</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <Link to="/archives">
              <Button>العودة إلى الأرشيف</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero section for the newsletter */}
        <div className="bg-blue-50 py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-full">
                <div className="text-sm text-blue-600 mb-2">
                  {newsletter.created_at ? formatDate(newsletter.created_at) : ""}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{newsletter.subject}</h1>
                <Link to="/archives" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                  <ChevronRight className="mr-1" size={16} />
                  <span>العودة إلى الأرشيف</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Newsletter content */}
        <div className="container py-12">
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow">
            <article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: newsletter.content }}></article>
            
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4">شارك هذا العدد</h3>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  تويتر
                </Button>
                <Button variant="outline" size="sm">
                  فيسبوك
                </Button>
                <Button variant="outline" size="sm">
                  نسخ الرابط
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsletterDetail;

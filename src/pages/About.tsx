import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CallToAction from '@/components/CallToAction';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-purple-50 py-16 md:py-24">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-center font-serif mb-6">عن نشرة سولو للذكاء الاصطناعي</h1>
            <p className="text-center text-neutral-600 max-w-2xl mx-auto">
              القصة وراء نشرتنا الإخبارية والفريق الذي يجعلها ممكنة.
            </p>
          </div>
        </div>
        
        <section className="section">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-serif">مهمتنا</h2>
                <p className="text-lg mb-4 text-neutral-700">
                  في نشرة سولو، نؤمن بأن البقاء على اطلاع لا يجب أن يشعرك بالعمل. نشاركك أخبارًا وأدوات ومصادر في الذكاء الاصطناعي بطريقة بسيطة وواضحة، دون تعقيد أو مبالغة. نرسل لك النشرة فقط عندما يتوفر محتوى يستحق القراءة.
                </p>
                <p className="text-lg mb-6 text-neutral-700">
                  بدأنا كمبادرة شخصية، ومع الوقت انضم إلينا قراء مهتمون من مختلف التخصصات يبحثون عن محتوى مختصر وموثوق في عالم التقنية والذكاء الاصطناعي.
                </p>
                <h3 className="text-xl font-bold mb-3 font-serif">ما الذي يميزنا؟</h3>
                <ul className="space-y-2 mb-6 text-neutral-700">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>نختار المحتوى بعناية، ونشارك فقط ما نراه فعلاً يستحق</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>لا إعلانات، ولا ترويج لمنتجات أو خدمات</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>تصل النشرة عندما يكون هناك ما يستحق، لا وفق جدول ثابت</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>نكتب بلغة واضحة ومباشرة، بدون تعقيد أو تكلّف</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -left-5 -top-5 w-24 h-24 bg-purple-200/60 rounded-full"></div>
                <img 
                  src="https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1305&q=80" 
                  alt="عن نشرة سولو" 
                  className="rounded-lg shadow-lg relative z-10"
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="section bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center font-serif">تعرف على الفريق</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "د.سلطان الشهري",
                  role: "مؤسس ورئيس تحرير",
                  bio: "أكاديمي ومستشار تقني, يعمل على ربط التطورات التقنية، خصوصًا في الذكاء الاصطناعي، بالمجتمع والمهتمين بطريقة مبسطة وعملية.",
                  avatar: "/lovable-uploads/5941da9a-5ab9-4af1-a168-8ea7af540548.png"
                },
                {
                  name: "م.أحمد العظم",
                  role: "خبير تقني",
                  bio: "خبير تقني يتمتع بخبرة تتجاوز 13 عامًا في مجالات البرمجيات والتحول الرقمي، مع تركيز خاص على الذكاء الاصطناعي وأدواته الحديثة.",
                  avatar: "/lovable-uploads/cf263ba1-adf9-4592-8ef5-27d8f634093a.png"
                },
                {
                  name: "ندى حسن",
                  role: "محررة وصانعة محتوى",
                  bio: "تتمتع بخبرة في التسويق الرقمي وإدارة المحتوى عبر المنصات الاجتماعية. تسهم في إعداد النشرة بصياغة مهنية ومتابعة مستمرة لأحدث أدوات وتقنيات الذكاء الاصطناعي.",
                  avatar: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1305&q=80"
                }
              ].map((person, index) => (
                <div key={index} className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4 border-2 border-white shadow-md">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{person.name}</h3>
                  <p className="text-purple-600 mb-2">{person.role}</p>
                  <p className="text-neutral-600 max-w-sm mx-auto">{person.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default About;

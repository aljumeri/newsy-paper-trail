
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif font-bold text-2xl text-white">نشرة<span className="text-purple-400">سولو</span></span>
            </Link>
            <p className="text-neutral-400 mb-4">
              رؤى مدروسة حول الذكاء الاصطناعي والتكنولوجيا والأعمال — توصل مباشرة إلى بريدك الإلكتروني كل أسبوع.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4 text-lg">التنقل</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/archives" className="hover:text-white transition-colors">الأرشيف</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">من نحن</Link>
              </li>
              <li>
                <Link to="/subscribe" className="hover:text-white transition-colors">اشترك</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4 text-lg">قانوني</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">شروط الخدمة</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors">سياسة ملفات تعريف الارتباط</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4 text-lg">تواصل معنا</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">تويتر</a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">لينكد إن</a>
              </li>
              <li>
                <a href="mailto:hello@papertrail.com" className="hover:text-white transition-colors">راسلنا</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-8 text-sm text-neutral-500 flex flex-col md:flex-row justify-between items-center">
          <div>© {new Date().getFullYear()} نشرة سولو للذكاء الاصطناعي. جميع الحقوق محفوظة.</div>
          <div className="mt-4 md:mt-0">صُمم بعناية للعقول الفضولية.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

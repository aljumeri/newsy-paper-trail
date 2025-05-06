
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 pt-12 pb-8">
      <div className="container px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif font-bold text-2xl text-white">نشرة<span className="text-purple-400">سولو</span></span>
            </Link>
            <p className="text-neutral-400 mb-4">
              ملخصات منتقاة من أخبار وأدوات الذكاء الاصطناعي تُرسل إليك دون إزعاج، وبتوقيت يناسبك.
            </p>
          </div>
          
          <div>
            <ul className="space-y-2 mt-4">
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
                <Link to="/subscribe" className="hover:text-white transition-colors">اشترك الآن</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4 text-lg">تواصل معنا</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-2 bg-neutral-700 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 3 L3 21 M3 3 L18 21" />
                </svg>
                <span className="sr-only">تويتر</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-2 bg-neutral-700 rounded-full">
                <Facebook size={20} />
                <span className="sr-only">فيسبوك</span>
              </a>
              <a href="mailto:hello@papertrail.com" className="hover:text-white transition-colors p-2 bg-neutral-700 rounded-full">
                <Mail size={20} />
                <span className="sr-only">البريد الإلكتروني</span>
              </a>
            </div>
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

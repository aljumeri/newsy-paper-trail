
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif font-bold text-2xl text-white">Paper<span className="text-purple-400">Trail</span></span>
            </Link>
            <p className="text-neutral-400 mb-4">
              Thoughtful insights on technology, business, and culture — delivered straight to your inbox every week.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4 text-lg">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/archives" className="hover:text-white transition-colors">Archives</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
              </li>
              <li>
                <Link to="/subscribe" className="hover:text-white transition-colors">Subscribe</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4 text-lg">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4 text-lg">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
              </li>
              <li>
                <a href="mailto:hello@papertrail.com" className="hover:text-white transition-colors">Email Us</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-8 text-sm text-neutral-500 flex flex-col md:flex-row justify-between items-center">
          <div>© {new Date().getFullYear()} Paper Trail. All rights reserved.</div>
          <div className="mt-4 md:mt-0">Crafted with care for curious minds.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

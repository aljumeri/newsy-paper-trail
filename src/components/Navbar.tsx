
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png" 
            alt="نشرة سولو"
            className="h-10 mr-3"
          />
          <span className="font-bold text-xl hidden sm:inline">نشرة سولو</span>
        </Link>

        {/* Mobile menu button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">القائمة</span>
          </Button>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
          <Link to="/" className="text-neutral-700 hover:text-blue-600 transition-colors px-2 py-1">الرئيسية</Link>
          <Link to="/archives" className="text-neutral-700 hover:text-blue-600 transition-colors px-2 py-1">الأرشيف</Link>
          <Link to="/about" className="text-neutral-700 hover:text-blue-600 transition-colors px-2 py-1">من نحن</Link>
          <Button asChild>
            <Link to="/subscribe">اشترك الآن</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        {isMobile && isMenuOpen && (
          <div className="fixed inset-0 top-[72px] z-50 bg-white md:hidden">
            <nav className="flex flex-col p-4">
              <Link 
                to="/" 
                className="py-3 px-4 hover:bg-gray-100 rounded-md"
                onClick={toggleMenu}
              >
                الرئيسية
              </Link>
              <Link 
                to="/archives" 
                className="py-3 px-4 hover:bg-gray-100 rounded-md"
                onClick={toggleMenu}
              >
                الأرشيف
              </Link>
              <Link 
                to="/about" 
                className="py-3 px-4 hover:bg-gray-100 rounded-md"
                onClick={toggleMenu}
              >
                من نحن
              </Link>
              <Button 
                className="mt-4 w-full" 
                onClick={toggleMenu}
                asChild
              >
                <Link to="/subscribe">اشترك الآن</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

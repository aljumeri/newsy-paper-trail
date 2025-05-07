
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useSubscribe } from '@/hooks/useSubscribe';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
  const { email, setEmail, isLoading, handleSubscribe } = useSubscribe();

  const openSubscribeDialog = () => {
    setIsSubscribeDialogOpen(true);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <nav className="border-b border-gray-100 py-4 bg-white/95 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png" 
            alt="نشرة سولو"
            className="h-10 mr-2"
          />
          <span className="font-serif font-bold text-2xl text-purple-500">نشرة<span className="text-neutral-800">سولو</span></span>
        </Link>

        {/* زر القائمة للجوال */}
        <button 
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* قائمة سطح المكتب */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-neutral-600 hover:text-purple-500 transition-colors">الرئيسية</Link>
          <Link to="/archives" className="text-neutral-600 hover:text-purple-500 transition-colors">الأرشيف</Link>
          <Link to="/about" className="text-neutral-600 hover:text-purple-500 transition-colors">من نحن</Link>
          <Button 
            variant="default" 
            className="bg-purple-500 hover:bg-purple-600"
            onClick={openSubscribeDialog}
          >
            اشترك الآن
          </Button>
        </div>

        {/* قائمة الجوال */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-white z-50 pt-20 px-6">
            <button 
              className="absolute top-4 right-4"
              onClick={() => setIsMenuOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col gap-6 items-center">
              <Link 
                to="/" 
                className="text-neutral-800 hover:text-purple-500 text-xl font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link 
                to="/archives" 
                className="text-neutral-800 hover:text-purple-500 text-xl font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                الأرشيف
              </Link>
              <Link 
                to="/about" 
                className="text-neutral-800 hover:text-purple-500 text-xl font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                من نحن
              </Link>
              <Button 
                variant="default" 
                className="mt-4 w-full bg-purple-500 hover:bg-purple-600"
                onClick={openSubscribeDialog}
              >
                اشترك الآن
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl mb-2">اشترك في نشرتنا الإخبارية</DialogTitle>
            <DialogDescription className="text-center">
              انضم إلى مجتمعنا واستلم أحدث الأخبار والتحديثات أسبوعيًا
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubscribe} className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="rtl"
              className="py-6 text-base text-right"
              required
            />
            <Button 
              type="submit" 
              className="w-full bg-purple-500 hover:bg-purple-600 py-6 text-base"
              disabled={isLoading}
            >
              {isLoading ? "جارِ الاشتراك..." : "اشترك الآن"}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-2">
              لا رسائل مزعجة، لا مشاركة بيانات. يمكنك إلغاء الاشتراك في أي وقت.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;

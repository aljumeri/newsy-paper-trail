
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">عفوا! الصفحة غير موجودة</p>
        <p className="text-gray-500 mb-8">
          {location.pathname.includes('/admin-control') 
            ? 'قد تحتاج إلى تسجيل الدخول أولا للوصول إلى هذه الصفحة'
            : 'الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو لم تكن موجودة'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            asChild
            size="lg"
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Link to="/">العودة إلى الصفحة الرئيسية</Link>
          </Button>
          {location.pathname.includes('/admin-control') && (
            <Button 
              asChild
              variant="outline"
              size="lg"
            >
              <Link to="/admin-control">تسجيل الدخول كمسؤول</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;

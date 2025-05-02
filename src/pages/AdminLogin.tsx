
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on component mount
  useEffect(() => {
    console.log("AdminLogin: Checking for existing session");
    
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setSessionLoading(false);
          return;
        }
        
        if (data.session) {
          console.log("Session exists, redirecting to dashboard");
          // Use direct navigation for reliability
          window.location.href = '/admin/dashboard';
          return;
        }
        
        console.log("No active session found");
        setSessionLoading(false);
      } catch (error) {
        console.error("Session check failed:", error);
        setSessionLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Login successful:", data);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "جاري توجيهك إلى لوحة التحكم..."
      });
      
      // Use direct navigation for reliability
      window.location.href = '/admin/dashboard';
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "فشل تسجيل الدخول");
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "فشل تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    
    try {
      console.log("Attempting registration with email:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Registration successful", data);
      
      // Try immediate login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!loginError) {
        toast({
          title: "تم التسجيل وتسجيل الدخول بنجاح",
          description: "جاري توجيهك إلى لوحة التحكم..."
        });
        
        // Use direct navigation for reliability
        window.location.href = '/admin/dashboard';
      } else {
        toast({
          title: "تم التسجيل بنجاح",
          description: "يرجى تسجيل الدخول الآن"
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setAuthError(error.message || "فشل إنشاء الحساب");
      
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "فشل إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="text-center p-4">
            <p className="text-lg">جارٍ التحميل...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">منطقة المسؤول</CardTitle>
            <CardDescription>قم بتسجيل الدخول أو أنشئ حساب مسؤول جديد</CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">إنشاء حساب جديد</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">البريد الإلكتروني</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">كلمة المرور</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? "جارِ تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="reg-email" className="block text-sm font-medium">البريد الإلكتروني</label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="block text-sm font-medium">كلمة المرور</label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    {loading ? "جارِ إنشاء الحساب..." : "إنشاء حساب جديد"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;

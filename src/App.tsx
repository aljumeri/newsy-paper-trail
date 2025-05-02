
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Archives from "./pages/Archives";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ComposeNewsletter from "./pages/ComposeNewsletter";
import EditNewsletter from "./pages/EditNewsletter";
import SendNewsletter from "./pages/SendNewsletter";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Configure QueryClient with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      meta: {
        onError: (error: Error) => {
          console.error('Query error:', error);
        }
      }
    },
  },
});

const App = () => {
  console.log("App component rendering with routes");
  
  useEffect(() => {
    // Initial auth setup
    const setupAuth = async () => {
      try {
        // Initial session check
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Initial session check error in App:", error);
          return;
        }
        
        console.log("Initial App session check:", data.session 
          ? `Session found (expires: ${new Date(data.session.expires_at * 1000).toLocaleString()})` 
          : "No session");
      } catch (err) {
        console.error("Error during initial auth setup:", err);
      }
    };
    
    setupAuth();
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("App: Auth state changed:", event, session ? `Session present (expires: ${new Date(session.expires_at * 1000).toLocaleString()})` : "No session");
    });
    
    // Global error handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in App:', event.reason);
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/compose" element={<ComposeNewsletter />} />
            <Route path="/admin/edit/:id" element={<EditNewsletter />} />
            <Route path="/admin/send/:id" element={<SendNewsletter />} />
            <Route path="/admin/" element={<Navigate replace to="/admin" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

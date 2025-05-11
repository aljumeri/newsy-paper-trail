
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Archives from "./pages/Archives";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminControlPanel from "./pages/AdminControlPanel";
import ComposeNewsletter from "./pages/ComposeNewsletter";
import EditNewsletter from "./pages/EditNewsletter";
import NewsletterDetail from "./pages/NewsletterDetail";
import AdminControl from "./pages/AdminControl";
import ResetPassword from "./pages/ResetPassword";

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
  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname;
  const currentProtocol = window.location.protocol;
  
  console.log("=============================================");
  console.log("App component rendering with routes");
  console.log("Current domain:", currentDomain);
  console.log("Current origin:", currentOrigin);
  console.log("Current protocol:", currentProtocol);
  console.log("Current path:", currentPath);
  console.log("User agent:", navigator.userAgent);
  console.log("=============================================");

  // Check for password reset code in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetCode = urlParams.get('code');
  const tokenType = urlParams.get('type');
  
  // If there's a reset code in the URL at any path
  if (resetCode && tokenType === 'recovery') {
    console.log("Reset code detected in URL, redirecting to reset password page");
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigate to={`/admin-control/reset-password?code=${resetCode}&type=${tokenType}`} replace />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/about" element={<About />} />
            <Route path="/newsletter/:id" element={<NewsletterDetail />} />
            
            {/* Admin Routes */}
            <Route path="/admin-control" element={<AdminControl />} />
            <Route path="/admin-control/panel" element={<AdminControlPanel />} />
            <Route path="/admin-control/compose" element={<ComposeNewsletter />} />
            <Route path="/admin-control/edit/:id" element={<EditNewsletter />} />
            <Route path="/admin-control/reset-password" element={<ResetPassword />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

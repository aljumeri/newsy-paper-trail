
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Archives from "./pages/Archives";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminControl from "./pages/AdminControl";
import AdminControlPanel from "./pages/AdminControlPanel";
import ComposeNewsletter from "./pages/ComposeNewsletter";

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
            
            {/* Admin Control Routes - New working implementation */}
            <Route path="/admin-control" element={<AdminControl />} />
            <Route path="/admin-control/panel" element={<AdminControlPanel />} />
            <Route path="/admin-control/compose" element={<ComposeNewsletter />} />
            
            {/* Redirect old admin routes to new ones */}
            <Route path="/admin" element={<Navigate replace to="/admin-control" />} />
            <Route path="/admin/dashboard" element={<Navigate replace to="/admin-control/panel" />} />
            <Route path="/admin/compose" element={<Navigate replace to="/admin-control/compose" />} />
            <Route path="/admin/edit/:id" element={<Navigate replace to="/admin-control/panel" />} />
            <Route path="/admin/send/:id" element={<Navigate replace to="/admin-control/panel" />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AdminAuthProvider } from './contexts/AdminAuthContext.tsx'

// Enhanced domain and URL logging for troubleshooting
console.log("=============================================");
console.log("APPLICATION INITIALIZATION");
console.log("Current domain:", window.location.hostname);
console.log("Full URL:", window.location.href);
console.log("Protocol:", window.location.protocol);
console.log("Path:", window.location.pathname);
console.log("Origin:", window.location.origin);
console.log("=============================================");

// Global error handler for uncaught promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Log all promise rejections for debugging cross-domain issues
  console.error('Unhandled promise rejection:', event.reason);
  
  // Only prevent default for specific known errors
  if (event.reason && 
      event.reason.message && 
      (event.reason.message.includes('message channel closed') || 
       event.reason.message.includes('connection closed'))) {
    event.preventDefault();
    console.log('Handled expected promise rejection:', event.reason.message);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </React.StrictMode>,
)

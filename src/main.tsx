
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AdminAuthProvider } from './contexts/AdminAuthContext.tsx'

// Log the domain on app start
console.log("Initializing app on domain:", window.location.hostname);
console.log("Full URL:", window.location.href);

// Global error handler for uncaught promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Suppress specific known errors that are handled elsewhere
  if (event.reason && 
      event.reason.message && 
      (event.reason.message.includes('message channel closed') || 
       event.reason.message.includes('connection closed'))) {
    // Prevent default error display in console
    event.preventDefault();
    console.log('Handled expected promise rejection:', event.reason.message);
    return;
  }
  
  // Log other unhandled rejections
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </React.StrictMode>,
)

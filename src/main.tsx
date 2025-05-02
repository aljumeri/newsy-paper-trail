
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler for uncaught promise rejections related to message channel
window.addEventListener('unhandledrejection', (event) => {
  // Check if it's the specific error we're seeing in the console
  if (event.reason && 
      event.reason.message && 
      event.reason.message.includes('message channel closed')) {
    // Prevent default error display in console
    event.preventDefault();
    console.log('Handled promise rejection for message channel:', event.reason);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

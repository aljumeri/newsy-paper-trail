// Lovable deployment configuration
module.exports = {
  // Project name and settings
  project: {
    name: "newsy-paper-trail",
    description: "Newsletter application built with React and Supabase",
    version: "1.0.0",
  },
  
  // Build configuration
  build: {
    outDir: "dist",
    base: "/",
    copyPublicDir: true,
  },
  
  // Environment variables (these will be loaded from .env file)
  env: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    VITE_PUBLIC_URL: process.env.VITE_PUBLIC_URL,
  },
  
  // Lovable specific settings
  lovable: {
    // Enable the Lovable component tagger for all environments
    enableTagger: true,
    // Setup proper content security policy
    contentSecurityPolicy: {
      "default-src": ["'self'", "*.lovable.app", "*.lovable.dev"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*.lovable.app", "*.lovable.dev"],
      "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "blob:", "https:"],
      "font-src": ["'self'", "fonts.gstatic.com"],
      "connect-src": ["'self'", "*.supabase.co", "*.supabase.com"]
    },
    // Tell Lovable to include all files in the public directory
    includePublic: true,
  }
}; 
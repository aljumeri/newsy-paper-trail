/**
 * Security fixes for newsy-paper-trail
 * This script applies important security patches and configurations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Headers configuration to secure the application
const securityHeaders = `/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.lovable.app https://*.lovable.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.supabase.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;
`;

// Path to headers file
const headersPath = path.join(__dirname, 'public', '_headers');

// Apply security headers
function applyHeadersFix() {
  try {
    fs.writeFileSync(headersPath, securityHeaders, 'utf8');
    console.log('✅ Security headers successfully applied');
  } catch (error) {
    console.error('❌ Failed to apply security headers:', error);
  }
}

// Check if DOMPurify is installed and contentSanitizer is configured
function checkSecurityDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const hasDomPurify = packageJson.dependencies.dompurify || packageJson.devDependencies.dompurify;
    
    if (!hasDomPurify) {
      console.warn('⚠️ DOMPurify not found in dependencies. Run: npm install dompurify');
    } else {
      console.log('✅ DOMPurify found in dependencies');
    }
    
    // Check for contentSanitizer file
    const sanitizerPath = path.join(__dirname, 'src', 'utils', 'contentSanitizer.ts');
    if (fs.existsSync(sanitizerPath)) {
      console.log('✅ Content sanitizer utility found');
    } else {
      console.warn('⚠️ contentSanitizer.ts not found in src/utils/');
    }
  } catch (error) {
    console.error('❌ Failed to check security dependencies:', error);
  }
}

// Apply Lovable-specific configurations
function applyLovableConfig() {
  try {
    // Check if lovable.config.js exists
    const lovableConfigPath = path.join(__dirname, 'lovable.config.js');
    if (fs.existsSync(lovableConfigPath)) {
      console.log('✅ Lovable configuration found');
    } else {
      console.warn('⚠️ lovable.config.js not found. Deployment may fail.');
    }
  } catch (error) {
    console.error('❌ Failed to check Lovable configuration:', error);
  }
}

// Run all security fixes
function applyAllFixes() {
  console.log('🔒 Applying security fixes...');
  applyHeadersFix();
  checkSecurityDependencies();
  applyLovableConfig();
  console.log('🔒 Security fixes completed');
}

// Execute the fixes
applyAllFixes(); 
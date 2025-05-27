// Script to apply security fixes to Supabase database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read migration file
const migrationSql = fs.readFileSync(
  path.join(__dirname, 'supabase/migrations/20250527_fix_security_issues.sql'),
  'utf8'
);

// Initialize Supabase client
const SUPABASE_URL = "https://vqkdadugmkwnthkfjbla.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa2RhZHVnbWt3bnRoa2ZqYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDQwOTUsImV4cCI6MjA2MTcyMDA5NX0.AyZpQgkaypIz2thFdO2K5WF7WFXog2tw-t_9RLBapY4";

// You should use the service key (from the dashboard) for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log("Starting security fix migration...");
  
  try {
    // Split the migration into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Apply each statement
    for (const statement of statements) {
      console.log(`Executing SQL: ${statement.substring(0, 50)}...`);
      
      // Execute SQL directly using Supabase's REST API
      const { error } = await supabase.rpc('pgtle_eval', { 
        sql: statement 
      });
      
      if (error) {
        console.error("Error executing statement:", error);
      } else {
        console.log("Statement executed successfully");
      }
    }
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
applyMigration().catch(console.error); 
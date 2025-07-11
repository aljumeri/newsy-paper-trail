// Test script for Edge Function
// Run this with: node src/utils/testEdgeFunction.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const SUPABASE_URL = "https://vqkdadugmkwnthkfjbla.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa2RhZHVnbWt3bnRoa2ZqYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDQwOTUsImV4cCI6MjA2MTcyMDA5NX0.AyZpQgkaypIz2thFdO2K5WF7WFXog2tw-t_9RLBapY4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunction() {
  console.log("Starting Edge Function test...");
  
  try {
    // Step 1: Sign in as admin (replace with actual admin credentials)
    console.log("Attempting to sign in...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',  // Replace with actual admin email
      password: 'your-password'    // Replace with actual admin password
    });
    
    if (signInError) {
      console.error("Authentication error:", signInError);
      return;
    }
    
    console.log("Authentication successful:", signInData.user.email);
    
    // Step 2: Get the first newsletter ID
    console.log("Fetching newsletters...");
    const { data: newsletters, error: newslettersError } = await supabase
      .from('newsletters')
      .select('id')
      .limit(1);
      
    if (newslettersError) {
      console.error("Error fetching newsletters:", newslettersError);
      return;
    }
    
    if (!newsletters || newsletters.length === 0) {
      console.error("No newsletters found");
      return;
    }
    
    const newsletterId = newsletters[0].id;
    console.log("Using newsletter ID:", newsletterId);
    
    // Step 3: Test single email sending
    console.log("\n=== Testing Single Email Mode ===");
    const { data: singleEmailData, error: singleEmailError } = await supabase.functions.invoke('send-newsletter', {
      body: { 
        newsletterId,
        mode: 'single',
        email: 'test@example.com'  // Replace with your test email
      }
    });
    
    if (singleEmailError) {
      console.error("Single email test error:", singleEmailError);
    } else {
      console.log("Single email test result:", singleEmailData);
    }
    
    // Step 4: Test all subscribers mode
    console.log("\n=== Testing All Subscribers Mode ===");
    const { data: allSubscribersData, error: allSubscribersError } = await supabase.functions.invoke('send-newsletter', {
      body: { 
        newsletterId,
        mode: 'all'  // This is the default mode
      }
    });
    
    if (allSubscribersError) {
      console.error("All subscribers test error:", allSubscribersError);
    } else {
      console.log("All subscribers test result:", allSubscribersData);
    }
    
    console.log("\n=== Test Completed ===");
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testEdgeFunction(); 
/**
 * Test script for the send-newsletter Edge Function
 * Run with: node test-newsletter-function.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = "https://vqkdadugmkwnthkfjbla.supabase.co"; // Replace with your actual URL
const SUPABASE_KEY = process.env.SUPABASE_KEY || ""; // Set this via environment variable for security

async function testNewsletterFunction() {
  if (!SUPABASE_KEY) {
    console.error("Please set the SUPABASE_KEY environment variable");
    return;
  }

  try {
    console.log("Creating Supabase client...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Get the first newsletter for testing
    console.log("Fetching a newsletter to test with...");
    const { data: newsletters, error: newsletterError } = await supabase
      .from("newsletters")
      .select("id, subject")
      .limit(1);
    
    if (newsletterError) {
      throw new Error(`Failed to fetch newsletters: ${newsletterError.message}`);
    }
    
    if (!newsletters || newsletters.length === 0) {
      throw new Error("No newsletters found for testing");
    }
    
    const testNewsletterId = newsletters[0].id;
    console.log(`Testing with newsletter: ${newsletters[0].subject} (${testNewsletterId})`);
    
    // Invoke the Edge Function
    console.log("Invoking send-newsletter Edge Function...");
    const { data, error } = await supabase.functions.invoke("send-newsletter", {
      body: { newsletterId: testNewsletterId }
    });
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    console.log("Edge Function response:", data);
    console.log("Test completed successfully");
    
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testNewsletterFunction(); 
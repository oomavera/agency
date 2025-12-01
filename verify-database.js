/**
 * Supabase Database Verification Script
 * Run with: node verify-database.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdcvdiwtkdksczlfidil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkY3ZkaXd0a2Rrc2N6bGZpZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mjk2ODgsImV4cCI6MjA2ODUwNTY4OH0.1wxGIXghyuetkeXBjCWYDb0cl7RZzmcdsEtA9ywlQl4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase database setup...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('❌ Connection failed:', authError.message);
      return false;
    }
    console.log('✅ Basic connection successful\n');

    // Test 2: Check if leads table exists
    console.log('2️⃣ Checking if "leads" table exists...');
    const { error: tableError } = await supabase
      .from('leads')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.log('❌ Table check failed:', tableError.message);
      
      if (tableError.message.includes('does not exist')) {
        console.log('\n💡 SOLUTION: Run the database-setup.sql script in Supabase SQL Editor');
        console.log('   File location: ./database-setup.sql');
      }
      return false;
    }
    console.log('✅ "leads" table exists and is accessible\n');

    // Test 3: Test insert operation
    console.log('3️⃣ Testing insert operation...');
    const testLead = {
      name: 'Database Test User',
      address: '123 Test St, Oviedo, FL 32765',
      phone: '(407) 123-4567',
      email: 'test@example.com',
      service: 'standard'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('leads')
      .insert([testLead])
      .select();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      
      if (insertError.message.includes('permission denied') || 
          insertError.message.includes('RLS')) {
        console.log('\n💡 SOLUTION: Check Row Level Security policies');
        console.log('   Make sure to enable RLS and create anonymous insert policy');
      }
      return false;
    }
    console.log('✅ Insert test successful');
    console.log('   Inserted record ID:', insertData[0].id, '\n');

    // Test 4: Clean up test record
    console.log('4️⃣ Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', insertData[0].id);

    if (deleteError) {
      console.log('⚠️ Could not delete test record:', deleteError.message);
      console.log('   (This is not critical - the test record can be manually removed)');
    } else {
      console.log('✅ Test record cleaned up successfully\n');
    }

    // Success
    console.log('🎉 ALL TESTS PASSED! Your Supabase database is ready.');
    console.log('🚀 You can now submit forms on your website.');
    return true;

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the verification
verifyDatabase().then(success => {
  process.exit(success ? 0 : 1);
}); 
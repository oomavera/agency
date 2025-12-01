import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Basic connection test
    console.log('📍 Step 1: Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('leads')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Connection failed:', {
        message: connectionError.message,
        details: connectionError.details,
        hint: connectionError.hint,
        code: connectionError.code
      });
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Current leads count: ${connectionTest}`);
    
    // Test 2: Check table structure
    console.log('📍 Step 2: Testing table structure...');
    
    const { error: tableError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table structure error:', {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code
      });
      return false;
    }
    
    console.log('✅ Table structure looks good!');
    
    // Test 3: Try inserting a test record
    console.log('📍 Step 3: Testing insert operation...');
    
    const testLead = {
      name: 'Test User',
      address: '123 Test St, Oviedo, FL',
      phone: '(407) 123-4567',
      email: 'test@example.com',
      service: 'standard'
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from('leads')
      .insert([testLead])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return false;
    }
    
    console.log('✅ Insert test successful:', insertTest);
    
    // Test 4: Clean up test record
    if (insertTest && insertTest[0]) {
      console.log('📍 Step 4: Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', insertTest[0].id);
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test record:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        });
      } else {
        console.log('✅ Test record cleaned up');
      }
    }
    
    console.log('🎉 All tests passed! Supabase is ready for production.');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
    return false;
  }
}

export async function checkTableSchema() {
  try {
    console.log('🔍 Checking leads table schema...');
    console.log('📍 Supabase URL:', 'https://xdcvdiwtkdksczlfidil.supabase.co');
    
    // Test the basic connection first
    console.log('📍 Testing basic Supabase connection...');
    
    const { error } = await supabase
      .from('leads')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Schema check failed with detailed error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      if (error.message?.includes('relation "public.leads" does not exist') || 
          error.message?.includes('does not exist') ||
          error.code === 'PGRST116') {
        console.log('💡 SOLUTION: The "leads" table does not exist in your Supabase database.');
        console.log('📋 To fix this, go to your Supabase dashboard and:');
        console.log('   1. Go to Table Editor');
        console.log('   2. Click "Create a new table"');
        console.log('   3. Name it "leads"');
        console.log('   4. Add these columns:');
        console.log('      - id (uuid, primary key, auto-generated)');
        console.log('      - name (text, required)');
        console.log('      - address (text, required)');
        console.log('      - phone (text, required)');
        console.log('      - email (text, required)');
        console.log('      - service (text, required)');
        console.log('      - created_at (timestamp with time zone, auto-generated)');
        console.log('   5. Enable Row Level Security (RLS)');
        console.log('   6. Add a policy to allow INSERT for anonymous users');
      } else if (error.message?.includes('JWT') || error.message?.includes('authentication')) {
        console.log('💡 SOLUTION: Authentication issue with your API key.');
        console.log('📋 Check that your anon key is correct in the Supabase config.');
      } else {
        console.log('💡 SOLUTION: Unknown error. Check your Supabase project settings.');
      }
      return false;
    }
    
    console.log('✅ Table schema verified - "leads" table exists and is accessible');
    return true;
    
  } catch (error) {
    console.error('❌ Schema check error:', error);
    console.log('💡 This might be a network or configuration issue.');
    return false;
  }
}

export async function testBasicConnection() {
  try {
    console.log('🔍 Testing basic Supabase connectivity...');
    
    // Test the most basic operation
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Basic connection test failed:', error);
      return false;
    }
    
    console.log('✅ Basic connection to Supabase successful');
    return true;
    
  } catch (error) {
    console.error('❌ Network/connectivity error:', error);
    return false;
  }
} 
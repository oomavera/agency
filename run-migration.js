const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://xdcvdiwtkdksczlfidil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkY3ZkaXd0a2Rrc2N6bGZpZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mjk2ODgsImV4cCI6MjA2ODUwNTY4OH0.1wxGIXghyuetkeXBjCWYDb0cl7RZzmcdsEtA9ywlQl4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  console.log('🔧 Running migration to add qstash_message_id column...\n');

  try {
    // Read the migration SQL
    const sql = fs.readFileSync('supabase/migrations/add_qstash_message_id.sql', 'utf8');

    console.log('📄 Migration SQL:');
    console.log(sql);
    console.log('\n' + '='.repeat(80));

    // Note: The anon key doesn't have permission to run DDL statements
    // You'll need to run this manually in the Supabase SQL Editor
    console.log('\n⚠️  Cannot run DDL via anon key.');
    console.log('\n📝 PLEASE DO THIS MANUALLY:');
    console.log('1. Go to: https://supabase.com/dashboard/project/xdcvdiwtkdksczlfidil/sql/new');
    console.log('2. Copy and paste this SQL:');
    console.log('\n' + '─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));
    console.log('\n3. Click "Run" button');
    console.log('4. Come back here when done!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdcvdiwtkdksczlfidil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkY3ZkaXd0a2Rrc2N6bGZpZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mjk2ODgsImV4cCI6MjA2ODUwNTY4OH0.1wxGIXghyuetkeXBjCWYDb0cl7RZzmcdsEtA9ywlQl4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  console.log('🔧 Running Supabase migration...\n');

  try {
    // Execute raw SQL via RPC call (if you have a function set up)
    // Since anon key doesn't have ALTER TABLE privileges, we'll use the HTTP API directly

    const sql = `
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS qstash_message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_qstash_message_id
ON public.leads(qstash_message_id)
WHERE qstash_message_id IS NOT NULL;

COMMENT ON COLUMN public.leads.qstash_message_id IS 'QStash message ID for scheduled SMS - used to cancel message if lead is called first';
    `.trim();

    // Try using the Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('⚠️  Cannot execute DDL with anon key (expected)');
      console.log('Error:', error);

      // Try via pg_catalog query instead
      console.log('\n📝 Attempting alternative approach...');

      // Check if column exists first
      const { data: columns, error: checkError } = await supabase
        .from('leads')
        .select('*')
        .limit(1);

      if (checkError) {
        console.error('❌ Cannot query table:', checkError);
        throw checkError;
      }

      console.log('✅ Table accessed successfully');
      console.log('Current columns sample:', columns ? Object.keys(columns[0] || {}) : []);

      // Check if qstash_message_id already exists
      if (columns && columns[0] && 'qstash_message_id' in columns[0]) {
        console.log('✅ Column qstash_message_id already exists!');
        return true;
      }

      console.log('\n⚠️  Column needs to be added manually');
      console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
      console.log('🔗 https://supabase.com/dashboard/project/xdcvdiwtkdksczlfidil/sql/new\n');
      console.log('─'.repeat(80));
      console.log(sql);
      console.log('─'.repeat(80));
      return false;
    }

    console.log('✅ Migration executed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

runMigration().then(success => {
  if (success) {
    console.log('\n✅ Migration complete!');
  } else {
    console.log('\n⚠️  Manual migration needed');
  }
});

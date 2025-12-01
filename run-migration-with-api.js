// Run SQL migration using Supabase Management API
const accessToken = 'sbp_e6647fcb21f485859d6f20b4b48201e9c453c558';
const projectRef = 'xdcvdiwtkdksczlfidil';

const sql = `
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS qstash_message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_qstash_message_id
ON public.leads(qstash_message_id)
WHERE qstash_message_id IS NOT NULL;

COMMENT ON COLUMN public.leads.qstash_message_id IS 'QStash message ID for scheduled SMS - used to cancel message if lead is called first';
`;

async function runMigration() {
  console.log('🔧 Running SQL migration via Supabase Management API...\n');

  try {
    // Use the SQL endpoint of Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: sql
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Migration executed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

runMigration().then(success => {
  if (success) {
    console.log('\n🎉 Database migration complete!');
  } else {
    console.log('\n⚠️  Migration failed');
  }
});

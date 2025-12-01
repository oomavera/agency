// Test if message ID can be saved to database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdcvdiwtkdksczlfidil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkY3ZkaXd0a2Rrc2N6bGZpZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mjk2ODgsImV4cCI6MjA2ODUwNTY4OH0.1wxGIXghyuetkeXBjCWYDb0cl7RZzmcdsEtA9ywlQl4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMessageIdSave() {
  console.log('🧪 Testing message ID save to database...\n');

  try {
    // Get the most recent lead
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching leads:', fetchError);
      return;
    }

    console.log(`Found ${leads.length} recent leads:\n`);

    leads.forEach((lead, idx) => {
      console.log(`${idx + 1}. ID: ${lead.id}`);
      console.log(`   Name: ${lead.name}`);
      console.log(`   Phone: ${lead.phone}`);
      console.log(`   Page: ${lead.page}`);
      console.log(`   Created: ${new Date(lead.created_at).toLocaleString()}`);
      console.log(`   QStash Message ID: ${lead.qstash_message_id || 'NULL ❌'}`);
      console.log('');
    });

    // Check if any recent leads from offer/home/offer2 have message IDs
    const testLeads = leads.filter(l => ['home', 'offer', 'offer2'].includes(l.page));
    const leadsWithMessageId = testLeads.filter(l => l.qstash_message_id);

    console.log('='.repeat(80));
    console.log(`📊 Summary:`);
    console.log(`Total recent leads: ${leads.length}`);
    console.log(`Leads from offer/home/offer2: ${testLeads.length}`);
    console.log(`Leads WITH message ID saved: ${leadsWithMessageId.length}`);
    console.log(`Leads WITHOUT message ID: ${testLeads.length - leadsWithMessageId.length}`);
    console.log('='.repeat(80));

    if (leadsWithMessageId.length === 0 && testLeads.length > 0) {
      console.log('\n⚠️  PROBLEM FOUND:');
      console.log('Message IDs are NOT being saved to the database!');
      console.log('This is why cancellation shows "SMS Not Found"');
    } else if (leadsWithMessageId.length > 0) {
      console.log('\n✅ Message IDs ARE being saved successfully!');
      console.log('The cancel issue might be a timing problem.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMessageIdSave();

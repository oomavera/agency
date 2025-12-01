const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdcvdiwtkdksczlfidil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkY3ZkaXd0a2Rrc2N6bGZpZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mjk2ODgsImV4cCI6MjA2ODUwNTY4OH0.1wxGIXghyuetkeXBjCWYDb0cl7RZzmcdsEtA9ywlQl4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function isInSmsTimeWindow(dateStr) {
  const date = new Date(dateStr);
  const estTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hours = estTime.getHours();

  // 7:00 PM - 7:00 AM EST (19:00 - 07:00)
  return hours >= 19 || hours < 7;
}

async function checkSmsLeads() {
  try {
    console.log('📊 Querying leads table for SMS automation triggers...\n');

    // Query all leads from home, offer, or offer2 pages
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .in('page', ['home', 'offer', 'offer2'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying database:', error);
      return;
    }

    if (!leads || leads.length === 0) {
      console.log('No leads found from home, offer, or offer2 pages.');
      return;
    }

    console.log(`Found ${leads.length} total leads from home/offer/offer2 pages\n`);
    console.log('=' .repeat(80));

    // Filter leads that would have triggered SMS (within time window)
    const smsTriggeredLeads = leads.filter(lead => isInSmsTimeWindow(lead.created_at));
    const skippedLeads = leads.filter(lead => !isInSmsTimeWindow(lead.created_at));

    console.log('\n✅ LEADS THAT RECEIVED SMS (7 PM - 7 AM EST):');
    console.log('=' .repeat(80));

    if (smsTriggeredLeads.length === 0) {
      console.log('None - all leads came in outside the SMS time window.\n');
    } else {
      smsTriggeredLeads.forEach((lead, index) => {
        const date = new Date(lead.created_at);
        const estTime = date.toLocaleString('en-US', {
          timeZone: 'America/New_York',
          dateStyle: 'short',
          timeStyle: 'medium'
        });

        console.log(`\n${index + 1}. ${lead.name || 'No name'}`);
        console.log(`   Phone: ${lead.phone || 'No phone'}`);
        console.log(`   Email: ${lead.email || 'No email'}`);
        console.log(`   Page: ${lead.page}`);
        console.log(`   Submitted: ${estTime} EST`);
        console.log(`   Lead ID: ${lead.id}`);
      });
      console.log(`\nTotal SMS sent: ${smsTriggeredLeads.length}`);
    }

    console.log('\n' + '=' .repeat(80));
    console.log('\n⏰ LEADS THAT DID NOT RECEIVE SMS (7 AM - 7 PM EST):');
    console.log('=' .repeat(80));

    if (skippedLeads.length === 0) {
      console.log('None - all leads came in during SMS hours.\n');
    } else {
      skippedLeads.forEach((lead, index) => {
        const date = new Date(lead.created_at);
        const estTime = date.toLocaleString('en-US', {
          timeZone: 'America/New_York',
          dateStyle: 'short',
          timeStyle: 'medium'
        });

        console.log(`\n${index + 1}. ${lead.name || 'No name'}`);
        console.log(`   Phone: ${lead.phone || 'No phone'}`);
        console.log(`   Page: ${lead.page}`);
        console.log(`   Submitted: ${estTime} EST (outside SMS window)`);
      });
      console.log(`\nTotal skipped: ${skippedLeads.length}`);
    }

    console.log('\n' + '=' .repeat(80));
    console.log('\n📊 SUMMARY:');
    console.log('=' .repeat(80));
    console.log(`Total leads from home/offer/offer2: ${leads.length}`);
    console.log(`SMS sent (7 PM - 7 AM): ${smsTriggeredLeads.length}`);
    console.log(`SMS skipped (7 AM - 7 PM): ${skippedLeads.length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSmsLeads();

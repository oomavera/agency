// Check recent QStash messages to see what happened
const QSTASH_TOKEN = 'eyJVc2VySUQiOiI5YzljMTExZi1kOTM5LTRjODctOTQ2Ny05NDU5YzcxMzlhZDEiLCJQYXNzd29yZCI6IjFjZWZkNzdlMWQ5NTRiMTE4MDA2OWEzNmEyOWFlMTlkIn0=';

async function checkRecentMessages() {
  try {
    console.log('🔍 Checking QStash for recent messages...\n');

    const response = await fetch('https://qstash.upstash.io/v2/events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${QSTASH_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch:', response.status);
      return;
    }

    const data = await response.json();

    // Filter for recent messages (last 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const recentEvents = data.events.filter(e => e.time > tenMinutesAgo);

    console.log(`📊 Found ${recentEvents.length} events in the last 10 minutes\n`);
    console.log('='.repeat(80));

    if (recentEvents.length === 0) {
      console.log('\n❌ NO RECENT MESSAGES FOUND');
      console.log('\nThis means QStash never received the scheduling request.');
      console.log('\n🔧 LIKELY CAUSES:');
      console.log('1. ⚠️  QSTASH_TOKEN not added to Vercel environment variables');
      console.log('2. ⚠️  Code logged warning: "QSTASH_TOKEN not configured"');
      console.log('\n📝 ACTION REQUIRED:');
      console.log('Add these environment variables in Vercel dashboard:');
      console.log('   QSTASH_TOKEN');
      console.log('   QSTASH_URL');
      console.log('   QSTASH_CURRENT_SIGNING_KEY');
      console.log('   QSTASH_NEXT_SIGNING_KEY');
      console.log('\n🔗 Go to: https://vercel.com/your-project/settings/environment-variables');
      return;
    }

    // Group by message ID
    const messageGroups = {};
    recentEvents.forEach(event => {
      const msgId = event.messageId;
      if (!messageGroups[msgId]) {
        messageGroups[msgId] = [];
      }
      messageGroups[msgId].push(event);
    });

    Object.entries(messageGroups).forEach(([msgId, events], idx) => {
      console.log(`\n📨 Message ${idx + 1}: ${msgId}`);
      console.log('-'.repeat(80));

      const latestEvent = events[0]; // Most recent event for this message
      const url = latestEvent.url;
      const body = latestEvent.body ? Buffer.from(latestEvent.body, 'base64').toString() : 'N/A';

      console.log(`Target URL: ${url}`);
      console.log(`Status: ${latestEvent.state}`);
      console.log(`Body: ${body}`);

      if (latestEvent.error) {
        console.log(`❌ Error: ${latestEvent.error}`);
      }

      if (latestEvent.responseStatus) {
        console.log(`Response Status: ${latestEvent.responseStatus}`);
      }

      if (latestEvent.responseBody) {
        const respBody = Buffer.from(latestEvent.responseBody, 'base64').toString();
        console.log(`Response Body: ${respBody}`);
      }

      // Timeline
      console.log('\nTimeline:');
      events.reverse().forEach(e => {
        const time = new Date(e.time).toLocaleTimeString();
        console.log(`  ${time} - ${e.state}${e.error ? ` (${e.error})` : ''}`);
      });
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecentMessages();

// Check QStash message delivery logs
const { Client } = require('@upstash/qstash');

const QSTASH_TOKEN = 'eyJVc2VySUQiOiI5YzljMTExZi1kOTM5LTRjODctOTQ2Ny05NDU5YzcxMzlhZDEiLCJQYXNzd29yZCI6IjFjZWZkNzdlMWQ5NTRiMTE4MDA2OWEzNmEyOWFlMTlkIn0=';

async function checkQStashLogs() {
  try {
    console.log('🔍 Checking QStash message logs...\n');

    const qstash = new Client({ token: QSTASH_TOKEN });

    // Try to get events/logs
    // Note: QStash API might have limited log access on free tier
    const response = await fetch('https://qstash.upstash.io/v2/events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${QSTASH_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch logs:', response.status, await response.text());
      return;
    }

    const data = await response.json();
    console.log('📊 Recent QStash Events:\n');
    console.log(JSON.stringify(data, null, 2));

    // Parse and display in a readable format
    if (data.events && Array.isArray(data.events)) {
      console.log('\n' + '='.repeat(80));
      console.log('📨 MESSAGE DETAILS:');
      console.log('='.repeat(80));

      data.events.forEach((event, idx) => {
        console.log(`\n${idx + 1}. Message ID: ${event.messageId || 'N/A'}`);
        console.log(`   Status: ${event.state || 'N/A'}`);
        console.log(`   URL: ${event.url || 'N/A'}`);
        console.log(`   Created: ${event.createdAt ? new Date(event.createdAt).toLocaleString() : 'N/A'}`);
        console.log(`   Response Code: ${event.responseStatus || 'N/A'}`);
        console.log(`   Response Body: ${event.responseBody || 'N/A'}`);
        console.log(`   Error: ${event.error || 'None'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking logs:', error.message);
    console.log('\n💡 You can check the QStash dashboard directly at:');
    console.log('🔗 https://console.upstash.com/qstash');
    console.log('\nLook for:');
    console.log('- Message delivery status');
    console.log('- Target URL called');
    console.log('- Response codes');
    console.log('- Any error messages');
  }
}

checkQStashLogs();

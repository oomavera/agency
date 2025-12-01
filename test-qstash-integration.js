// Test QStash SMS integration
const { Client } = require('@upstash/qstash');

const QSTASH_TOKEN = 'eyJVc2VySUQiOiI5YzljMTExZi1kOTM5LTRjODctOTQ2Ny05NDU5YzcxMzlhZDEiLCJQYXNzd29yZCI6IjFjZWZkNzdlMWQ5NTRiMTE4MDA2OWEzNmEyOWFlMTlkIn0=';

async function testQStashScheduling() {
  try {
    console.log('🧪 Testing QStash Integration...\n');

    const qstash = new Client({ token: QSTASH_TOKEN });

    console.log('✅ QStash client initialized');
    console.log('📋 Token configured:', QSTASH_TOKEN.substring(0, 20) + '...');

    // Test scheduling a message (to a test endpoint)
    console.log('\n📤 Attempting to schedule a test message...');

    // We'll use a test webhook endpoint that just logs
    const testUrl = 'https://webhook.site/unique-url'; // You can replace with your actual dev URL

    const result = await qstash.publishJSON({
      url: testUrl,
      body: {
        test: true,
        name: 'Test Customer',
        phone: '+14075551234',
        timestamp: new Date().toISOString()
      },
      delay: 10, // 10 seconds for testing (not 4 minutes)
    });

    console.log('✅ Message scheduled successfully via QStash!');
    console.log('📊 QStash Response:', JSON.stringify(result, null, 2));
    console.log('\n✅ QStash integration is working correctly!');
    console.log('💡 The message will be delivered in 10 seconds to the test URL');

    return true;

  } catch (error) {
    console.error('❌ QStash test failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

async function checkQStashMessages() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📊 Checking QStash message queue...\n');

    const qstash = new Client({ token: QSTASH_TOKEN });

    // Note: QStash doesn't have a "list messages" API in the free tier
    // Messages are fire-and-forget scheduled HTTP requests
    console.log('ℹ️  QStash operates as a message queue.');
    console.log('ℹ️  Messages are scheduled and delivered automatically.');
    console.log('ℹ️  You can monitor deliveries in the QStash dashboard:');
    console.log('🔗 https://console.upstash.com/qstash');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('═'.repeat(80));
console.log('🔧 QSTASH SMS INTEGRATION TEST');
console.log('═'.repeat(80));

testQStashScheduling()
  .then(success => {
    if (success) {
      return checkQStashMessages();
    }
  })
  .then(() => {
    console.log('\n' + '═'.repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('═'.repeat(80));
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Submit a test lead on /offer page during 7 PM - 7 AM EST');
    console.log('3. Check console logs for "SMS scheduled via QStash"');
    console.log('4. Wait 4 minutes and check if SMS is sent to customer');
    console.log('5. Monitor QStash dashboard: https://console.upstash.com/qstash');
    console.log('\n⚠️  IMPORTANT: Deploy to Vercel and add env vars:');
    console.log('   QSTASH_TOKEN, QSTASH_URL, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY');
  })
  .catch(err => {
    console.error('\n❌ Test suite failed:', err);
    process.exit(1);
  });

// Test OpenPhone API to see if messages were sent

const OPENPHONE_API_KEY = 'axOAtOlqPDE0t0yMe5OhozAtPv4JyH52';

async function checkOpenPhoneMessages() {
  try {
    console.log('🔍 Checking OpenPhone for sent messages...\n');

    // Get recent messages from OpenPhone
    const response = await fetch('https://api.openphone.com/v1/messages?maxResults=50', {
      method: 'GET',
      headers: {
        'Authorization': OPENPHONE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenPhone API Error:', response.status, errorText);

      if (response.status === 401) {
        console.error('\n⚠️  API key appears to be invalid or expired');
      }
      return;
    }

    const data = await response.json();
    console.log('✅ OpenPhone API is working\n');
    console.log('Recent messages:', JSON.stringify(data, null, 2));

    // Filter for messages containing "Elias with Scaling Home Services"
    if (data.data && Array.isArray(data.data)) {
      const automatedMessages = data.data.filter(msg =>
        msg.content && msg.content.includes('Elias with Scaling Home Services')
      );

      console.log(`\n📊 Found ${automatedMessages.length} automated SMS messages sent`);

      if (automatedMessages.length > 0) {
        console.log('\n' + '='.repeat(80));
        automatedMessages.forEach((msg, idx) => {
          console.log(`\n${idx + 1}. To: ${msg.to || 'Unknown'}`);
          console.log(`   Sent: ${msg.createdAt || 'Unknown'}`);
          console.log(`   Status: ${msg.status || 'Unknown'}`);
          console.log(`   Message: ${msg.content?.substring(0, 100)}...`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testSendSMS() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 Testing SMS Send Capability...\n');

  try {
    const testMessage = 'Test message from Scaling Home Services automation test';

    const response = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': OPENPHONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PNClOdoyiK', // Your OpenPhone number ID
        to: ['+14074701780'], // Sending back to your own number as a test
        content: testMessage,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Test send failed:', response.status, errorText);
    } else {
      const data = await response.json();
      console.log('✅ Test send successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test send error:', error.message);
  }
}

// Run checks
checkOpenPhoneMessages().then(() => {
  console.log('\n' + '='.repeat(80));
  console.log('\nWould you like to send a test SMS to your own number? (Skipping for now)');
  // Uncomment to test:
  // return testSendSMS();
});

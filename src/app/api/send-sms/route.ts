import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let fullName = '';
  let phoneNumber = '';
  let firstName = 'there';

  try {
    // Get name and phone from request body if provided
    const body = await request.json().catch(() => ({}));
    fullName = body.name || '';
    phoneNumber = body.phone || '';

    // Extract first name (everything before the first space)
    firstName = fullName.trim().split(' ')[0] || 'there';
    console.log(`Full name: "${fullName}" -> First name: "${firstName}"`);
    console.log(`Customer phone: "${phoneNumber}"`);

    const apiKey = process.env.OPENPHONE_API_KEY;

    if (!apiKey) {
      console.error('OPENPHONE_API_KEY not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Validate phone number is provided
    if (!phoneNumber) {
      console.error('ERROR: No phone number provided');
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format phone number to E.164 format (+1XXXXXXXXXX)
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Validate phone number length (US numbers should be 10 or 11 digits)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      console.error(`ERROR: Invalid phone number length: ${cleanPhone.length} digits`);
      return NextResponse.json(
        { error: 'Invalid phone number - must be 10 or 11 digits', phone: phoneNumber },
        { status: 400 }
      );
    }

    const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;
    console.log(`Formatted phone: ${formattedPhone}`);

    // Build personalized message
    const message = `Hey ${firstName} this is Elias with Scaling Home Services.

I just saw your online request.

Would you prefer a Deep cleaning? Or consistent standard cleanings?`;

    console.log('Sending personalized SMS:', message);

    // OpenPhone API endpoint for sending SMS
    const response = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PNClOdoyiK', // Your OpenPhone number ID (407) 470-1780
        to: [formattedPhone], // Send to customer's phone number
        content: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenPhone API error:', response.status, errorText);
      console.error(`Failed to send to: ${formattedPhone} (${fullName})`);

      // Log specific error types
      if (response.status === 401) {
        console.error('ERROR: OpenPhone API key is invalid or expired');
      } else if (response.status === 429) {
        console.error('ERROR: Rate limit exceeded - too many SMS requests');
      } else if (response.status === 400) {
        console.error('ERROR: Invalid phone number or message format');
      }

      return NextResponse.json(
        {
          error: 'Failed to send SMS',
          details: errorText,
          phone: formattedPhone,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ SMS sent successfully to ${formattedPhone} (${fullName})`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ CRITICAL ERROR sending SMS:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    // Log what we were trying to send for debugging
    console.error('Attempted to send:', {
      name: fullName,
      phone: phoneNumber,
      firstName
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}

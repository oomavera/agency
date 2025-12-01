import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Client } from '@upstash/qstash';

async function cancelSMSForLead(leadId: string) {
  console.log(`🚫 Canceling SMS for lead ${leadId}...`);

  // Look up the lead and get the QStash message ID
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('qstash_message_id, name, phone')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    console.error('❌ Lead not found:', fetchError);
    return {
      success: false,
      error: 'Lead not found',
      status: 404
    };
  }

  if (!lead.qstash_message_id) {
    console.log('⚠️ No QStash message ID found - SMS was not scheduled or already sent');
    return {
      success: false,
      message: 'No scheduled SMS found for this lead',
      status: 200
    };
  }

  const messageId = lead.qstash_message_id;
  console.log(`📝 Found message ID: ${messageId}`);

  // Cancel the message via QStash API
  const qstashToken = process.env.QSTASH_TOKEN;
  if (!qstashToken) {
    console.error('❌ QSTASH_TOKEN not configured');
    return {
      success: false,
      error: 'QStash not configured',
      status: 500
    };
  }

  const qstash = new Client({ token: qstashToken });

  try {
    // Delete the scheduled message from QStash
    await qstash.messages.delete(messageId);

    console.log(`✅ SMS canceled successfully for ${lead.name} (${lead.phone})`);

    // Clear the message ID from the database
    await supabase
      .from('leads')
      .update({ qstash_message_id: null })
      .eq('id', leadId);

    return {
      success: true,
      message: `SMS canceled successfully for ${lead.name}`,
      leadName: lead.name,
      leadPhone: lead.phone,
      status: 200
    };

  } catch (qstashError) {
    console.error('❌ QStash cancellation error:', qstashError);

    // If message was already delivered or doesn't exist, that's okay
    const error = qstashError as { status?: number; message?: string };
    if (error.status === 404 || error.message?.includes('not found')) {
      console.log('ℹ️ Message was already sent or no longer exists');

      // Clear the message ID anyway
      await supabase
        .from('leads')
        .update({ qstash_message_id: null })
        .eq('id', leadId);

      return {
        success: false,
        message: 'SMS was already sent or no longer scheduled',
        alreadySent: true,
        status: 200
      };
    }

    throw qstashError;
  }
}

// Handle GET requests (from Telegram button clicks)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const action = searchParams.get('action');

    if (!leadId) {
      return new NextResponse(
        '<html><body><h1>❌ Error</h1><p>Lead ID is required</p></body></html>',
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    if (action !== 'cancel') {
      return new NextResponse(
        '<html><body><h1>❌ Error</h1><p>Invalid action</p></body></html>',
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    const result = await cancelSMSForLead(leadId);

    if (result.success) {
      return new NextResponse(
        `<html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; text-align: center; padding: 40px; background: #f5f5f5; }
              .card { background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #22c55e; font-size: 48px; margin: 0; }
              h2 { color: #333; margin: 20px 0 10px; }
              p { color: #666; line-height: 1.5; }
              .info { background: #f0f9ff; padding: 15px; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>✅</h1>
              <h2>SMS Canceled!</h2>
              <p>The scheduled text message has been successfully canceled.</p>
              <div class="info">
                <strong>Lead:</strong> ${result.leadName}<br>
                <strong>Phone:</strong> ${result.leadPhone}
              </div>
              <p style="margin-top: 20px; color: #999; font-size: 14px;">You can close this tab now.</p>
            </div>
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    } else {
      return new NextResponse(
        `<html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; text-align: center; padding: 40px; background: #f5f5f5; }
              .card { background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #f59e0b; font-size: 48px; margin: 0; }
              h2 { color: #333; margin: 20px 0 10px; }
              p { color: #666; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>⚠️</h1>
              <h2>SMS Not Found</h2>
              <p>${result.message || 'The SMS was not scheduled or has already been sent.'}</p>
              <p style="margin-top: 20px; color: #999; font-size: 14px;">You can close this tab now.</p>
            </div>
          </body>
        </html>`,
        {
          status: result.status,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
  } catch (error) {
    console.error('❌ Error canceling SMS:', error);
    return new NextResponse(
      `<html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; text-align: center; padding: 40px; background: #f5f5f5; }
            .card { background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; font-size: 48px; margin: 0; }
            h2 { color: #333; margin: 20px 0 10px; }
            p { color: #666; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌</h1>
            <h2>Error</h2>
            <p>An unexpected error occurred. Please try again.</p>
            <p style="margin-top: 20px; color: #999; font-size: 14px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </body>
      </html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle POST requests (from API calls)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const result = await cancelSMSForLead(leadId);

    return NextResponse.json(result, { status: result.status });

  } catch (error) {
    console.error('❌ Error canceling SMS:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

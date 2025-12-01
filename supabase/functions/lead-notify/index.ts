// Lead notification function for Telegram alerts
// Triggered by Supabase DB webhook on public.leads INSERT

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface TelegramPayload {
  chat_id: string;
  text: string;
  parse_mode?: string;
  reply_markup?: {
    inline_keyboard: Array<Array<{
      text: string;
      url?: string;
      callback_data?: string;
    }>>;
  };
}

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record?: LeadRecord;
  old_record?: LeadRecord;
}

interface LeadRecord {
  id?: string;
  full_name?: string;
  name?: string;
  phone_number?: string;
  phone?: string;
  email?: string;
  email_address?: string;
  created_at?: string;
  quote_payload?: unknown;
  page?: string;
}

// Redact PII for logging (mask phone and email)
function redactPII(text: string): string {
  return text
    .replace(/\+?1?[\d\s\-\(\)]{10,}/g, '+1***-***-****') // Phone numbers
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.com'); // Email
}

// Format lead data for Telegram message
function formatLeadMessage(record: LeadRecord): string {
  const timestamp = record.created_at || new Date().toISOString();
  // If this is a Qualify submission forwarded via /api/leads without quote_payload,
  // try to parse answers embedded in the name ("Name | QUALIFIED: key=value; key=value").
  try {
    // First path: quote_payload.answers (if your DB later adds it)
    const qp = (record as any).quote_payload as { answers?: Record<string, string> } | undefined;
    const answers = qp?.answers as Record<string,string> | undefined;
    if (answers && typeof answers === 'object') {
      const name = answers.name || record.full_name || record.name || 'Unknown';
      const owns = answers.ownsHome || 'Unknown';
      const sqft = answers.squareFootage || 'Unknown';
      const freq = answers.frequency || 'Unknown';
      const priority = answers.priority || 'Unknown';
      return `✅ *QUALIFIED LEAD*

👤 *Name:* ${name}
🏠 *Owns Home:* ${owns}
📐 *Square Footage:* ${sqft}
🔁 *Frequency:* ${freq}
⭐ *Priority:* ${priority}
📅 *Time:* ${new Date(timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
    }
    // Second path: parse from name like "John Doe | QUALIFIED name=John; ownsHome=Yes; ..."
    const rawName = record.full_name || record.name || '';
    if (rawName.includes('QUALIFIED')) {
      const parts = rawName.split('|');
      const baseName = parts[0]?.trim() || 'Unknown';
      const rest = parts.slice(1).join('|');
      const kvs = rest.split(/[:]/).slice(1).join(':');
      const pairs = kvs.split(';').map(s => s.trim()).filter(Boolean);
      const map: Record<string,string> = {};
      for (const p of pairs) {
        const [k,v] = p.split('=').map(x => (x||'').trim());
        if (k) map[k] = v || '';
      }
      const owns = map.ownsHome || 'Unknown';
      const sqft = map.squareFootage || 'Unknown';
      const freq = map.frequency || 'Unknown';
      const priority = map.priority || 'Unknown';
      return `✅ *QUALIFIED LEAD*

👤 *Name:* ${baseName}
🏠 *Owns Home:* ${owns}
📐 *Square Footage:* ${sqft}
🔁 *Frequency:* ${freq}
⭐ *Priority:* ${priority}
📅 *Time:* ${new Date(timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
    }
  } catch {}

  // Default message for standard leads
  const name = record.full_name || record.name || 'Unknown';
  const phone = record.phone_number || record.phone || 'Unknown';
  const email = record.email || record.email_address || 'Unknown';
  const page = record.page || 'Unknown';
  const leadId = record.id || 'Unknown';
  const phoneDisplay = phone !== 'Unknown' ? phone : 'Unknown';
  const dialLink = phone !== 'Unknown' ? `tel:${phone.replace(/\D/g, '')}` : '#';

  // Format page name with capitalization
  const pageTitle = page === 'home' ? 'Home' : page === 'offer' ? 'Offer' : page === 'offer2' ? 'Offer2' : page;

  // Check if this lead will receive SMS (based on page)
  const willReceiveSMS = ['home', 'offer', 'offer2'].includes(page);
  const smsNote = willReceiveSMS ? '\n📱 *SMS:* Scheduled in 60 seconds' : '';

  return `📣 *New Estimate Lead*

👤 *Name:* ${name}
📞 *Phone:* ${phoneDisplay}
📧 *Email:* ${email}
📄 *Page:* ${pageTitle}
🆔 *Lead ID:* ${leadId}
🗂 *Table:* public.leads
📅 *Time:* ${new Date(timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}${smsNote}

⏱ *Call in <60s* → ${dialLink}`;
}

// Send message to Telegram
async function sendTelegramMessage(botToken: string, chatId: string, message: string, record?: LeadRecord): Promise<Response> {
  const payload: TelegramPayload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  };

  // Add "Cancel SMS" button if this lead will receive SMS
  const page = record?.page || '';
  const leadId = record?.id || '';
  const willReceiveSMS = ['home', 'offer', 'offer2'].includes(page);

  if (willReceiveSMS && leadId) {
    // Get the production domain from environment variable
    const productionDomain = Deno.env.get('PRODUCTION_DOMAIN') || 'https://scalinghomeservices.com';

    payload.reply_markup = {
      inline_keyboard: [
        [
          {
            text: '🚫 Cancel SMS',
            url: `${productionDomain}/api/cancel-sms?leadId=${leadId}&action=cancel`
          }
        ]
      ]
    };
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response;
}

// Main handler
Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get secrets from Supabase environment
    const botToken = Deno.env.get('TG_BOT_TOKEN');
    const chatId = Deno.env.get('TG_CHAT_ID');

    if (!botToken || !chatId) {
      console.error('Missing required environment variables: TG_BOT_TOKEN or TG_CHAT_ID');
      return new Response('Configuration error', { status: 500 });
    }

    // Parse webhook payload
    const payload: SupabaseWebhookPayload = await req.json();
    
    // Validate payload structure
    if (!payload.type || !payload.table || !payload.schema) {
      console.error('Invalid webhook payload structure');
      return new Response('Invalid payload', { status: 400 });
    }

    // Only handle INSERT events on public.leads
    if (payload.type !== 'INSERT' || payload.table !== 'leads' || payload.schema !== 'public') {
      console.log(`Ignoring event: ${payload.type} on ${payload.schema}.${payload.table}`);
      return new Response('Event ignored', { status: 200 });
    }

    // Extract record (handle both 'record' and 'new' field names)
    const record = payload.record || (payload as any).new;
    
    if (!record) {
      console.error('No record found in payload');
      return new Response('No record in payload', { status: 400 });
    }

    // Log event (with PII redaction)
    const eventId = record.id || 'unknown';
    const createdAt = record.created_at || new Date().toISOString();
    console.log(`Processing lead event: id=${eventId}, created_at=${createdAt}`);

    // Format message for Telegram
    const message = formatLeadMessage(record);

    // Log the message being sent (redacted)
    console.log(`Sending Telegram message: ${redactPII(message)}`);

    // Send to Telegram (pass record for cancel button)
    const telegramResponse = await sendTelegramMessage(botToken, chatId, message, record);
    
    // Check response
    if (!telegramResponse.ok) {
      const errorBody = await telegramResponse.text();
      console.error(`Telegram API error: ${telegramResponse.status} - ${errorBody}`);
      return new Response('Telegram delivery failed', { status: 500 });
    }

    // Success - calculate and log latency
    const latency = Date.now() - startTime;
    console.log(`Lead notification sent successfully: id=${eventId}, latency=${latency}ms`);
    
    return new Response('ok', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`Lead notification error (${latency}ms):`, error);
    
    // Return generic error (no PII in response)
    return new Response('Internal server error', { status: 500 });
  }
});

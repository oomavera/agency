type TelegramResult =
  | { success: true; skipped: false }
  | { success: false; skipped: true; error: string }
  | { success: false; skipped: false; error: string };

const redact = (value: string) => value.replace(/\d(?=\d{4})/g, '•');

export async function sendTelegramLead({
  name,
  phone,
  email,
  page,
  source,
}: {
  name: string;
  phone: string;
  email?: string | null;
  page?: string;
  source?: string;
}): Promise<TelegramResult> {
  const botToken = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram integration skipped: missing TG_BOT_TOKEN or TG_CHAT_ID');
    return { success: false, skipped: true, error: 'Missing Telegram configuration' };
  }

  const lines = [
    '🆕 New Lead',
    `Name: ${name}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : null,
    page ? `Page: ${page}` : null,
    source ? `Source: ${source}` : null,
  ].filter(Boolean);

  const message = lines.join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('Telegram API error', response.status, body);
      return { success: false, skipped: false, error: `Telegram request failed with ${response.status}` };
    }

    console.log('Telegram notification sent:', redact(phone));
    return { success: true, skipped: false };
  } catch (err) {
    console.error('Telegram delivery error', err);
    return { success: false, skipped: false, error: 'Telegram delivery failed' };
  }
}

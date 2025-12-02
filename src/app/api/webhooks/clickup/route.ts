import { NextRequest, NextResponse } from 'next/server';
import { sendMetaLeadEvent } from '@/lib/meta';

const isUnqualifiedStatus = (status?: string | null, tags?: string[] | null) => {
  const s = (status || '').toLowerCase();
  const tagSet = new Set((tags || []).map(t => (t || '').toLowerCase()));
  return s === 'unqualified' || s === 'red flag' || tagSet.has('unqualified') || tagSet.has('red-flag');
};

const extractContact = (text: string) => {
  const emailMatch = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  const phoneMatch = text.match(/\+?[\d\-\.\s\(\)]{8,}/);
  const email = emailMatch ? emailMatch[0] : null;
  const phone = phoneMatch ? phoneMatch[0] : null;
  return { email, phone };
};

export async function POST(req: NextRequest) {
  try {
    const sharedSecret = process.env.CLICKUP_WEBHOOK_SECRET;
    if (sharedSecret) {
      const headerToken = req.headers.get('x-clickup-token') || req.headers.get('x-shared-secret');
      if (headerToken !== sharedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const task = body?.task;
    const status = task?.status?.status as string | undefined;
    const tags: string[] =
      Array.isArray(task?.tags) ? task.tags.map((t: { name?: string }) => t?.name || '') : [];

    if (!isUnqualifiedStatus(status, tags)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const description = (task?.text_content || task?.description || '') as string;
    const { email, phone } = extractContact(description);
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (pixelId && accessToken) {
      await sendMetaLeadEvent({
        pixelId,
        accessToken,
        eventName: 'LeadDisqualified',
        eventId: task?.id || null,
        externalId: task?.id || null,
        email,
        phone,
        eventSourceUrl: task?.url || null,
        leadSource: 'clickup-unqualified',
        qualification: 'unqualified',
        revenueRange: task?.custom_fields?.find?.((f: { name?: string }) => (f?.name || '').toLowerCase().includes('revenue'))?.value || null,
        businessType: task?.custom_fields?.find?.((f: { name?: string }) => (f?.name || '').toLowerCase().includes('business'))?.value || null,
        website: task?.custom_fields?.find?.((f: { name?: string }) => (f?.name || '').toLowerCase().includes('website'))?.value || null,
      });
    } else {
      console.warn('Meta CAPI skipped: missing pixel or token when handling ClickUp unqualified');
    }

    return NextResponse.json({ ok: true, processed: true });
  } catch (err) {
    console.error('ClickUp webhook error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

import { NextRequest, NextResponse } from 'next/server';
import { addLeadToClickUp } from '@/lib/clickup';
import { createOpenPhoneContact } from '@/lib/openphone';
import { sendMetaLeadEvent } from '@/lib/meta';
import { addLeadToGoHighLevel } from '@/lib/gohighlevel';
import { sendTelegramLead } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API received payload:', body);
    const { name, phone, email, eventId, externalId, page } = body as {
      name?: string;
      phone?: string;
      email?: string;
      eventId?: string;
      externalId?: string;
      page?: string;
      survey?: {
        businessType?: string;
        website?: string;
        revenueRange?: string;
        abandoned?: boolean;
      };
      qualification?: 'qualified' | 'unqualified';
    };
    const source = typeof body?.source === 'string' && body.source.trim() ? body.source.trim() : undefined;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name and phone' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const providedEmail = (email || '').trim();
    const survey = (body as { survey?: { businessType?: string; website?: string; revenueRange?: string; abandoned?: boolean } }).survey;

    // Optional email validation - only validate if email is provided
    if (providedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(providedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Basic phone validation (US format)
    const phoneRegex = /^[\+]?[1]?[\s\-\.\(\)]?[\d\s\-\.\(\)]{10,}$/;
    if (!phoneRegex.test(trimmedPhone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // No Supabase persistence: proceed directly to integrations
    const leadId = null;
    const integrationResults: Array<Record<string, unknown>> = [];
    const debug = request.nextUrl.searchParams.get('debug') === '1';

    const integrationTasks: Promise<void>[] = [];

    const classifyQualification = (range?: string | null): 'qualified' | 'unqualified' | null => {
      if (!range) return null;
      const digits = range.match(/\d+/g)?.map(Number) || [];
      if (!digits.length) return null;
      const min = Math.min(...digits) * 1000;
      const max = Math.max(...digits) * 1000;
      if (range.includes('75k')) return 'qualified';
      if (min >= 20000 || max >= 20000) return 'qualified';
      if (max < 20000) return 'unqualified';
      return null;
    };

    const qualification = classifyQualification(survey?.revenueRange);

    integrationTasks.push((async () => {
      const telegramResult = await sendTelegramLead({
        name: trimmedName,
        phone: trimmedPhone,
        email: providedEmail || null,
        page,
        source,
        qualification: qualification || undefined,
        survey,
      });
      if (telegramResult.skipped) {
        console.log('Telegram integration skipped:', telegramResult.error);
        if (debug) integrationResults.push({ service: 'telegram', status: 'skipped', error: telegramResult.error });
      } else if (!telegramResult.success) {
        console.error('Telegram integration failed:', telegramResult.error);
        if (debug) integrationResults.push({ service: 'telegram', status: 'failed', error: telegramResult.error });
      } else {
        console.log('Telegram notification sent');
        if (debug) integrationResults.push({ service: 'telegram', status: 'ok' });
      }
    })().catch(err => console.error('Telegram integration error:', err)));

    integrationTasks.push((async () => {
      const ghlResult = await addLeadToGoHighLevel({
        name: trimmedName,
        phone: trimmedPhone,
        email: providedEmail || null,
        page,
        source,
      });
      if (ghlResult.skipped) {
        console.log('GoHighLevel integration skipped:', ghlResult.error);
        if (debug) integrationResults.push({ service: 'gohighlevel', status: 'skipped', error: ghlResult.error });
      } else if (!ghlResult.success) {
        console.error('GoHighLevel integration failed:', ghlResult.error);
        if (debug) integrationResults.push({ service: 'gohighlevel', status: 'failed', error: ghlResult.error });
      } else {
        console.log('GoHighLevel lead pushed:', {
          contactId: ghlResult.contactId,
          opportunityId: ghlResult.opportunityId,
        });
        if (debug) integrationResults.push({ service: 'gohighlevel', status: 'ok', contactId: ghlResult.contactId, opportunityId: ghlResult.opportunityId });
      }
    })().catch(err => console.error('GoHighLevel integration error:', err)));

    integrationTasks.push((async () => {
      const clickUpResult = await addLeadToClickUp({
        name: trimmedName,
        phone: trimmedPhone,
        email: providedEmail || null,
        page,
        source,
        qualification: qualification || undefined,
        survey,
      });
      if (clickUpResult.skipped) {
        console.log('ClickUp integration skipped:', clickUpResult.error);
        if (debug) integrationResults.push({ service: 'clickup', status: 'skipped', error: clickUpResult.error });
      } else if (!clickUpResult.success) {
        console.error('ClickUp integration failed:', clickUpResult.error);
        if (debug) integrationResults.push({ service: 'clickup', status: 'failed', error: clickUpResult.error });
      } else {
        console.log('ClickUp task created:', clickUpResult.taskId);
        if (debug) integrationResults.push({ service: 'clickup', status: 'ok', taskId: clickUpResult.taskId });
      }
    })().catch(err => console.error('ClickUp integration error:', err)));

    integrationTasks.push((async () => {
      const openPhoneResult = await createOpenPhoneContact({
        name: trimmedName,
        phone: trimmedPhone,
        email: providedEmail || null,
        page,
        source,
        externalId: leadId,
      });

      if (openPhoneResult.skipped) {
        console.log('OpenPhone contact skipped:', openPhoneResult.error);
        if (debug) integrationResults.push({ service: 'openphone', status: 'skipped', error: openPhoneResult.error });
      } else if (!openPhoneResult.success) {
        console.error('OpenPhone contact creation failed:', openPhoneResult.error);
        if (debug) integrationResults.push({ service: 'openphone', status: 'failed', error: openPhoneResult.error });
      } else {
        console.log('OpenPhone contact created:', openPhoneResult.contactId);
        if (debug) integrationResults.push({ service: 'openphone', status: 'ok', contactId: openPhoneResult.contactId });
      }
    })().catch(err => console.error('OpenPhone integration error:', err)));

    integrationTasks.push((async () => {
      const metaSuppressed = body?.suppressMeta === true && !qualification;
      if (metaSuppressed) return;
        const accessToken = process.env.META_ACCESS_TOKEN as string | undefined;
        const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID as string | undefined;
        if (accessToken && pixelId) {
          const headers = request.headers;
          const clientIp = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || undefined;
        const userAgent = headers.get('user-agent') || undefined;
        const fbp = request.cookies.get('_fbp')?.value || undefined;
        let fbc = request.cookies.get('_fbc')?.value || undefined;
        const referer = headers.get('referer') || undefined;
        if (!fbc && referer) {
          try {
            const url = new URL(referer);
            const fbclid = url.searchParams.get('fbclid');
            if (fbclid) {
              const ts = Math.floor(Date.now() / 1000);
              fbc = `fb.1.${ts}.${fbclid}`;
            }
          } catch {}
        }
        await sendMetaLeadEvent({
          pixelId,
          accessToken,
          eventName: qualification === 'qualified' ? 'LeadQualified' : qualification === 'unqualified' ? 'LeadUnqualified' : 'Lead',
          eventSourceUrl: referer,
          eventId: eventId || null,
          externalId: externalId || null,
          email,
          phone,
          clientIpAddress: clientIp || null,
          clientUserAgent: userAgent || null,
          fbp: fbp || null,
          fbc: fbc || null,
          leadSource: body.source || null,
          qualification: qualification || null,
          revenueRange: survey?.revenueRange || null,
          businessType: survey?.businessType || null,
          website: survey?.website || null,
        });
      }
    })().catch(err => console.error('Meta CAPI dispatch error', err)));

    const INTEGRATION_TIMEOUT_MS = 6000;
    const integrationPromise = Promise.allSettled(integrationTasks);
    const raceResult = await Promise.race([
      integrationPromise,
      new Promise(resolve => setTimeout(resolve, INTEGRATION_TIMEOUT_MS)),
    ]);

    if (debug && raceResult !== undefined) {
      // Append any unfinished tasks info if timed out
      if (!Array.isArray(raceResult)) {
        integrationResults.push({ service: 'debug', status: 'timeout', note: `Integrations exceeded ${INTEGRATION_TIMEOUT_MS}ms` });
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Lead submitted successfully',
        leadId: leadId,
        ...(debug ? { integrationResults } : {}),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

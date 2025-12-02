import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json() as { answers?: Record<string, string> };
    if (!answers) return NextResponse.json({ error: 'Missing answers' }, { status: 400 });

    // Validate required fields and allowed values to ensure only proper submits succeed
    const safe = (s?: string) => (s || '').toString().trim();
    const name = safe(answers.name);
    const ownsHome = safe(answers.ownsHome);
    const squareFootage = safe(answers.squareFootage);
    const frequency = safe(answers.frequency);
    const priority = safe(answers.priority);

    if (!name || !ownsHome || !squareFootage || !frequency || !priority) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 });
    }

    const ownsHomeAllowed = new Set(['Yes', 'No']);
    const frequencyAllowed = new Set(['Just Once', 'Monthly', 'Bi-weekly', 'Weekly']);
    const priorityAllowed = new Set(['Reliable', 'Consistent', 'Polite', 'Fast', 'Risk-Free', 'Cheap']);
    const sqftAllowed = new Set(['0-1000', '1000-1500', '1500-2000', '2000-3000', '3000-4000', '5000-10000']);

    if (!ownsHomeAllowed.has(ownsHome)) {
      return NextResponse.json({ error: 'Invalid ownsHome value' }, { status: 400 });
    }
    if (!frequencyAllowed.has(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency value' }, { status: 400 });
    }
    if (!priorityAllowed.has(priority)) {
      return NextResponse.json({ error: 'Invalid priority value' }, { status: 400 });
    }
    if (!sqftAllowed.has(squareFootage)) {
      return NextResponse.json({ error: 'Invalid squareFootage value' }, { status: 400 });
    }

    // Compose a special name that encodes QUALIFY answers for the lead-notify function to parse
    const encodedName = `${name || 'Unknown'} | QUALIFIED: ` +
      [
        `ownsHome=${ownsHome}`,
        `squareFootage=${squareFootage}`,
        `frequency=${frequency}`,
        `priority=${priority}`,
      ].join('; ');

    // Insert a minimal lead to trigger Supabase webhook → lead-notify (Telegram)
    // Keep the payload minimal to avoid schema drift issues.
    if (supabase) {
      try {
        await supabase.from('leads').insert([{
          name: encodedName,
          phone: '+1 (000) 000-0000',
          email: `noemail+qualify-${Date.now()}@scalinghomeservices.com`,
        }]);
      } catch (dbErr) {
        console.error('QUALIFY leads insert failed', dbErr);
      }
    } else {
      console.warn('QUALIFY lead insert skipped: Supabase not configured');
    }

    // Return success (Telegram is handled asynchronously by Supabase function)
    return NextResponse.json({ success: true, pixel: { event: 'Lead' } }, { status: 200 });
  } catch (e) {
    console.error('QUALIFY API error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

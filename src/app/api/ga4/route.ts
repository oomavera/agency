import { NextRequest, NextResponse } from "next/server";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || process.env.GA4_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA4_API_SECRET;

export async function POST(req: NextRequest) {
  // Gracefully fail if server-side tracking isn't configured
  // Client-side tracking via gtag.js will still work
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    return NextResponse.json({ ok: false, error: "GA4 server-side tracking not configured" }, { status: 200 });
  }

  try {
    const json = await req.json().catch(() => ({}));
    const name: string = json?.name;
    const params: Record<string, unknown> | undefined = json?.params;
    let clientId: string | undefined = json?.clientId;
    const userId: string | undefined = json?.userId;
    const userProps: Record<string, { value: unknown }> | undefined = json?.userProps;

    // Attempt to derive clientId from _ga cookie if not provided
    if (!clientId) {
      const cookie = req.cookies.get("_ga")?.value;
      if (cookie) {
        // _ga cookie formats: GA1.2.XXXXXXXXX.YYYYYYYYY
        const parts = cookie.split(".");
        const a = parts[2];
        const b = parts[3];
        if (a && b) clientId = `${a}.${b}`;
      }
    }

    if (!name) {
      return NextResponse.json({ ok: false, error: "Missing event name" }, { status: 400 });
    }
    if (!clientId && !userId) {
      return NextResponse.json({ ok: false, error: "Missing clientId or userId" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const payload: Record<string, unknown> = {
      client_id: clientId,
      ...(userId ? { user_id: userId } : {}),
      ...(userProps ? { user_properties: userProps } : {}),
      ...(ip ? { ip_override: ip } : {}),
      events: [
        {
          name,
          params,
        },
      ],
    };

    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
        GA_MEASUREMENT_ID
      )}&api_secret=${encodeURIComponent(GA_API_SECRET)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": req.headers.get("user-agent") || "",
        },
        body: JSON.stringify(payload),
        // Make sure the request doesn't hang the route
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, status: res.status, error: text || "GA4 collect failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}



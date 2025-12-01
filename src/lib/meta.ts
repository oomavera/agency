import crypto from "crypto";

type ConversionsPayload = {
  pixelId: string;
  accessToken: string;
  eventName?: string;
  eventSourceUrl?: string | null;
  // Deduplication key shared with browser pixel (fbq)
  eventId?: string | null;
  // Stable hashed identifier used for matching (sha256 hex). Prefer same value as on pixel.
  externalId?: string | null;
  email?: string | null;
  phone?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  leadSource?: string | null;
};

function hashSha256(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  // Assume US if 10 digits
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return withCountry;
}

export async function sendMetaLeadEvent({
  pixelId,
  accessToken,
  eventName = "Lead",
  eventSourceUrl,
  eventId,
  externalId,
  email,
  phone,
  clientIpAddress,
  clientUserAgent,
  fbp,
  fbc,
  leadSource,
}: ConversionsPayload): Promise<void> {
  const endpoint = `https://graph.facebook.com/v17.0/${pixelId}/events`;

  const emHashed = email ? hashSha256(email.trim().toLowerCase()) : undefined;
  const phHashed = phone ? hashSha256(normalizePhone(phone)) : undefined;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || undefined,
        action_source: "website",
        event_source_url: eventSourceUrl || undefined,
        user_data: {
          em: emHashed ? [emHashed] : undefined,
          ph: phHashed ? [phHashed] : undefined,
          // Use provided external_id if present; otherwise fall back to a hashed identifier we have
          external_id: (externalId || emHashed || phHashed)
            ? [externalId || emHashed || (phHashed as string)]
            : undefined,
          client_ip_address: clientIpAddress || undefined,
          client_user_agent: clientUserAgent || undefined,
          fbp: fbp || undefined,
          fbc: fbc || undefined,
        },
        custom_data: leadSource ? { lead_source: leadSource } : undefined,
      },
    ],
  };

  try {
    const res = await fetch(`${endpoint}?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Meta CAPI error:", res.status, text);
    }
  } catch (err) {
    console.error("Meta CAPI network error:", err);
  }
}




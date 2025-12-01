export type GA4Event = {
  name: string;
  params?: Record<string, unknown>;
  clientId?: string;
  userId?: string;
  userProps?: Record<string, { value: unknown }>;
};

export async function track(event: GA4Event) {
  try {
    await fetch("/api/ga4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      cache: "no-store",
      keepalive: true,
    });
  } catch {}
}



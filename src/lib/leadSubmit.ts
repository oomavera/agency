type LeadPayload = Record<string, unknown>;

const sendWithBeacon = (body: string) => {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return false;
  try {
    const blob = new Blob([body], { type: 'application/json' });
    return navigator.sendBeacon('/api/leads', blob);
  } catch (err) {
    console.error('Lead beacon dispatch failed', err);
    return false;
  }
};

const sendWithFetch = (body: string) => {
  try {
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(err => console.error('Lead fetch dispatch failed', err));
  } catch (err) {
    console.error('Lead dispatch failed to start', err);
  }
};

export function dispatchLead(payload: LeadPayload) {
  const body = JSON.stringify(payload);
  const dispatched = sendWithBeacon(body);
  if (!dispatched) {
    sendWithFetch(body);
  }
}

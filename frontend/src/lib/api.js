const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

async function request(path, options = {}, token) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof body === 'string' ? body : body.error || 'Request failed';
    throw new Error(message);
  }

  return body;
}

export async function generateStory(token, prompt) {
  return request('/generate-story', { method: 'POST', body: JSON.stringify({ prompt }) }, token);
}

export async function createCheckoutSession(token) {
  return request('/create-checkout-session', { method: 'POST', body: JSON.stringify({}) }, token);
}

export async function createPortalSession(token) {
  return request('/create-portal-session', { method: 'POST', body: JSON.stringify({}) }, token);
}

export async function getSubscriptionStatus(token) {
  return request('/subscription-status', { method: 'GET' }, token);
}

export async function deleteAccountApi(token) {
  return request('/delete-account', { method: 'DELETE' }, token);
}

export async function syncStripeSuccess(token, sessionId) {
  return request(`/sync-checkout-session?session_id=${encodeURIComponent(sessionId)}`, { method: 'POST' }, token);
}

export { BACKEND_URL };

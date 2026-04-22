const API_BASE = import.meta.env.VITE_BACKEND_URL;

async function request(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export function generateStory(token, prompt) {
  return request('/generate-story', {
    method: 'POST',
    token,
    body: { prompt },
  });
}

export function createCheckoutSession(token, plan) {
  return request('/create-checkout-session', {
    method: 'POST',
    token,
    body: { plan },
  });
}

export function createPortalSession(token) {
  return request('/create-portal-session', {
    method: 'POST',
    token,
  });
}

export function getSubscriptionStatus(token) {
  return request('/subscription-status', {
    method: 'GET',
    token,
  });
}

export function syncStripeSuccess(token, sessionId) {
  return request(`/sync-checkout-session?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'POST',
    token,
  });
}

export function deleteAccountApi(token) {
  return request('/delete-account', {
    method: 'DELETE',
    token,
  });
}
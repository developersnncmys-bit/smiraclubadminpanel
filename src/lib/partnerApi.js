/**
 * The partner portal's line to the API.
 *
 * Kept apart from the staff client on purpose. A partner's token lives under
 * its own key, so a hotelier signing in on a shared office machine never
 * inherits — or overwrites — a desk member's session, and signing out of one
 * leaves the other alone. The backend refuses to let either token open the
 * other's routes; this keeps the browser from mixing them up in the first place.
 */
import { apiBase } from './api.js';

const TOKEN_KEY = 'smira-club-partner:token';

export const partnerLive = Boolean(apiBase);

export function getPartnerToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setPartnerToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked — the session lasts until the tab closes */
  }
}

export class PartnerApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  if (!apiBase) throw new PartnerApiError(0, 'The partner portal needs the Smira API');

  const token = getPartnerToken();
  let res;
  try {
    res = await fetch(`${apiBase}/partner-portal${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new PartnerApiError(0, 'Could not reach Smira just now — check your connection');
  }

  const json = await res.json().catch(() => ({}));

  // An expired or refused token: drop it so the portal sends them to sign in.
  if (res.status === 401 || (res.status === 403 && path === '/dashboard')) setPartnerToken(null);

  if (!res.ok) throw new PartnerApiError(res.status, json.message || 'That did not work');
  return json;
}

export const partnerApi = {
  requestOtp: (phone) => request('/otp/request', { method: 'POST', body: { phone } }),
  verifyOtp: (phone, code) => request('/otp/verify', { method: 'POST', body: { phone, code } }),
  dashboard: () => request('/dashboard'),
  accept: (id) => request(`/bookings/${id}/accept`, { method: 'POST' }),
  decline: (id) => request(`/bookings/${id}/decline`, { method: 'POST' }),
};

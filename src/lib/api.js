/**
 * The panel's line to the Smira API.
 *
 * Live mode only switches on when VITE_API_URL is set. Without it the panel
 * runs exactly as it always has, on seed data in localStorage — so the demo
 * never depends on a server being up.
 */

/**
 * import.meta.env only exists under Vite. The SSR smoke harness and plain node
 * scripts import this file too, so read it defensively rather than assume it.
 */
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const BASE = (ENV.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'smira-club-admin:token';

/** Whether the panel should be talking to a server at all. */
export const isLive = Boolean(BASE);

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked — the session simply lasts until the tab closes */
  }
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!BASE) throw new ApiError(0, 'No API is configured');

  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    // The token has expired or been revoked — drop it and let the app notice.
    setToken(null);
    window.dispatchEvent(new CustomEvent('smira:signed-out'));
  }

  if (!res.ok) throw new ApiError(res.status, json.message || 'That request did not work', json.details);
  return json;
}

export const api = {
  /** Lists come back paged; the panel wants the lot, so ask for a big page. */
  list: (path, query = '') => request(`${path}${query || '?limit=200'}`),
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),

  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  requestOtp: (phone) => request('/auth/otp/request', { method: 'POST', body: { phone } }),
  verifyOtp: (phone, code) => request('/auth/otp/verify', { method: 'POST', body: { phone, code } }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => null),
};

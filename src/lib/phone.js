/**
 * A number the phone can dial.
 *
 * Numbers are kept as "+91 98765 43210". Stripped to digits that is
 * 919876543210, and dialled without the + the phone read it as a twelve-
 * digit local number — the wrong one. An Indian mobile is dialled as its
 * own ten digits; anything else keeps its digits (and its +).
 */
export function dialable(value) {
  const raw = String(value || '');
  const d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return raw.trim().startsWith('+') ? `+${d}` : d;
}

/**
 * The last thirty days, from the payments the desk actually took.
 *
 * Three screens drew the same thirty days out of mockData — a hundred
 * and forty-two thousand on the second, nothing on the third — so the
 * graph told one story every morning whatever the agency had done.
 *
 * Built from the payments collection rather than a report endpoint,
 * because the screens that want it already hold the payments and want
 * more out of them than a total: how many closed, and how many people
 * were behind them.
 */

/** A date however the panel wrote it, as a day key, or null. */
function dayKey(value) {
  if (!value) return null;
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return null;
  return at.toDateString();
}

/**
 * `[{ day, revenue, closings, customers, target }]`, oldest first.
 *
 * Every day appears, including the ones nothing came in on — a gap in
 * the bars is information, and a chart that skips them makes a quiet
 * fortnight look like a busy one.
 */
export function dailyTrend(payments = [], { days = 30, monthlyTarget = 0 } = {}) {
  const perDay = monthlyTarget
    ? Math.round(monthlyTarget / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate())
    : 0;

  const buckets = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const at = new Date(today);
    at.setDate(at.getDate() - i);
    buckets.set(at.toDateString(), {
      day: at.getDate(),
      revenue: 0,
      closings: 0,
      customers: 0,
      target: perDay,
      who: new Set(),
    });
  }

  for (const p of payments) {
    const key = dayKey(p.date);
    const bucket = key && buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += Number(p.amount || 0);
    bucket.closings += 1;
    if (p.customer) bucket.who.add(p.customer);
  }

  return [...buckets.values()].map(({ who, ...rest }) => ({ ...rest, customers: who.size }));
}

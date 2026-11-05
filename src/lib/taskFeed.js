/**
 * Who a task belongs to, and what has changed on tasks — shared by the
 * Tasks page and the bell.
 *
 * The person a task is assigned to hears about notes and changes others
 * make on it; an admin or manager hears about every task's changes. What
 * has been read is remembered on this phone.
 */
const READ_KEY = 'smira.taskFeed.read';

export function seesEveryone(auth) {
  return Boolean(auth?.superAdmin) || ['team', 'branch', 'all'].includes(auth?.scope);
}

export function isMineFor(auth) {
  const me = String(auth?.name || '').toLowerCase();
  return (t) =>
    (auth?.id && String(t.ownerId) === String(auth.id)) ||
    (me && String(t.owner || '').toLowerCase() === me) ||
    (me && String(t.owner || '').toLowerCase() === me.split(' ')[0]);
}

const sameName = (a, b) => {
  const x = String(a || '').toLowerCase();
  const y = String(b || '').toLowerCase();
  return Boolean(x && y) && (x === y || x.split(' ')[0] === y.split(' ')[0]);
};

function readSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function markRead(ids) {
  try {
    const set = readSet();
    ids.forEach((id) => set.add(id));
    localStorage.setItem(READ_KEY, JSON.stringify([...set].slice(-500)));
  } catch {
    /* private window: nothing to remember */
  }
}

const ago = (at) => {
  const m = Math.round((Date.now() - new Date(at).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 24 * 60) return `${Math.round(m / 60)} hr ago`;
  return `${Math.round(m / 1440)} day(s) ago`;
};

/** The last three days of task notes and changes this person should see. */
export function taskFeed(tasks, auth) {
  const everyone = seesEveryone(auth);
  const isMine = isMineFor(auth);
  const read = readSet();
  const since = Date.now() - 3 * 24 * 3600 * 1000;
  const out = [];

  for (const t of tasks) {
    const mine = isMine(t);
    if (!mine && !everyone) continue;
    for (const c of t.comments || []) {
      const at = new Date(c.at).getTime();
      if (!at || at < since || sameName(c.by, auth?.name)) continue;
      const id = `${t.id}@${c.at}`;
      out.push({
        id,
        task: t,
        title: `${c.by || 'Someone'} · ${t.customer || t.title}`,
        body: c.text,
        when: ago(c.at),
        at,
        read: read.has(id),
      });
    }
    // A task somebody else gave me.
    const made = new Date(t.createdAt || 0).getTime();
    if (mine && made > since && t.createdBy && !sameName(t.createdBy, auth?.name)) {
      const id = `${t.id}@new`;
      out.push({ id, task: t, title: `New task from ${t.createdBy}`, body: `${t.title} · ${t.due}`, when: ago(t.createdAt), at: made, read: read.has(id) });
    }
  }
  return out.sort((a, b) => b.at - a.at).slice(0, 40);
}

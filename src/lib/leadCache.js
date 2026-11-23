/**
 * The leads, kept in this browser between visits.
 *
 * Forty thousand leads took a minute to download on every reload, and while
 * they came in nothing else (a task being saved) could get through. With a
 * copy here the list shows at once and only the leads changed since are
 * fetched. IndexedDB, because localStorage cannot hold this many.
 */
const DB = 'smira-cache';
const STORE = 'leads';

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** { rows, at } saved for this person, or null. */
export async function readLeads(key) {
  try {
    const db = await open();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result && Array.isArray(req.result.rows) ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function writeLeads(key, rows, at) {
  try {
    const db = await open();
    db.transaction(STORE, 'readwrite').objectStore(STORE).put({ rows: rows.filter((r) => r && r._id), at }, key);
  } catch {
    /* private window or storage full — it simply downloads next time */
  }
}

export async function clearLeads() {
  try {
    const db = await open();
    db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
  } catch {
    /* nothing to clear */
  }
}

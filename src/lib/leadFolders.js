import { useCallback, useEffect, useState } from 'react';
import { api, isLive } from './api.js';

/**
 * Lead folders.
 *
 * A folder is a tag on the lead — moving a lead into "Goa Oct" tags it
 * "Goa Oct", the same way an import tags its leads "Imported" — so a folder
 * with leads in it is seen by everyone with no extra record. What needs
 * keeping is a folder nobody has moved a lead into yet: its name is saved
 * as the desk setting `leadFolders`, and in this browser too, for a desk
 * user whose role cannot change settings.
 */

const KEY = 'smira:lead-folders';
const SETTING = 'leadFolders';

const clean = (list) => [...new Set((list || []).map((n) => String(n || '').trim()).filter(Boolean))];

function readLocal() {
  try {
    return clean(JSON.parse(window.localStorage.getItem(KEY)));
  } catch {
    return [];
  }
}

function writeLocal(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage blocked — the folder lasts until a lead is moved into it */
  }
}

export function useLeadFolders() {
  const [folders, setFolders] = useState(readLocal);

  useEffect(() => {
    if (!isLive) return;
    api
      .get('/settings')
      .then((r) => setFolders((mine) => clean([...(r.data?.[SETTING] || []), ...mine])))
      .catch(() => {});
  }, []);

  const addFolder = useCallback((name) => {
    const n = String(name || '').trim();
    if (!n) return;
    setFolders((list) => {
      const next = clean([...list, n]);
      writeLocal(next);
      if (isLive) api.put(`/settings/${SETTING}`, { value: next }).catch(() => {});
      return next;
    });
  }, []);

  return { folders, addFolder };
}

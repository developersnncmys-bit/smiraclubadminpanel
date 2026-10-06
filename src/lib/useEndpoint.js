import { useCallback, useEffect, useState } from 'react';
import { api, isLive, getToken } from './api.js';

/**
 * A read-only figure from the server, for the pages that are not lists.
 *
 * The store pulls whole collections and keeps them — a booking, a
 * partner, a ticket. Revenue and Report & Analytics do not want
 * collections; they want what the server has already added up, because
 * summing every payment in the browser to draw one number is work the
 * database has done faster and more accurately.
 *
 * Returns `{ data, loading, error, reload }`. Nothing is fetched when
 * the panel is not signed in to an API, and `data` stays at `fallback`
 * so a screen renders rather than throwing.
 */
export function useEndpoint(path, { fallback = null, skip = false } = {}) {
  const live = isLive && Boolean(getToken());
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(live && !skip);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!live || skip || !path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(path);
      setData(res?.data ?? res?.rows ?? fallback);
      setError(null);
    } catch (err) {
      // A role that cannot open this module is an answer, not a fault:
      // the screen shows nothing rather than numbers it invented.
      setData(fallback);
      setError(err?.status === 403 ? null : err?.message || 'Could not load that');
    } finally {
      setLoading(false);
    }
    // `fallback` is a literal at every call site; re-running on its
    // identity would refetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, live, skip]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, live };
}

/**
 * Several at once, as `{ key: data }`.
 *
 * Revenue draws five unrelated sums on one screen; asking for them one
 * hook at a time would be five renders and five spinners.
 */
export function useEndpoints(paths, fallbacks = {}) {
  const live = isLive && Boolean(getToken());
  const [data, setData] = useState(fallbacks);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState(null);

  const keys = Object.keys(paths).join('|');
  const urls = Object.values(paths).join('|');

  const load = useCallback(async () => {
    if (!live) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const names = keys.split('|').filter(Boolean);
    const list = urls.split('|').filter(Boolean);
    const results = await Promise.allSettled(list.map((p) => api.get(p)));

    const next = {};
    const failed = [];
    results.forEach((r, i) => {
      const name = names[i];
      if (r.status === 'fulfilled') next[name] = r.value?.data ?? r.value?.rows ?? fallbacks[name];
      else {
        next[name] = fallbacks[name];
        if (r.reason?.status !== 403) failed.push(name);
      }
    });

    setData(next);
    setError(failed.length ? `Could not load: ${failed.join(', ')}` : null);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, urls, live]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, live };
}

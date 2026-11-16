import { useEffect, useState } from 'react';
import { api, isLive } from './api.js';

/**
 * Attendance: the day each person checks in to, office or field.
 *
 * The desk's day is read once and shared by every screen that shows it; a
 * check-in or check-out anywhere fires `smira:attendance` so they all read
 * it again.
 */

const EVENT = 'smira:attendance';
export const attendanceChanged = () => window.dispatchEvent(new CustomEvent(EVENT));

/** Where the phone is, or null if it will not say. Never takes more than ~15s. */
export function whereAmI() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy) }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export const mapLink = (s) => (s?.lat != null && s?.lng != null ? `https://www.google.com/maps?q=${s.lat},${s.lng}` : null);

export const timeOf = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';

const hm = (mins) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;

/** Minutes spent on breaks (Lunch, Tea, Washroom); an open one counts until now. */
export function breakMinutes(row) {
  return Math.round((row?.breaks || []).reduce((t, b) => {
    const end = b.end ? new Date(b.end) : new Date();
    return t + Math.max(0, end - new Date(b.start));
  }, 0) / 60000);
}

/** The break going on right now, if any. */
export const openBreak = (row) => (row?.breaks || []).find((b) => !b.end) || null;

export const breakText = (row) => {
  const m = breakMinutes(row);
  return m ? `${m < 60 ? `${m}m` : hm(m)} break` : '';
};

/** "7h 25m" between check-in and check-out (or now), less the breaks. */
export function hoursWorked(row) {
  if (!row?.checkIn?.at) return '';
  const end = row.checkOut?.at ? new Date(row.checkOut.at) : new Date();
  const mins = Math.max(0, Math.round((end - new Date(row.checkIn.at)) / 60000) - breakMinutes(row));
  return hm(mins);
}

/** Everybody's attendance today, keyed by user id. */
export function useAttendanceDay() {
  const [byUser, setByUser] = useState({});
  useEffect(() => {
    if (!isLive) return undefined;
    const load = () =>
      api
        .get('/attendance')
        .then((r) => setByUser(Object.fromEntries((r.rows || []).map((row) => [String(row.user), row]))))
        .catch(() => {});
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, []);
  return byUser;
}

/** My own day, and the one way of working I am set to (null = any). */
export function useMyAttendance() {
  const [row, setRow] = useState(null);
  const [workMode, setWorkMode] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!isLive) return undefined;
    const load = () =>
      api
        .get('/attendance/me')
        .then((r) => {
          setRow(r.data || null);
          setWorkMode(r.workMode || null);
        })
        .catch(() => {})
        .finally(() => setReady(true));
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, []);
  return { row, workMode, ready };
}

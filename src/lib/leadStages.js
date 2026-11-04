import { useSyncExternalStore } from 'react';
import { api, isLive } from './api.js';
import { enquiryStatuses, statusTone } from '../data/mockData.js';

/**
 * Lead stages.
 *
 * The desk can add, rename and reorder stages from Move status → Customize.
 * The list lives on the server (GET/PUT /leads/stages) and is shared by
 * every page here, so a stage added once shows up in the filters, the
 * board and every Move status menu at the same moment. New, Won and Lost are
 * fixed: a lead starts at New and the reports count Won and Lost.
 */

export const FIXED_STAGES = ['New', 'Won', 'Lost'];

// Colours handed to stages the desk adds, in turn.
const EXTRA_TONES = ['teal', 'violet', 'amber', 'sky', 'slate'];

let stages = enquiryStatuses;
let fetched = false;
const listeners = new Set();

function set(next) {
  stages = next;
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  if (!fetched && isLive) {
    fetched = true;
    api
      .get('/leads/stages')
      .then((r) => Array.isArray(r.data) && r.data.length && set(r.data))
      .catch(() => {
        fetched = false;
      });
  }
  return () => listeners.delete(listener);
}

/** The stage list, kept up to date. */
export function useLeadStages() {
  return useSyncExternalStore(subscribe, () => stages);
}

/** The badge colour for a stage, including one the desk added. */
export function stageTone(stage) {
  if (statusTone[stage]) return statusTone[stage];
  const i = Math.max(0, stages.indexOf(stage));
  return EXTRA_TONES[i % EXTRA_TONES.length];
}

/**
 * Save a new list. `renames` is [{ from, to }] for stages whose name
 * changed, so the leads in them move along. Resolves with how many leads
 * were moved.
 */
export async function saveLeadStages(list, renames = []) {
  const r = await api.put('/leads/stages', { stages: list, renames });
  set(r.data);
  return r.moved || 0;
}

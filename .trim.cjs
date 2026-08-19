const fs = require('fs');

/** Split an array literal body into its top-level elements. */
function elements(body) {
  const out = [];
  let depth = 0, start = 0, str = null;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (str) {
      if (c === '\') i++;
      else if (c === str) str = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { str = c; continue; }
    if ('[{('.includes(c)) depth++;
    else if (']})'.includes(c)) depth--;
    else if (c === ',' && depth === 0) {
      out.push(body.slice(start, i));
      start = i + 1;
    }
  }
  const tail = body.slice(start);
  if (tail.trim()) out.push(tail);
  return out;
}

function trim(file, name, keep) {
  let s = fs.readFileSync(file, 'utf8');
  const head = `export const ${name} = [`;
  const at = s.indexOf(head);
  if (at < 0) throw new Error(`${name} not found in ${file}`);
  let i = at + head.length, depth = 1, str = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (str) { if (c === '\') i++; else if (c === str) str = null; continue; }
    if (c === "'" || c === '"' || c === '`') { str = c; continue; }
    if ('[{('.includes(c)) depth++;
    else if (']})'.includes(c)) { depth--; if (depth === 0) break; }
  }
  const body = s.slice(at + head.length, i);
  const parts = elements(body);
  const kept = typeof keep === 'function' ? keep(parts) : parts.slice(0, keep);
  const rebuilt = head + kept.map((p) => p.replace(/^\n?/, '\n  ').trimEnd()).join(',') + ',\n';
  fs.writeFileSync(file, s.slice(0, at) + rebuilt + s.slice(i));
  console.log(`${name}: ${parts.length} -> ${kept.length}`);
}

const M = 'src/data/mockData.js';
const X = 'src/data/modulesData.js';

for (const n of ['enquiries','packages','bookings','customers','tasks','quotations','memberSignups','invoices','payments','suppliers','campaigns','team','activityFeed']) trim(M, n, 2);
for (const n of ['partners','lifestyle','automations','notificationRules','offers','roles','referrals','forms','blogs','banners','seoPages','apiKeys','activities']) trim(X, n, 2);

// Travel Inventory has to keep all four kinds of stock, so two of each.
trim(X, 'inventory', (parts) => {
  const seen = {};
  return parts.filter((p) => {
    const m = p.match(/type: '([^']+)'/);
    const k = m ? m[1] : 'other';
    seen[k] = (seen[k] || 0) + 1;
    return seen[k] <= 2;
  });
});

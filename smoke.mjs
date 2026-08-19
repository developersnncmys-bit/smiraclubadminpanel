/**
 * Renders every page through react-dom/server to catch runtime errors the
 * bundler cannot see — a missing icon import, a stale identifier, a bad
 * destructure. Run with: node smoke.mjs
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

// Planned modules are read straight from the registry, so a new one is
// covered here the moment it is added.
const PLANNED = [
  ...readFileSync('./src/data/modules.js', 'utf8').matchAll(/to: '(\/[a-z]+)'/g),
].map((m) => m[1]);

const ROUTES = [
  '/', '/enquiries', '/quotations', '/bookings', '/packages', '/memberships',
  '/suppliers', '/invoices', '/payments', '/customers', '/team', '/campaigns',
  '/reports', '/settings', '/tasks', '/login',
  ...PLANNED,
];

// A string that only appears once the real page rendered, so a silent
// redirect to /login cannot pass as success.
const MARKERS = {
  '/': 'Business reports',
  '/enquiries': 'Add enquiry',
  '/quotations': 'New quotation',
  '/bookings': 'Bookings',
  '/packages': 'Create package',
  '/memberships': 'Membership plans',
  '/suppliers': 'Suppliers',
  '/invoices': 'Invoices',
  '/payments': 'Payments',
  '/customers': 'Add customer',
  '/team': 'Heavy workload',
  '/campaigns': 'Campaigns',
  '/reports': 'Lead analytics',
  '/settings': 'Settings',
  '/tasks': 'Tasks',
  '/partners': 'The vendors you buy from',
  '/inventory': 'Everything the agency sells',
  '/lifestyle': 'Add-ons sold alongside a trip',
  '/automation': 'Automation rules',
  '/notifications': 'What the panel tells the team',
  '/offers': 'Discount codes and seasonal offers',
  '/roles': 'Who can see and do what',
  '/rewards': 'Travellers who bring their friends',
  '/forms': 'where each response lands',
  '/blogs': 'Travel writing',
  '/banners': 'Home page and campaign artwork',
  '/seo': 'How each page of the website reads',
  '/api': 'Keys the website and other systems use',
  '/profile': 'Your own account details',
  '/cms': 'Not built yet',
  '/ai': 'Not built yet',
  '/alerts': 'Not built yet',
  '/communication': 'Not built yet',
  '/support': 'Not built yet',
};

const entry = `
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from './src/store/AppStore.jsx';
import App from './src/App.jsx';

const markers = ${JSON.stringify(MARKERS)};
let failed = 0;

for (const [route, marker] of Object.entries(markers)) {
  try {
    const html = renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: [route] },
        React.createElement(AppProvider, null, React.createElement(App))
      )
    );
    if (!html.includes(marker)) {
      failed++;
      console.log('  EMPTY ' + route + '  ->  rendered without "' + marker + '"');
    } else {
      console.log('  ok    ' + route);
    }
  } catch (err) {
    failed++;
    console.log('  FAIL  ' + route + '  ->  ' + err.message);
  }
}
// Signed out, the panel must hand you the login screen.
localStorage.removeItem('smira-club-admin:auth');
try {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/login'] },
      React.createElement(AppProvider, null, React.createElement(App))
    )
  );
  if (html.includes('Sign in to your panel')) console.log('  ok    /login');
  else { failed++; console.log('  EMPTY /login'); }
} catch (err) {
  failed++;
  console.log('  FAIL  /login  ->  ' + err.message);
}

console.log(failed ? '\\n' + failed + ' route(s) failed' : '\\nall routes rendered their content');
globalThis.__smokeFailed = failed;
`;

writeFileSync('.smoke-entry.jsx', entry);

await build({
  entryPoints: ['.smoke-entry.jsx'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: '.smoke-bundle.mjs',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  jsx: 'automatic',
  logLevel: 'error',
  external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom', 'recharts', 'lucide-react', 'jspdf'],
});

// The store and the live clock both reach for browser globals. Seed a signed-in
// session so RequireAuth lets the real pages render instead of redirecting.
globalThis.localStorage = {
  _d: {
    'smira-club-admin:auth': JSON.stringify({
      phone: '9820011223',
      name: 'Dushyant Kale',
      role: 'Owner',
      initials: 'DK',
    }),
  },
  getItem(k) { return this._d[k] ?? null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; },
};
globalThis.document = { addEventListener() {}, removeEventListener() {}, body: { style: {} } };

try {
  await import('./.smoke-bundle.mjs');
} finally {
  // Clean up even when a route throws, so the temp files never reach git.
  unlinkSync('.smoke-entry.jsx');
  unlinkSync('.smoke-bundle.mjs');
}

process.exit(globalThis.__smokeFailed ? 1 : 0);

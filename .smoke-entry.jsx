
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from './src/store/AppStore.jsx';
import App from './src/App.jsx';

const markers = {"/":"What needs your attention","/enquiries":"Add enquiry","/quotations":"New quotation","/bookings":"Bookings","/packages":"Create package","/memberships":"Membership plans","/suppliers":"Suppliers","/invoices":"Invoices","/payments":"Payments","/customers":"Add customer","/team":"Invite member","/campaigns":"Campaigns","/reports":"Reports","/settings":"Settings","/tasks":"Tasks"};
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

console.log(failed ? '\n' + failed + ' route(s) failed' : '\nall routes rendered their content');
process.exit(failed ? 1 : 0);

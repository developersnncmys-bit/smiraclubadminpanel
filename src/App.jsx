import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Team from './pages/Team.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Bookings from './pages/Bookings.jsx';
import Customers from './pages/Customers.jsx';
import Memberships from './pages/Memberships.jsx';
import Partners from './pages/Partners.jsx';
import Reports from './pages/Reports.jsx';
import Revenue from './pages/Revenue.jsx';
import Inventory from './pages/Inventory.jsx';
import Whatsapp from './pages/Whatsapp.jsx';
import Payment from './pages/Payment.jsx';
import Automation from './pages/Automation.jsx';
import Rewards from './pages/Rewards.jsx';
import Offers from './pages/Offers.jsx';
import Blog from './pages/Blog.jsx';
import Support from './pages/Support.jsx';
import Users from './pages/Users.jsx';

/** Where partners sign in and register now: their own site, not the staff panel. */
const PARTNER_SITE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PARTNER_URL) || 'https://partner.smiraclub.com';

/** An old /partner link, sent on to the partner site. */
function ToPartnerSite({ path = '' }) {
  if (typeof window !== 'undefined') window.location.replace(`${PARTNER_SITE}${path}`);
  return null;
}

/**
 * The panel holds the sections the client has specified — Team Status,
 * Sales & Leads, Booking, Members, Partners, Report & Analytics and
 * Revenue, Support / Complaints. Anything else is added as its sheet arrives.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* The partner sign-in, registration and dashboard moved to
          partner.smiraclub.com; links already sent out land there. */}
      <Route path="/partner/login" element={<ToPartnerSite path="/login" />} />
      <Route path="/partner/*" element={<ToPartnerSite />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="team" element={<Team />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="customers" element={<Customers />} />
        <Route path="memberships" element={<Memberships />} />
        <Route path="partners" element={<Partners />} />
        <Route path="reports" element={<Reports />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="whatsapp" element={<Whatsapp />} />
        <Route path="payment" element={<Payment />} />
        <Route path="automation" element={<Automation />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="offers" element={<Offers />} />
        <Route path="blog" element={<Blog />} />
        <Route path="support" element={<Support />} />
        <Route path="users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

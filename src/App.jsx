import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Login from './pages/Login.jsx';
import Team from './pages/Team.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Bookings from './pages/Bookings.jsx';
import Customers from './pages/Customers.jsx';
import Memberships from './pages/Memberships.jsx';
import Partners from './pages/Partners.jsx';
import Reports from './pages/Reports.jsx';
import Support from './pages/Support.jsx';

/**
 * The panel holds the sections the client has specified — Team Status,
 * Sales & Leads, Booking, Members, Partners, Report & Analytics and
 * Support / Complaints. Anything else is added as its sheet arrives.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/team" replace />} />
        <Route path="team" element={<Team />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="customers" element={<Customers />} />
        <Route path="memberships" element={<Memberships />} />
        <Route path="partners" element={<Partners />} />
        <Route path="reports" element={<Reports />} />
        <Route path="support" element={<Support />} />
      </Route>

      <Route path="*" element={<Navigate to="/team" replace />} />
    </Routes>
  );
}

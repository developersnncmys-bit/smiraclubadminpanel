import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Bookings from './pages/Bookings.jsx';
import Packages from './pages/Packages.jsx';
import Memberships from './pages/Memberships.jsx';
import Customers from './pages/Customers.jsx';
import Tasks from './pages/Tasks.jsx';
import Quotations from './pages/Quotations.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Campaigns from './pages/Campaigns.jsx';
import Team from './pages/Team.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

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
        <Route index element={<Dashboard />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="packages" element={<Packages />} />
        <Route path="memberships" element={<Memberships />} />
        <Route path="customers" element={<Customers />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="team" element={<Team />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

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
import Partners from './pages/Partners.jsx';
import Inventory from './pages/Inventory.jsx';
import Lifestyle from './pages/Lifestyle.jsx';
import Automation from './pages/Automation.jsx';
import NotificationsPage from './pages/Notifications.jsx';
import Offers from './pages/Offers.jsx';
import Roles from './pages/Roles.jsx';
import Rewards from './pages/Rewards.jsx';
import Forms from './pages/Forms.jsx';
import Blogs from './pages/Blogs.jsx';
import Banners from './pages/Banners.jsx';
import Seo from './pages/Seo.jsx';
import ApiKeys from './pages/ApiKeys.jsx';
import Profile from './pages/Profile.jsx';
import Planned from './pages/Planned.jsx';
import { plannedModules } from './data/modules.js';

// Modules that now have a real page, so they skip the placeholder.
const BUILT = [
  '/partners', '/inventory', '/lifestyle', '/automation', '/notifications',
  '/offers', '/roles', '/rewards', '/forms', '/blogs', '/banners', '/seo',
  '/api', '/profile',
];

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
        {/* Modules built out from the client's product map */}
        <Route path="partners" element={<Partners />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="lifestyle" element={<Lifestyle />} />
        <Route path="automation" element={<Automation />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="offers" element={<Offers />} />
        <Route path="roles" element={<Roles />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="forms" element={<Forms />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="banners" element={<Banners />} />
        <Route path="seo" element={<Seo />} />
        <Route path="api" element={<ApiKeys />} />
        <Route path="profile" element={<Profile />} />

        {/* Still to build — these fall through to the placeholder */}
        {plannedModules
          .filter((m) => !BUILT.includes(m.to))
          .map((m) => (
            <Route key={m.to} path={m.to.slice(1)} element={<Planned />} />
          ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

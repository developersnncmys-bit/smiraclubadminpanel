import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Phone, Mail, ShieldCheck, Building2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import CheckIn from '../components/layout/CheckIn.jsx';
import AttendanceCalendar from '../components/team/AttendanceCalendar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { isLive } from '../lib/api.js';
import { navFor } from '../data/nav.js';

/**
 * My account, from the phone's bottom bar: who is signed in, today's
 * check-in, every page this role opens (the phone has no side menu), my
 * attendance month, and Sign out.
 */
export default function Account() {
  const { auth, signOut } = useApp();
  const navigate = useNavigate();
  const pages = navFor(auth).flatMap((g) => g.items);

  const rows = [
    [Phone, 'Mobile', auth?.phone],
    [Mail, 'Email', auth?.email],
    [ShieldCheck, 'Role', auth?.role],
    [Building2, 'Branch', auth?.branch],
  ].filter(([, , v]) => v);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="My account" />

      <section className="card p-5 text-center">
        <Avatar name={auth?.name || 'You'} size="lg" className="mx-auto" />
        <p className="mt-3 font-display text-lg font-extrabold text-ink-900">{auth?.name || 'Signed in'}</p>
        <p className="text-sm text-ink-500">{auth?.role}</p>
        <div className="mt-4 flex justify-center">
          <CheckIn />
        </div>
      </section>

      {rows.length > 0 && (
        <section className="card mt-4 divide-y divide-ink-900/[0.06] overflow-hidden">
          {rows.map(([Icon, label, value]) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Icon size={17} className="text-ink-400" />
              <span className="w-20 text-xs font-bold uppercase text-ink-400">{label}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-800">{value}</span>
            </div>
          ))}
        </section>
      )}

      {/* Every page this person may open — on a phone this is the menu. */}
      <section className="card mt-4 p-4">
        <p className="eyebrow mb-3">All pages</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {pages.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-center text-xs font-semibold transition ${
                  isActive ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-ink-900/10 bg-white text-ink-700 hover:border-brand-300'
                }`
              }
            >
              <Icon size={20} className="text-brand-600" />
              <span className="leading-tight">{label}</span>
            </NavLink>
          ))}
        </div>
      </section>

      {isLive && (
        <section className="card mt-4 p-4">
          <p className="eyebrow mb-2">My attendance</p>
          <AttendanceCalendar />
        </section>
      )}

      <button
        type="button"
        className="btn-line-danger mt-4 w-full justify-center py-3"
        onClick={() => {
          signOut();
          navigate('/login', { replace: true });
        }}
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}

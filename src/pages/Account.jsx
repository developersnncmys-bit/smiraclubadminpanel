import { useNavigate } from 'react-router-dom';
import { LogOut, Phone, Mail, ShieldCheck, Building2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import CheckIn from '../components/layout/CheckIn.jsx';
import AttendanceCalendar from '../components/team/AttendanceCalendar.jsx';
import { useApp } from '../store/AppStore.jsx';
import { isLive } from '../lib/api.js';

/**
 * My account, from the phone's bottom bar: who is signed in, today's
 * check-in, my attendance month, and Sign out.
 */
export default function Account() {
  const { auth, signOut } = useApp();
  const navigate = useNavigate();

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

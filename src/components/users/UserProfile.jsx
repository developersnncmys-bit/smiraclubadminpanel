import { useState } from 'react';
import {
  X, Phone, MessageCircle, Mail, ShieldCheck, KeyRound, UserX, Crown,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import Stat from '../ui/Stat.jsx';
import Field from '../ui/Field.jsx';
import DrawerTabs from '../ui/DrawerTabs.jsx';
import RecordTrail from '../ui/RecordTrail.jsx';
import { inr, shortInr } from '../../data/mockData.js';
import { liveStates, permissionModules, permissionLevels } from '../../data/usersData.js';

const digits = (phone) => String(phone || '').replace(/[^\d]/g, '');

/**
 * One employee, the six ways the sheet asks management to read them: their
 * profile, their sales, their bookings, their customers, their performance
 * and everything they have done.
 */
export default function UserProfile({ user, role, work, log = [], onClose, onAct }) {
  const [tab, setTab] = useState('Profile');

  if (!user) return null;

  const u = user;
  const a = u.account || {};
  const phone = digits(u.phone);
  const state = liveStates.find((s) => s.key === u.live);

  const tabs = ['Profile', 'Sales', 'Bookings', 'Customers', 'Performance', 'Activity'];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[1020px] flex-col bg-surface-base shadow-lift">
        <header className="flex flex-wrap items-center gap-2.5 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">{u.name}</h2>
          <Badge tone={u.status === 'Active' ? 'green' : 'slate'} dot>{u.status}</Badge>
          <span className="flex items-center gap-1.5 text-sm text-ink-500">
            <span className={`h-2 w-2 rounded-full ${state?.dot || 'bg-ink-300'}`} />
            {u.live || 'Offline'}
          </span>
          <button onClick={onClose} className="icon-btn ml-auto h-8 w-8">
            <X size={15} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          {/* Who they are */}
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-5 text-center">
              <Avatar name={u.name} size="lg" className="mx-auto" />
              <p className="mt-3 font-display text-lg font-extrabold text-ink-900">{u.name}</p>
              <p className="num text-sm text-ink-500">{u.empId}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Badge tone="teal"><Crown size={11} /> {u.roleName}</Badge>
                <Badge tone="slate">{a.employment || 'Permanent'}</Badge>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <a href={`tel:${phone}`} className="icon-btn h-9 w-9" title="Call">
                  <Phone size={15} />
                </a>
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn h-9 w-9 hover:border-emerald-400 hover:text-emerald-600"
                  title="WhatsApp"
                >
                  <MessageCircle size={15} />
                </a>
                <a href={`mailto:${u.email}`} className="icon-btn h-9 w-9" title="Email">
                  <Mail size={15} />
                </a>
                <button onClick={() => onAct('Reset password')} className="icon-btn h-9 w-9" title="Reset password">
                  <KeyRound size={15} />
                </button>
                <button onClick={() => onAct('Disable account')} className="icon-btn-danger h-9 w-9" title="Disable account">
                  <UserX size={15} />
                </button>
              </div>
            </div>

            <Field label="Mobile">{u.phone}</Field>
            <Field label="Email">{u.email}</Field>
            <Field label="Department">{u.department}</Field>
            <Field label="Designation">{a.designation || u.role}</Field>
            <Field label="Branch">{u.branch}</Field>
            <Field label="Reports to">{u.manager}</Field>
            <Field label="Joined">{a.joined || '—'}</Field>
            <Field label="Attendance">{u.attendance || 'Not marked'}</Field>
          </section>

          <div className="space-y-5">
            <section className="card overflow-hidden">
              <DrawerTabs items={tabs} value={tab} onChange={setTab} />

              <div className="p-5">
                {tab === 'Profile' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Stat label="Role" value={u.roleName} />
                      <Stat label="Data access" value={role?.scope || '—'} />
                      <Stat label="Can approve" value={(role?.approvals || []).length || 'nothing'} />
                    </div>

                    <p className="eyebrow mt-5">Personal</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <Stat label="Aadhaar" value={a.aadhaar || '—'} />
                      <Stat label="Family members" value={(a.family || []).length} hint={(a.family || []).join(', ') || 'none recorded'} />
                    </div>

                    <p className="eyebrow mt-5">What they have been given to work</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <Stat label="Territory" value={a.territory || '—'} />
                      <Stat label="Customer segment" value={a.segment || '—'} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[...(a.leadSources || []), ...(a.products || []), ...(a.categories || [])].map((x) => (
                        <span key={x} className="chip text-ink-500">{x}</span>
                      ))}
                    </div>

                    <p className="eyebrow mt-5">What the role opens</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {permissionModules.map((m) => (
                        <span
                          key={m}
                          className={`chip ${
                            (role?.modules || []).includes(m)
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'text-ink-400'
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {permissionLevels.map((p) => (
                        <span
                          key={p}
                          className={`chip ${(role?.can || []).includes(p) ? 'text-ink-700' : 'text-ink-300'}`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {tab === 'Sales' && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Leads" value={work.leads} />
                    <Stat label="Calls" value={u.calls ?? 0} />
                    <Stat label="Presentations" value={u.presentations ?? 0} />
                    <Stat label="Visits" value={u.visits ?? 0} />
                    <Stat label="Sales" value={work.won} tone="text-emerald-600" />
                    <Stat label="Revenue" value={work.revenue ? inr(work.revenue) : '—'} tone="text-brand-700" />
                    <Stat label="Conversion" value={`${work.conversion}%`} />
                    <Stat label="Memberships sold" value={work.memberships} />
                    <Stat label="Follow-ups" value={u.followUps ?? 0} />
                  </div>
                )}

                {tab === 'Bookings' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Stat label="Bookings handled" value={work.bookings} />
                    <Stat label="Booking value" value={work.bookingValue ? inr(work.bookingValue) : '—'} tone="text-brand-700" />
                    <Stat label="Cancellations" value={work.cancellations} tone={work.cancellations ? 'text-rose-600' : undefined} />
                    <Stat label="Reschedules" value={u.reschedules ?? 0} />
                  </div>
                )}

                {tab === 'Customers' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Stat label="Customers handled" value={work.memberships + work.bookings} />
                    <Stat label="Active members" value={work.memberships} tone="text-emerald-600" />
                    <Stat label="Complaints" value={u.complaints ?? 0} />
                    <Stat label="Repeat bookings" value={u.repeatBookings ?? 0} />
                  </div>
                )}

                {tab === 'Performance' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Stat label="Target" value={work.target ? shortInr(work.target) : '—'} />
                      <Stat
                        label="Achievement"
                        value={work.target ? `${work.achievement}%` : '—'}
                        tone={work.achievement >= 100 ? 'text-emerald-600' : 'text-ink-900'}
                      />
                      <Stat label="Productivity" value={`${u.productivity ?? 0}%`} />
                      <Stat
                        label="Incentive"
                        value={work.revenue ? inr(Math.round(work.revenue * (work.achievement >= 100 ? 0.02 : 0.01))) : '—'}
                      />
                      <Stat label="Score" value={u.score ? Object.values(u.score).reduce((a, b) => a + Number(b || 0), 0) : '—'} />
                      <Stat label="Tasks" value={u.tasksTotal ? `${u.tasksDone || 0} of ${u.tasksTotal}` : '—'} />
                    </div>
                    <div className="mt-4">
                      <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                        <span>Against target</span>
                        <span className="num">{work.achievement}%</span>
                      </p>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                        <div
                          className={`h-full rounded-full ${work.achievement >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                          style={{ width: `${Math.min(work.achievement, 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {tab === 'Activity' && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Stat label="Last login" value={a.lastLogin || 'never'} />
                      <Stat label="Active sessions" value={a.sessions ?? 0} />
                      <Stat
                        label="Failed attempts"
                        value={a.failedLogins ?? 0}
                        tone={a.failedLogins ? 'text-rose-600' : 'text-ink-900'}
                      />
                    </div>
                    <p className="eyebrow mt-5">Signed in from</p>
                    <p className="mt-1 text-sm text-ink-700">
                      {a.ip || '—'} · {a.browser || '—'} · {a.devices || 'no device restriction'}
                    </p>

                    <p className="eyebrow mt-5">What they have done</p>
                    <ol className="mt-2 space-y-3 border-l border-ink-900/[0.07] pl-4">
                      {log.map((l) => (
                        <li key={l.id} className="relative">
                          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                          <p className="text-sm text-ink-800">{l.what}</p>
                          <p className="text-xs text-ink-500">{l.kind} · {l.at}</p>
                        </li>
                      ))}
                      {log.length === 0 && <li className="text-sm text-ink-400">Nothing recorded yet.</li>}
                    </ol>
                  </>
                )}
              </div>
            </section>

            <section className="card p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-ink-900">
                <ShieldCheck size={16} className="text-brand-600" /> What management can do here
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Change role', 'Assign manager', 'Assign team', 'Reset password', 'Disable account', 'Login history'].map((label) => (
                  <button key={label} className="btn-line btn-sm" onClick={() => onAct(label)}>
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Everything that has happened against this person */}
          <div className="lg:col-span-2">
            <RecordTrail id={u.id} name={u.name} tasks={[]} />
          </div>
        </div>
      </aside>
    </div>
  );
}

import { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Pencil,
  ClipboardPlus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trophy,
  MapPin,
  Clock,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { inr, shortInr } from '../../data/mockData.js';
import { useApp } from '../../store/AppStore.jsx';

const liveDot = {
  Online: 'bg-emerald-500',
  Idle: 'bg-amber-400',
  'In meeting': 'bg-violet-500',
  'On customer visit': 'bg-sky-500',
  'On break': 'bg-amber-400',
  Offline: 'bg-ink-900/25',
  Leave: 'bg-ink-900/25',
  'Not logged in': 'bg-ink-900/25',
};
const attendanceTone = {
  Present: 'green',
  'Half day': 'amber',
  Late: 'amber',
  'Work from home': 'sky',
  'Field visit': 'sky',
  Leave: 'slate',
  Absent: 'rose',
  'Not logged in': 'slate',
};
const noticeIcon = {
  critical: { icon: AlertTriangle, tone: 'bg-rose-100 text-rose-700' },
  warning: { icon: Info, tone: 'bg-amber-100 text-amber-700' },
  positive: { icon: CheckCircle2, tone: 'bg-emerald-100 text-emerald-700' },
};
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

/** Label over value, used down the profile column. */
function Field({ label, children }) {
  return (
    <div className="border-b border-ink-900/[0.07] px-4 py-2.5">
      <p className="eyebrow">{label}</p>
      <div className="mt-1 text-sm text-ink-800">{children}</div>
    </div>
  );
}

/** One number with its caption. */
function Stat({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-3.5 py-3">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-lg font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

/** Progress line with a caption on either side. */
function Meter({ left, right, pct, tone = 'bg-brand-500' }) {
  return (
    <div>
      <p className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-ink-700">{left}</span>
        <span className="num font-bold text-ink-900">{right}</span>
      </p>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-soft">
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${Math.max(0, Math.min(pct, 100))}%` }}
        />
      </div>
    </div>
  );
}

/** Name and number, in a row, for the long breakdown lists. */
function Rows({ items }) {
  return (
    <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
      {items.map(([label, value, tone]) => (
        <li key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
          <span className="text-sm text-ink-600">{label}</span>
          <span className={`num text-sm font-bold ${tone || 'text-ink-900'}`}>{value}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The employee drawer from the client's sheet: who they are and what they are
 * on down the left, and Today / Attendance / Work / Targets / Tasks across the
 * right — every column of their Team Status tab, one tab at a time.
 */
export default function MemberDetails({ member, list, rank, workload, tasks, onClose, onJump, onEdit }) {
  const { update, toast } = useApp();
  const [tab, setTab] = useState('Today');

  if (!member) return null;

  const m = member;
  const d = m.day || {};
  const index = list.findIndex((x) => x.id === m.id);
  const phone = digits(m.phone);
  const score = m.productivity ?? 0;
  const targets = m.targets || {};
  const rev = m.revenueDetail || {};
  const targetPct = m.target ? Math.round((m.revenue / m.target) * 100) : 0;

  const band =
    score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Average' : 'Needs improvement';
  const bandTone = score >= 90 ? 'green' : score >= 75 ? 'sky' : score >= 60 ? 'amber' : 'rose';

  const quick = [
    { icon: Phone, tone: 'bg-sky-500', label: 'Call', run: () => { window.location.href = `tel:${phone}`; } },
    { icon: MessageCircle, tone: 'bg-emerald-500', label: 'WhatsApp', run: () => window.open(`https://wa.me/${phone}`, '_blank') },
    { icon: Mail, tone: 'bg-sky-500', label: 'Email', run: () => { window.location.href = `mailto:${m.email}`; } },
    { icon: ClipboardPlus, tone: 'bg-brand-600', label: 'Assign a task', run: () => toast(`Task assigned to ${m.name.split(' ')[0]}`) },
    { icon: Pencil, tone: 'bg-ink-400', label: 'Edit member', run: () => onEdit(m) },
  ];

  const tabs = [
    { key: 'Today', count: null },
    { key: 'Attendance', count: null },
    { key: 'Work', count: null },
    { key: 'Targets', count: null },
    { key: 'Tasks', count: tasks.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[1000px] flex-col bg-surface-base shadow-lift">
        <header className="flex items-center gap-3 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">Employee details</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="num text-sm font-semibold text-ink-500">
              {index + 1} / {list.length}
            </span>
            <button onClick={() => onJump(index - 1)} disabled={index <= 0} className="icon-btn h-8 w-8 disabled:opacity-40" title="Previous">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => onJump(index + 1)} disabled={index >= list.length - 1} className="icon-btn h-8 w-8 disabled:opacity-40" title="Next">
              <ChevronRight size={15} />
            </button>
            <button onClick={onClose} className="icon-btn h-8 w-8">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          {/* Who they are, and what they are on right now */}
          <section className="card h-fit overflow-hidden">
            <div className="px-4 pb-4 pt-5 text-center">
              <span className="relative inline-block">
                <Avatar name={m.name} size="lg" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ring-2 ring-white ${
                    liveDot[m.live] || liveDot.Offline
                  }`}
                />
              </span>
              <p className="mt-3 font-display text-lg font-extrabold text-ink-900">{m.name}</p>
              <p className="text-sm text-ink-500">{m.role}</p>
              <p className="num mt-0.5 text-xs text-ink-400">
                {m.empId || m.id} · {m.department || 'Sales desk'}
              </p>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Badge tone={m.live === 'Online' ? 'green' : m.live === 'Offline' ? 'slate' : 'sky'} dot>
                  {m.live}
                </Badge>
                <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>
                {rank > 0 && (
                  <Badge tone={rank === 1 ? 'amber' : 'slate'}>
                    {rank === 1 && <Trophy size={11} />} Rank #{rank}
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quick.map((q) => (
                  <button
                    key={q.label}
                    onClick={q.run}
                    title={q.label}
                    className={`grid h-9 w-9 place-items-center rounded-full text-white transition hover:opacity-90 ${q.tone}`}
                  >
                    <q.icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            <Field label="Current activity">
              <p className="font-semibold text-ink-900">{m.activityType || 'Idle'}</p>
              <p className="text-ink-600">{m.activity || '—'}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                <Clock size={11} /> started {m.activityStarted || '—'} · last active {m.lastActive}
              </p>
            </Field>
            {m.current && (
              <Field label="Current work">
                <p className="font-semibold text-ink-900">{m.current.customer}</p>
                <p className="text-ink-600">Next: {m.current.next}</p>
              </Field>
            )}
            <Field label="Working from">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} className="text-ink-400" /> {d.mode || 'Office'} · {d.source || 'Web app'}
              </span>
            </Field>
            <Field label="Workload level">
              <Badge tone={workload.tone}>{workload.label}</Badge>
            </Field>
            <Field label="Phone">
              <span className="num">{m.phone}</span>
            </Field>
            <Field label="Email">{m.email}</Field>
            <Field label="Account">
              <Badge tone={m.status === 'Active' ? 'green' : m.status === 'Invited' ? 'sky' : 'slate'}>
                {m.status}
              </Badge>
            </Field>
          </section>

          {/* Everything the sheet tracks, one tab at a time */}
          <section className="card flex min-h-0 flex-col overflow-hidden">
            <div className="no-scrollbar flex overflow-x-auto border-b border-ink-900/[0.07] bg-surface-soft/50">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${
                    tab === t.key
                      ? 'border-brand-600 bg-white text-brand-700'
                      : 'border-transparent text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {t.key}
                  {t.count != null && <span className="num ml-1.5 text-ink-400">{t.count}</span>}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {tab === 'Today' && (
                <div className="space-y-5">
                  <div>
                    <p className="eyebrow mb-2">Today&rsquo;s summary</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Stat label="Login" value={d.login || '—'} />
                      <Stat label="Working" value={d.working || '—'} />
                      <Stat label="Calls" value={m.calls ?? 0} />
                      <Stat label="Connected" value={m.callDetail?.connected ?? 0} />
                      <Stat label="Presentations" value={m.presentations ?? 0} />
                      <Stat label="Visits" value={m.visits ?? 0} />
                      <Stat label="Follow-ups" value={m.followUps ?? 0} />
                      <Stat label="Closings" value={m.bookings ?? 0} />
                      <Stat label="Revenue" value={m.revenue ? inr(m.revenue) : '—'} tone="text-brand-700" />
                    </div>
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Lead pipeline</p>
                    <Rows
                      items={[
                        ['Fresh', m.pipeline?.fresh ?? 0],
                        ['Contacted', m.pipeline?.contacted ?? 0],
                        ['Interested', m.pipeline?.interested ?? 0],
                        ['Presentation', m.pipeline?.presentation ?? 0],
                        ['Visit', m.pipeline?.visit ?? 0],
                        ['Hot', m.pipeline?.hot ?? 0, 'text-rose-600'],
                        ['Closing', m.pipeline?.closing ?? 0, 'text-emerald-600'],
                      ]}
                    />
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Alerts on this desk</p>
                    <ul className="space-y-2">
                      {(m.notices || []).map((n) => {
                        const { icon: Icon, tone } = noticeIcon[n.level] || noticeIcon.warning;
                        return (
                          <li key={n.text} className="flex items-start gap-2.5 rounded-xl bg-surface-soft px-3.5 py-2.5">
                            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg ${tone}`}>
                              <Icon size={13} />
                            </span>
                            <span className="min-w-0 flex-1 text-sm text-ink-700">{n.text}</span>
                            <span className="num shrink-0 text-xs text-ink-400">{n.at}</span>
                          </li>
                        );
                      })}
                      {(m.notices || []).length === 0 && (
                        <li className="rounded-xl bg-surface-soft px-3.5 py-3 text-sm text-ink-500">
                          Nothing flagged today.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {tab === 'Attendance' && (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="First login" value={d.login || '—'} />
                    <Stat label="Last logout" value={d.logout || '—'} />
                    <Stat label="Working hours" value={d.working || '—'} />
                    <Stat label="Break time" value={d.breaks || '—'} />
                    <Stat label="Idle time" value={d.idle || '—'} />
                    <Stat
                      label="Late by"
                      value={d.lateBy ? `${d.lateBy} min` : 'On time'}
                      tone={d.lateBy ? 'text-amber-600' : 'text-emerald-600'}
                    />
                  </div>
                  <Meter left="Attendance this month" right={`${d.attendancePct ?? 0}%`} pct={d.attendancePct ?? 0} />
                  <Rows
                    items={[
                      ['Today', m.attendance],
                      ['Working from', d.mode || 'Office'],
                      ['Login source', d.source || 'Web app'],
                      ['Regularisation', d.regularisation || 'None pending'],
                    ]}
                  />
                  <button className="btn-ghost" onClick={() => toast(`Reminder sent to ${m.name.split(' ')[0]}`)}>
                    Send a reminder
                  </button>
                </div>
              )}

              {tab === 'Work' && (
                <div className="space-y-5">
                  <div>
                    <p className="eyebrow mb-2">Calls</p>
                    <Rows
                      items={[
                        ['Total calls', m.calls ?? 0],
                        ['Connected', m.callDetail?.connected ?? 0, 'text-emerald-600'],
                        ['Not answered', m.callDetail?.notAnswered ?? 0],
                        ['Busy / wrong number', (m.callDetail?.busy ?? 0) + (m.callDetail?.wrongNumber ?? 0)],
                        ['Callback requested', m.callDetail?.callback ?? 0],
                        ['Average call', m.callDetail?.avgDuration ?? '—'],
                        ['Total talk time', m.callDetail?.talkTime ?? '—'],
                        [
                          'Connection rate',
                          `${m.calls ? Math.round(((m.callDetail?.connected ?? 0) / m.calls) * 100) : 0}%`,
                        ],
                      ]}
                    />
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Presentations</p>
                    <Rows
                      items={[
                        ['Scheduled', m.presentationDetail?.scheduled ?? 0],
                        ['Completed', m.presentationDetail?.completed ?? 0],
                        ['No show', m.presentationDetail?.noShow ?? 0],
                        ['Converted', m.presentationDetail?.converted ?? 0, 'text-emerald-600'],
                        ['Pending decision', m.presentationDetail?.pending ?? 0],
                        [
                          'Presentation → closing',
                          `${
                            m.presentationDetail?.completed
                              ? Math.round(((m.presentationDetail?.converted ?? 0) / m.presentationDetail.completed) * 100)
                              : 0
                          }%`,
                        ],
                      ]}
                    />
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Customer visits</p>
                    <Rows
                      items={[
                        ['Scheduled', m.visitDetail?.scheduled ?? 0],
                        ['Completed', m.visitDetail?.completed ?? 0],
                        ['Cancelled / no show', (m.visitDetail?.cancelled ?? 0) + (m.visitDetail?.noShow ?? 0)],
                        ['Converted', m.visitDetail?.converted ?? 0, 'text-emerald-600'],
                        ['Revenue from visits', m.visitDetail?.revenue ? inr(m.visitDetail.revenue) : '—'],
                      ]}
                    />
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Follow-ups</p>
                    <Rows
                      items={[
                        ['Due today', m.followUpDetail?.due ?? 0],
                        ['Completed', m.followUpDetail?.completed ?? 0, 'text-emerald-600'],
                        ['Pending', m.followUpDetail?.pending ?? 0],
                        ['Overdue', m.followUpDetail?.overdue ?? 0, 'text-rose-600'],
                        ['Missed', m.followUpDetail?.missed ?? 0],
                        [
                          'Follow-up discipline',
                          `${
                            m.followUpDetail?.due
                              ? Math.round(((m.followUpDetail?.completed ?? 0) / m.followUpDetail.due) * 100)
                              : 0
                          }%`,
                        ],
                      ]}
                    />
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Sales and revenue</p>
                    <Rows
                      items={[
                        ["Today's closings", m.salesDetail?.today ?? 0],
                        ['Closings this month', m.salesDetail?.closings ?? 0],
                        ['Pending closings', m.salesDetail?.pending ?? 0],
                        ['Average ticket', m.salesDetail?.avgTicket ? inr(m.salesDetail.avgTicket) : '—'],
                        ['Revenue this month', rev.mtd ? inr(rev.mtd) : '—', 'text-brand-700'],
                        ['Collected', rev.collected ? inr(rev.collected) : '—'],
                        ['Outstanding', rev.outstanding ? inr(rev.outstanding) : '—', rev.outstanding ? 'text-amber-600' : ''],
                        ['Previous month', rev.previous ? inr(rev.previous) : '—'],
                      ]}
                    />
                  </div>
                </div>
              )}

              {tab === 'Targets' && (
                <div className="space-y-5">
                  <Meter
                    left={`Revenue target · ${shortInr(m.target || 0)}`}
                    right={`${targetPct}%`}
                    pct={targetPct}
                    tone={targetPct >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Achieved" value={inr(m.revenue || 0)} tone="text-brand-700" />
                    <Stat label="Target gap" value={inr(Math.max(0, (m.target || 0) - (m.revenue || 0)))} />
                    <Stat label="Rank on the desk" value={rank > 0 ? `#${rank}` : '—'} />
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Targets against work done</p>
                    <div className="space-y-3.5">
                      {[
                        ['Leads', m.leads ?? 0, targets.leads],
                        ['Calls', m.calls ?? 0, targets.calls],
                        ['Presentations', m.presentations ?? 0, targets.presentations],
                        ['Visits', m.visits ?? 0, targets.visits],
                        ['Closings', m.bookings ?? 0, targets.closings],
                      ].map(([label, done, goal]) => (
                        <Meter
                          key={label}
                          left={label}
                          right={`${done} / ${goal ?? 0}`}
                          pct={goal ? (done / goal) * 100 : 0}
                          tone={goal && done >= goal ? 'bg-emerald-500' : 'bg-brand-500'}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Productivity score</p>
                    <div className="flex items-center gap-3">
                      <p className="num font-display text-3xl font-extrabold text-ink-900">{score}</p>
                      <span className="text-sm text-ink-500">out of 100</span>
                      <Badge tone={bandTone}>{band}</Badge>
                    </div>
                    <div className="mt-3">
                      <Rows
                        items={[
                          ['Attendance · 10', m.score?.attendance ?? 0],
                          ['Calls · 15', m.score?.calls ?? 0],
                          ['Connected calls · 10', m.score?.connected ?? 0],
                          ['Follow-ups · 15', m.score?.followUps ?? 0],
                          ['Presentations · 15', m.score?.presentations ?? 0],
                          ['Visits · 10', m.score?.visits ?? 0],
                          ['Closings · 20', m.score?.closings ?? 0],
                          ['CRM discipline · 5', m.score?.discipline ?? 0],
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {tab === 'Tasks' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Total" value={m.tasksTotal ?? 0} />
                    <Stat label="Completed" value={m.tasksDone ?? 0} tone="text-emerald-600" />
                    <Stat label="Pending" value={m.taskDetail?.pending ?? 0} />
                    <Stat
                      label="Overdue"
                      value={m.taskDetail?.overdue ?? 0}
                      tone={m.taskDetail?.overdue ? 'text-rose-600' : 'text-ink-900'}
                    />
                  </div>
                  <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink-900">{t.title}</p>
                          <p className="mt-0.5 text-xs text-ink-500">
                            {t.id} · {t.customer} · due {t.due}
                          </p>
                        </div>
                        <Badge tone={t.bucket === 'overdue' ? 'rose' : t.bucket === 'done' ? 'green' : 'sky'} dot>
                          {t.bucket}
                        </Badge>
                      </li>
                    ))}
                    {tasks.length === 0 && (
                      <li className="px-4 py-6 text-center text-sm text-ink-500">
                        Nothing assigned right now.
                      </li>
                    )}
                  </ul>
                  <button className="btn-primary" onClick={() => toast(`Task assigned to ${m.name.split(' ')[0]}`)}>
                    <ClipboardPlus size={15} /> Assign a task
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

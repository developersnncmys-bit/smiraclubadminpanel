import { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Pencil,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { inr, shortInr } from '../../data/mockData.js';
import { useApp } from '../../store/AppStore.jsx';

const liveDot = { Online: 'bg-emerald-500', Away: 'bg-amber-400', Offline: 'bg-ink-900/25' };
const attendanceTone = { Present: 'green', 'Half day': 'amber', Leave: 'slate' };
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

/** Label over value, the same block the lead panel uses. */
function Field({ label, children }) {
  return (
    <div className="border-b border-ink-900/[0.07] px-4 py-3">
      <p className="eyebrow">{label}</p>
      <div className="mt-1.5 text-sm text-ink-800">{children}</div>
    </div>
  );
}

/** One number with its caption. */
function Stat({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-xl bg-surface-soft px-4 py-3.5">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className={`num mt-1 font-display text-xl font-extrabold ${tone}`}>{value}</p>
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
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Everything the client's sheet tracks for one person, in one panel: what
 * they are on right now, what they have done today, how they are tracking
 * against target, and their task list.
 */
export default function MemberDetails({ member, list, rank, workload, tasks, onClose, onJump, onEdit }) {
  const { update, toast } = useApp();
  const [tab, setTab] = useState('Today');

  if (!member) return null;

  const m = member;
  const index = list.findIndex((x) => x.id === m.id);
  const phone = digits(m.phone);
  const taskPct = m.tasksTotal ? Math.round((m.tasksDone / m.tasksTotal) * 100) : 0;
  const targetPct = m.target ? Math.round((m.revenue / m.target) * 100) : 0;
  const score = m.productivity ?? 0;

  const quick = [
    { icon: Phone, tone: 'bg-sky-500', label: 'Call', run: () => { window.location.href = `tel:${phone}`; } },
    { icon: MessageCircle, tone: 'bg-emerald-500', label: 'WhatsApp', run: () => window.open(`https://wa.me/${phone}`, '_blank') },
    { icon: Mail, tone: 'bg-sky-500', label: 'Email', run: () => { window.location.href = `mailto:${m.email}`; } },
    { icon: Pencil, tone: 'bg-sky-500', label: 'Edit member', run: () => onEdit(m) },
    {
      icon: ShieldCheck,
      tone: m.status === 'Disabled' ? 'bg-ink-400' : 'bg-brand-600',
      label: m.status === 'Disabled' ? 'Enable access' : 'Disable access',
      run: () => update('team', m.id, { status: m.status === 'Disabled' ? 'Active' : 'Disabled' }),
    },
  ];

  const tabs = [
    { key: 'Today', count: null },
    { key: 'Performance', count: null },
    { key: 'Tasks', count: tasks.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[980px] flex-col bg-surface-base shadow-lift">
        <header className="flex items-center gap-3 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">Member details</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="num text-sm font-semibold text-ink-500">
              {index + 1} / {list.length}
            </span>
            <button
              onClick={() => onJump(index - 1)}
              disabled={index <= 0}
              className="icon-btn h-8 w-8 disabled:opacity-40"
              title="Previous"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => onJump(index + 1)}
              disabled={index >= list.length - 1}
              className="icon-btn h-8 w-8 disabled:opacity-40"
              title="Next"
            >
              <ChevronRight size={15} />
            </button>
            <button onClick={onClose} className="icon-btn h-8 w-8">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Who they are */}
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

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Badge tone={m.live === 'Online' ? 'green' : m.live === 'Away' ? 'amber' : 'slate'} dot>
                  {m.live}
                </Badge>
                <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>
                {rank > 0 && (
                  <Badge tone={rank === 1 ? 'amber' : 'slate'}>
                    {rank === 1 && <Trophy size={11} />} #{rank} on the desk
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

            <Field label="Current activity">{m.activity || '—'}</Field>
            <Field label="Last active">{m.lastActive}</Field>
            <Field label="Phone">
              <span className="num">{m.phone}</span>
            </Field>
            <Field label="Email">{m.email}</Field>
            <Field label="Workload level">
              <Badge tone={workload.tone}>{workload.label}</Badge>
            </Field>
            <Field label="Account">
              <Badge tone={m.status === 'Active' ? 'green' : m.status === 'Invited' ? 'sky' : 'slate'}>
                {m.status}
              </Badge>
            </Field>
          </section>

          {/* What they have done */}
          <section className="card flex min-h-0 flex-col overflow-hidden">
            <div className="flex border-b border-ink-900/[0.07] bg-surface-soft/50">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
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
                  <Meter left="Tasks done today" right={`${m.tasksDone}/${m.tasksTotal}`} pct={taskPct} />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Calls" value={m.calls ?? 0} />
                    <Stat label="Follow-ups" value={m.followUps ?? 0} />
                    <Stat label="Lead workload" value={m.leads ?? 0} />
                    <Stat label="Itineraries sent" value={m.presentations ?? 0} />
                    <Stat label="Customer visits" value={m.visits ?? 0} />
                    <Stat
                      label="Alerts"
                      value={m.alerts ?? 0}
                      tone={m.alerts ? 'text-rose-600' : 'text-ink-900'}
                    />
                  </div>
                  {m.alerts > 0 && (
                    <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                      {m.alerts} lead{m.alerts > 1 ? 's have' : ' has'} gone past the follow-up time on
                      this desk.
                    </p>
                  )}
                </div>
              )}

              {tab === 'Performance' && (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Enquiries handled" value={m.enquiries ?? 0} />
                    <Stat label="Sales / closings" value={m.bookings ?? 0} />
                    <Stat label="Revenue" value={m.revenue ? inr(m.revenue) : '—'} tone="text-brand-700" />
                  </div>

                  {m.target ? (
                    <Meter
                      left={`Target vs achievement · of ${shortInr(m.target)}`}
                      right={`${targetPct}%`}
                      pct={targetPct}
                      tone={targetPct >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}
                    />
                  ) : (
                    <p className="text-sm text-ink-500">No revenue target set for this role.</p>
                  )}

                  <Meter
                    left="Productivity score"
                    right={`${score}/100`}
                    pct={score}
                    tone={score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-400' : 'bg-rose-400'}
                  />

                  <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
                    Ranked{' '}
                    {rank > 0 ? <b className="text-ink-900">#{rank}</b> : <span>unranked</span>} by
                    revenue · workload <Badge tone={workload.tone}>{workload.label}</Badge>
                  </div>

                  <button
                    className="btn-ghost"
                    onClick={() => toast(`Target review noted for ${m.name.split(' ')[0]}`)}
                  >
                    Log a target review
                  </button>
                </div>
              )}

              {tab === 'Tasks' && (
                <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink-900">{t.title}</p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {t.customer} · due {t.due}
                        </p>
                      </div>
                      <Badge
                        tone={t.bucket === 'overdue' ? 'rose' : t.bucket === 'done' ? 'green' : 'sky'}
                        dot
                      >
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
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

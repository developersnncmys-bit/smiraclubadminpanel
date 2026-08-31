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
  Shuffle,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import DrawerTabs from '../ui/DrawerTabs.jsx';
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

/** A titled group of label-and-value lines, two to a row where there is space. */
function Group({ title, items }) {
  return (
    <div>
      {title && <p className="eyebrow mb-1.5">{title}</p>}
      <dl className="grid gap-x-8 sm:grid-cols-2">
        {items.map(([label, value, tone]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-ink-900/[0.07] py-2"
          >
            <dt className="min-w-0 truncate text-[13px] text-ink-500">{label}</dt>
            <dd className={`num shrink-0 text-[13px] font-bold ${tone || 'text-ink-900'}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The day's counters, one strip rather than a wall of cards. */
function Strip({ items }) {
  return (
    <div className="grid grid-cols-2 divide-ink-900/[0.07] rounded-xl border border-ink-900/[0.07] sm:grid-cols-4 sm:divide-x">
      {items.map(([label, value, tone]) => (
        <div key={label} className="px-4 py-3">
          <p className={`num truncate font-display text-lg font-extrabold leading-none ${tone || 'text-ink-900'}`}>
            {value}
          </p>
          <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
        </div>
      ))}
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
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${Math.max(0, Math.min(pct, 100))}%` }}
        />
      </div>
    </div>
  );
}

/**
 * The employee drawer: who they are and what they are on down the left, and
 * Today / Work / Targets / Tasks on the right — the sheet's columns, but read
 * as lines rather than a wall of boxes.
 */
export default function MemberDetails({ member, list, rank, workload, tasks, onClose, onJump, onEdit }) {
  const { toast } = useApp();
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
  const pct = (part, whole) => `${whole ? Math.round((part / whole) * 100) : 0}%`;

  const band =
    score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Average' : 'Needs improvement';
  const bandTone = score >= 90 ? 'green' : score >= 75 ? 'sky' : score >= 60 ? 'amber' : 'rose';
  const scoreText =
    score >= 90 ? 'text-emerald-600' : score >= 75 ? 'text-sky-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';

  const quick = [
    { icon: Phone, short: 'Call', label: 'Call', run: () => { window.location.href = `tel:${phone}`; } },
    { icon: MessageCircle, short: 'WhatsApp', label: 'WhatsApp', run: () => window.open(`https://wa.me/${phone}`, '_blank') },
    { icon: Mail, short: 'Email', label: 'Email', run: () => { window.location.href = `mailto:${m.email}`; } },
    { icon: ClipboardPlus, short: 'Task', label: 'Assign a task', run: () => toast(`Task assigned to ${m.name.split(' ')[0]}`) },
    { icon: Shuffle, short: 'Rebalance', label: 'Rebalance workload', run: () => toast(`Pick the leads to move off ${m.name.split(' ')[0]}`) },
    { icon: Pencil, short: 'Edit', label: 'Edit member', run: () => onEdit(m) },
  ];

  const tabs = [
    { key: 'Today', count: null },
    { key: 'Activity', count: (m.activityLog || []).length },
    { key: 'Leads', count: null },
    { key: 'Work', count: null },
    { key: 'Targets', count: null },
    { key: 'Tasks', count: tasks.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="flex h-full w-full max-w-[980px] flex-col bg-surface-base shadow-lift">
        <header className="flex items-center gap-3 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">{m.name}</h2>
          <span className="num text-sm text-ink-400">{m.empId || m.id}</span>
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
          <section className="card h-fit p-5">
            <div className="flex items-center gap-3">
              <span className="relative shrink-0">
                <Avatar name={m.name} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${
                    liveDot[m.live] || liveDot.Offline
                  }`}
                />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-[1.05rem] font-extrabold leading-tight text-ink-900">
                  {m.name}
                </p>
                <p className="truncate text-[13px] text-ink-500">{m.role}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone={m.live === 'Online' ? 'green' : m.live === 'Offline' ? 'slate' : 'sky'} dot>
                {m.live}
              </Badge>
              <Badge tone={attendanceTone[m.attendance] || 'slate'}>{m.attendance}</Badge>
              <Badge tone={workload.tone}>{workload.level} load</Badge>
              {rank > 0 && (
                <Badge tone={rank === 1 ? 'amber' : 'slate'}>
                  {rank === 1 && <Trophy size={11} />} #{rank}
                </Badge>
              )}
            </div>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {quick.map((q) => (
                <button key={q.label} onClick={q.run} className="btn-line btn-sm" title={q.label}>
                  <q.icon size={13} /> {q.short}
                </button>
              ))}
            </div>

            {/* The one thing management opens this drawer to see */}
            <div className="mt-4 rounded-xl bg-surface-soft px-4 py-3.5">
              <p className="eyebrow">Doing now</p>
              <p className="mt-1 text-[15px] font-bold leading-snug text-ink-900">{m.activityType || 'Idle'}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink-600">{m.activity || '—'}</p>
              <p className="mt-1.5 text-xs text-ink-400">
                since {m.activityStarted || '—'} · last active {m.lastActive}
              </p>
              {m.current && (
                <p className="mt-2.5 border-t border-ink-900/[0.07] pt-2.5 text-xs leading-relaxed text-ink-600">
                  <b className="text-ink-800">{m.current.customer}</b>
                  <br />
                  next: {m.current.next}
                </p>
              )}
            </div>

            {/* The record, one field a line so nothing breaks mid-word */}
            <dl className="mt-4">
              {[
                ['Employee ID', <span className="num">{m.empId || m.id}</span>],
                ['Team', m.department || 'Sales desk'],
                ['Working from', `${d.mode || 'Office'} · ${d.source || 'Web app'}`],
                ['Phone', <span className="num whitespace-nowrap">{m.phone}</span>],
                ['Email', <span className="break-words">{m.email}</span>],
                ['Account', m.status],
              ].map(([label, v]) => (
                <div key={label} className="border-b border-ink-900/[0.07] py-2 last:border-0">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</dt>
                  <dd className="mt-0.5 text-[13px] font-semibold leading-snug text-ink-800">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Everything the sheet tracks, one tab at a time */}
          <section className="card flex min-h-0 flex-col overflow-hidden">
            <DrawerTabs items={tabs} value={tab} onChange={setTab} />

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {tab === 'Today' && (
                <div className="space-y-5">
                  <Strip
                    items={[
                      ['Calls', m.calls ?? 0],
                      ['Connected', m.callDetail?.connected ?? 0, 'text-emerald-600'],
                      ['Presentations', m.presentations ?? 0],
                      ['Visits', m.visits ?? 0],
                      ['Follow-ups', m.followUpDetail?.due ?? 0],
                      ['Closings', m.bookings ?? 0, 'text-emerald-600'],
                      ['Revenue', m.revenue ? shortInr(m.revenue) : '—', 'text-brand-700'],
                      ['Score', `${score}`, scoreText],
                    ]}
                  />

                  <Group
                    title="Attendance today"
                    items={[
                      ['Login', d.login || '—'],
                      ['Logout', d.logout || '—'],
                      ['Working hours', d.working || '—'],
                      ['Break · idle', `${d.breaks || '—'} · ${d.idle || '—'}`],
                      [
                        'Late by',
                        d.lateBy ? `${d.lateBy} min` : 'On time',
                        d.lateBy ? 'text-amber-600' : 'text-emerald-600',
                      ],
                      ['This month', `${d.attendancePct ?? 0}%`],
                      ['Regularisation', d.regularisation || 'None pending'],
                      ['Revenue today', m.revenue ? inr(m.revenue) : '—', 'text-brand-700'],
                    ]}
                  />

                  <Group
                    title="Lead pipeline"
                    items={[
                      ['Fresh', m.pipeline?.fresh ?? 0],
                      ['Contacted', m.pipeline?.contacted ?? 0],
                      ['Interested', m.pipeline?.interested ?? 0],
                      ['Presentation', m.pipeline?.presentation ?? 0],
                      ['Visit', m.pipeline?.visit ?? 0],
                      ['Hot', m.pipeline?.hot ?? 0, 'text-rose-600'],
                      ['Closing', m.pipeline?.closing ?? 0, 'text-emerald-600'],
                      ['Follow-ups due', m.followUpDetail?.due ?? 0],
                    ]}
                  />

                  <div>
                    <p className="eyebrow mb-1.5">Alerts</p>
                    <ul className="space-y-1.5">
                      {(m.notices || []).map((n) => {
                        const { icon: Icon, tone } = noticeIcon[n.level] || noticeIcon.warning;
                        return (
                          <li key={n.text} className="flex items-center gap-2.5">
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${tone}`}>
                              <Icon size={13} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-ink-700">{n.text}</span>
                            <span className="num shrink-0 text-xs text-ink-400">{n.at}</span>
                          </li>
                        );
                      })}
                      {(m.notices || []).length === 0 && (
                        <li className="text-sm text-ink-500">Nothing flagged today.</li>
                      )}
                    </ul>
                  </div>

                  <button className="btn-line" onClick={() => toast(`Reminder sent to ${m.name.split(' ')[0]}`)}>
                    Send a reminder
                  </button>
                </div>
              )}

              {tab === 'Activity' && (
                <div className="space-y-5">
                  <Group
                    title="Attendance today"
                    items={[
                      ['First login', d.login || '—'],
                      ['Last logout', d.logout || '—'],
                      ['Working hours', d.working || '—'],
                      ['Break time', d.breaks || '—'],
                      ['Idle time', d.idle || '—'],
                      ['Late by', d.lateBy ? `${d.lateBy} min` : 'On time', d.lateBy ? 'text-amber-600' : 'text-emerald-600'],
                      ['Working from', d.mode || 'Office'],
                      ['Login source', d.source || '—'],
                      ['Regularisation', d.regularisation || 'None pending'],
                      ['Attendance this month', `${d.attendancePct ?? 0}%`],
                    ]}
                  />

                  {(m.attendanceFlags || []).length > 0 && (
                    <div>
                      <p className="eyebrow mb-1.5">Flagged on attendance</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.attendanceFlags.map((f) => (
                          <Badge key={f} tone="amber">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.visitTrack && (
                    <div>
                      <p className="eyebrow mb-1.5">Field tracking</p>
                      <div className="rounded-xl bg-surface-soft px-4 py-3">
                        <p className="text-sm font-bold text-ink-900">{m.visitTrack.place}</p>
                        <p className="text-xs text-ink-500">
                          Checked in {m.visitTrack.checkIn} · checked out {m.visitTrack.checkOut}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {['Scheduled', 'En Route', 'Reached', 'Meeting', 'Completed'].map((st) => (
                            <span
                              key={st}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                st === m.visitTrack.stage ? 'bg-sky-500 text-white' : 'bg-white text-ink-400'
                              }`}
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="eyebrow mb-2">Activity log</p>
                    <ol className="relative space-y-0 border-l border-ink-900/10 pl-5">
                      {(m.activityLog || []).map((a, i) => (
                        <li key={`${a.at}-${i}`} className="relative pb-4 last:pb-0">
                          <span className="absolute -left-[25px] top-1 grid h-3 w-3 place-items-center rounded-full border-2 border-white bg-brand-500" />
                          <p className="text-sm font-semibold text-ink-800">{a.text}</p>
                          <p className="mt-0.5 text-xs text-ink-400">
                            <span className="num">{a.at}</span> · {a.kind}
                          </p>
                        </li>
                      ))}
                      {(m.activityLog || []).length === 0 && (
                        <li className="text-sm text-ink-500">No activity recorded today.</li>
                      )}
                    </ol>
                  </div>
                </div>
              )}

              {tab === 'Leads' && (
                <div className="space-y-5">
                  <Meter
                    left={`Workload · ${workload.level}`}
                    right={String(workload.load)}
                    pct={Math.min(100, workload.load)}
                    tone={workload.level === 'Low' ? 'bg-emerald-500' : workload.level === 'Normal' ? 'bg-amber-400' : 'bg-rose-500'}
                  />
                  <Group
                    title="Lead workload"
                    items={[
                      ['Total assigned', m.leads ?? 0],
                      ['Fresh', m.leadMix?.fresh ?? 0],
                      ['Contacted', m.leadMix?.contacted ?? 0],
                      ['Interested', m.leadMix?.interested ?? 0],
                      ['Presentation pending', m.leadMix?.presentationPending ?? 0],
                      ['Presentation completed', m.leadMix?.presentationDone ?? 0],
                      ['Visit scheduled', m.leadMix?.visitScheduled ?? 0],
                      ['Follow-up pending', m.leadMix?.followUpPending ?? 0, 'text-amber-600'],
                      ['Hot', m.leadMix?.hot ?? 0, 'text-rose-600'],
                      ['Warm', m.leadMix?.warm ?? 0],
                      ['Cold', m.leadMix?.cold ?? 0],
                      ['No response', m.leadMix?.noResponse ?? 0],
                      ['Closed', m.leadMix?.closed ?? 0, 'text-emerald-600'],
                      ['Lost', m.leadMix?.lost ?? 0, 'text-rose-600'],
                    ]}
                  />
                  <Group
                    title="Follow-ups by category"
                    items={[
                      ['Day 1', m.followUpMix?.day1 ?? 0],
                      ['Day 3', m.followUpMix?.day3 ?? 0],
                      ['Day 6', m.followUpMix?.day6 ?? 0],
                      ['Final follow-up', m.followUpMix?.final ?? 0],
                      ['Payment follow-up', m.followUpMix?.payment ?? 0],
                      ['Presentation follow-up', m.followUpMix?.presentation ?? 0],
                      ['Visit follow-up', m.followUpMix?.visit ?? 0],
                      ['Membership activation', m.followUpMix?.membership ?? 0],
                    ]}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <button className="btn-action btn-sm" onClick={() => toast(`Pick the leads to move off ${m.name.split(' ')[0]}`)}>
                      Reassign leads
                    </button>
                    <button className="btn-line btn-sm" onClick={() => toast('Opening the lead list')}>
                      View all leads
                    </button>
                  </div>
                </div>
              )}

              {tab === 'Work' && (
                <div className="space-y-5">
                  <Group
                    title="Calls"
                    items={[
                      ['Total calls', m.calls ?? 0],
                      ['Connected', m.callDetail?.connected ?? 0, 'text-emerald-600'],
                      ['Not answered', m.callDetail?.notAnswered ?? 0],
                      ['Busy / wrong number', (m.callDetail?.busy ?? 0) + (m.callDetail?.wrongNumber ?? 0)],
                      ['Callback requested', m.callDetail?.callback ?? 0],
                      ['Average call', m.callDetail?.avgDuration ?? '—'],
                      ['Talk time', m.callDetail?.talkTime ?? '—'],
                      ['Connection rate', pct(m.callDetail?.connected ?? 0, m.calls)],
                    ]}
                  />

                  <Group
                    title="Presentations and visits"
                    items={[
                      ['Presentations scheduled', m.presentationDetail?.scheduled ?? 0],
                      ['Completed', m.presentationDetail?.completed ?? 0],
                      ['No show', m.presentationDetail?.noShow ?? 0],
                      ['Converted', m.presentationDetail?.converted ?? 0, 'text-emerald-600'],
                      [
                        'Presentation → closing',
                        pct(m.presentationDetail?.converted ?? 0, m.presentationDetail?.completed),
                      ],
                      ['Visits scheduled', m.visitDetail?.scheduled ?? 0],
                      ['Visits completed', m.visitDetail?.completed ?? 0],
                      ['Revenue from visits', m.visitDetail?.revenue ? inr(m.visitDetail.revenue) : '—'],
                    ]}
                  />

                  <Group
                    title="Follow-ups"
                    items={[
                      ['Due today', m.followUpDetail?.due ?? 0],
                      ['Completed', m.followUpDetail?.completed ?? 0, 'text-emerald-600'],
                      ['Pending', m.followUpDetail?.pending ?? 0],
                      ['Overdue', m.followUpDetail?.overdue ?? 0, 'text-rose-600'],
                      ['Missed', m.followUpDetail?.missed ?? 0],
                      ['Discipline', pct(m.followUpDetail?.completed ?? 0, m.followUpDetail?.due)],
                    ]}
                  />

                  <Group
                    title="Sales and revenue"
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
              )}

              {tab === 'Targets' && (
                <div className="space-y-5">
                  <Meter
                    left={`Revenue · ${inr(m.revenue || 0)} of ${shortInr(m.target || 0)}`}
                    right={`${targetPct}%`}
                    pct={targetPct}
                    tone={targetPct >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}
                  />

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

                  <div>
                    <p className="eyebrow mb-1.5">Productivity score</p>
                    <div className="flex items-center gap-3">
                      <p className="num font-display text-3xl font-extrabold text-ink-900">{score}</p>
                      <span className="text-sm text-ink-500">out of 100</span>
                      <Badge tone={bandTone}>{band}</Badge>
                      <span className="num ml-auto text-sm text-ink-500">
                        Target gap {inr(Math.max(0, (m.target || 0) - (m.revenue || 0)))}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Group
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
                <div className="space-y-4">
                  <Strip
                    items={[
                      ['Total', m.tasksTotal ?? 0],
                      ['Completed', m.tasksDone ?? 0, 'text-emerald-600'],
                      ['Pending', m.taskDetail?.pending ?? 0],
                      [
                        'Overdue',
                        m.taskDetail?.overdue ?? 0,
                        m.taskDetail?.overdue ? 'text-rose-600' : 'text-ink-900',
                      ],
                    ]}
                  />
                  <ul className="divide-y divide-ink-900/[0.07]">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink-900">{t.title}</p>
                          <p className="mt-0.5 truncate text-xs text-ink-500">
                            {t.customer} · due {t.due}
                          </p>
                        </div>
                        <Badge tone={t.bucket === 'overdue' ? 'rose' : t.bucket === 'done' ? 'green' : 'sky'} dot>
                          {t.bucket}
                        </Badge>
                      </li>
                    ))}
                    {tasks.length === 0 && (
                      <li className="py-6 text-center text-sm text-ink-500">Nothing assigned right now.</li>
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

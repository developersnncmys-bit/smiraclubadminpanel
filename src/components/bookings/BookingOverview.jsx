import { useState } from 'react';
import {
  Plus, Search, CalendarCheck, CheckCircle2, UserCheck, Wallet,
  Upload, XCircle, CalendarClock, Phone, Send, FileSpreadsheet,
  FileText, Download, BedDouble, LogIn, LogOut, Gift,
  Zap,
} from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import Block from '../ui/Block.jsx';
import Stat from '../ui/Stat.jsx';
import KpiRow from '../ui/KpiRow.jsx';
import MenuButton from '../ui/MenuButton.jsx';
import {
  bookingStatusTone,
  confirmationStates,
  cancellationRequests,
  rescheduleRequests,
  memberships,
  inr,
  shortInr,
} from '../../data/mockData.js';

const confirmTone = {
  'Waiting for hotel': 'amber',
  'Sent to hotel': 'sky',
  'Hotel confirmed': 'green',
  'Hotel rejected': 'rose',
  'Alternative required': 'violet',
};

/** Rows of label and value inside a bordered list. */
function Rows({ items, empty = 'Nothing here yet.' }) {
  if (items.length === 0) return <p className="py-6 text-center text-sm text-ink-500">{empty}</p>;
  return (
    <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
      {items.map((it) => (
        <li key={it.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
          {it.left}
          <span className="ml-auto flex shrink-0 items-center gap-2">{it.right}</span>
        </li>
      ))}
    </ul>
  );
}

const day = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};
const daysAway = (value) => {
  const d = day(value);
  if (!d) return null;
  const now = new Date();
  return Math.round(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      86400000
  );
};

/**
 * The Booking tab of the client's sheet as one board: what is happening
 * today, what is coming, what the hotels still owe us, the money, the
 * cancellations, who is handling what, and the reports.
 */
export default function BookingOverview({ rows, invoices = [], signups = [], onOpen, actions }) {
  const [window, setWindow] = useState(7);

  const value = (list) => list.reduce((s, b) => s + Number(b.amount || 0), 0);
  const paidOf = (list) => list.reduce((s, b) => s + Number(b.paid || 0), 0);

  const confirmed = rows.filter((b) => b.status === 'Confirmed');
  const pendingPay = rows.filter((b) => Number(b.paid || 0) < Number(b.amount || 0) && b.status !== 'Cancelled');
  const cancelled = rows.filter((b) => b.status === 'Cancelled');
  const freeStays = rows.filter((b) => b.freeStay);

  const checkInsToday = rows.filter((b) => daysAway(b.checkIn) === 0);
  const checkOutsToday = rows.filter((b) => daysAway(b.checkOut) === 0);
  const newToday = rows.filter((b) => daysAway(b.created) === 0);

  const upcoming = rows
    .filter((b) => {
      const a = daysAway(b.checkIn);
      return a != null && a >= 0 && a <= window;
    })
    .sort((a, b) => (daysAway(a.checkIn) ?? 0) - (daysAway(b.checkIn) ?? 0));

  // One row per date in the window, the way the sheet lays it out.
  const byDate = upcoming.reduce((acc, b) => {
    (acc[b.checkIn] = acc[b.checkIn] || { ins: [], outs: [] }).ins.push(b);
    return acc;
  }, {});
  rows.forEach((b) => {
    const a = daysAway(b.checkOut);
    if (a != null && a >= 0 && a <= window) {
      (byDate[b.checkOut] = byDate[b.checkOut] || { ins: [], outs: [] }).outs.push(b);
    }
  });
  const dated = Object.entries(byDate).sort((a, b) => (day(a[0]) || 0) - (day(b[0]) || 0));

  const queue = rows.filter((b) => b.confirmation && b.confirmation.status !== 'Hotel confirmed');
  const collected = paidOf(rows);
  const outstanding = value(rows) - collected;

  // The masthead already carries bookings, value and collection — the desk
  // adds what is happening today and what is waiting on someone.
  const kpis = [
    { label: 'Check-ins today', value: checkInsToday.length, icon: LogIn },
    { label: 'Check-outs today', value: checkOutsToday.length, icon: LogOut },
    { label: 'Departing soon', value: upcoming.length, icon: CalendarClock, hint: `next ${window} days` },
    {
      label: 'Waiting on hotels',
      value: queue.length,
      icon: BedDouble,
      tone: queue.length ? 'text-rose-600' : 'text-ink-900',
      hint: queue.length ? 'not confirmed yet' : 'all confirmed',
    },
    {
      label: 'Pending collection',
      value: shortInr(outstanding),
      icon: Wallet,
      tone: outstanding ? 'text-amber-600' : 'text-ink-900',
      progress: value(rows) ? Math.round((collected / value(rows)) * 100) : 0,
      hint: `${pendingPay.length} booking${pendingPay.length === 1 ? '' : 's'}`,
    },
    { label: 'Free stays', value: freeStays.length, icon: Gift, hint: 'entitlement used' },
  ];

  const quick = [
    { icon: Plus, label: 'New booking', run: actions.add },
    { icon: Search, label: 'Search booking', run: actions.showList },
    { icon: BedDouble, label: 'Check availability', run: () => actions.note('Opening the inventory to check rooms') },
    { icon: CheckCircle2, label: 'Confirm booking', run: () => actions.note('Pick a booking to confirm') },
    { icon: UserCheck, label: 'Assign booking', run: () => actions.note('Pick a booking to assign') },
    { icon: Wallet, label: 'Collect payment', run: actions.recordPayment },
    { icon: Upload, label: 'Upload voucher', run: () => actions.note('Voucher upload comes with the storage work') },
    { icon: XCircle, label: 'Cancel booking', run: () => actions.note('Open the booking to cancel it') },
    { icon: CalendarClock, label: 'Reschedule booking', run: () => actions.note('Open the booking to move the dates') },
  ];

  const reports = [
    'Daily booking', 'Weekly booking', 'Monthly booking', 'Hotel-wise', 'Destination-wise',
    'Membership-wise', 'Employee-wise', 'Source-wise', 'Free-stay usage', 'Paid booking',
    'Cancellation', 'Reschedule', 'Revenue', 'Vendor payable', 'Commission',
  ];

  return (
    <div className="space-y-6">
      {/* What the desk is working on, and what it can start */}
      <section className="card flex flex-wrap items-center gap-3 px-5 py-3.5">
        <h2 className="font-display text-base font-extrabold text-ink-900">Booking desk</h2>

        <MenuButton
          label="Desk actions"
          icon={Zap}
          variant="action"
          width="w-[250px]"
          items={quick.map((q) => ({ key: q.label, label: q.label, icon: q.icon }))}
          onSelect={(key) => quick.find((q) => q.label === key)?.run()}
        />

        <div className="seg">
          {[7, 15, 30].map((n) => (
            <button key={n} onClick={() => setWindow(n)} className={`seg-item ${window === n ? 'seg-item-on' : ''}`}>
              {n} days
            </button>
          ))}
        </div>

        <p className="num ml-auto text-sm text-ink-500">
          {checkInsToday.length} in · {checkOutsToday.length} out today · {queue.length} waiting on a hotel
        </p>
      </section>

      <KpiRow cols={6} items={kpis} />

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Today's booking activity */}
        <Block title="Today" note="Check-ins, check-outs and bookings made today" wide>
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ['Check-ins', checkInsToday, (b) => `${b.hotel} · ${b.rooms} room${b.rooms > 1 ? 's' : ''} · ${b.pax} guests`],
              ['Check-outs', checkOutsToday, (b) => `${b.hotel} · ${Number(b.amount) - Number(b.paid) > 0 ? `${inr(b.amount - b.paid)} pending` : 'settled'}`],
              ['New bookings', newToday, (b) => `${b.bookingType} · ${inr(b.amount)} · ${b.owner}`],
            ].map(([title, list, line]) => (
              <div key={title}>
                <p className="eyebrow mb-2">
                  {title} <span className="num ml-1 text-ink-900">{list.length}</span>
                </p>
                <ul className="space-y-2">
                  {list.map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => onOpen(b)}
                        className="flex w-full items-center gap-2.5 rounded-xl bg-surface-soft px-3 py-2.5 text-left transition hover:bg-surface-soft/70"
                      >
                        <Avatar name={b.customer} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-ink-900">{b.customer}</span>
                          <span className="block truncate text-xs text-ink-500">{line(b)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                  {list.length === 0 && (
                    <li className="rounded-xl border border-dashed border-ink-900/[0.12] px-3 py-4 text-center text-xs text-ink-400">
                      None today
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </Block>

        {/* Upcoming bookings */}
        <Block
          title="Coming up"
          note={`Arrivals and departures over the next ${window} days`}
        >
          <Rows
            empty={`Nothing in the next ${window} days.`}
            items={dated.map(([date, d]) => ({
              key: date,
              left: (
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink-900">{date}</span>
                  <span className="block text-xs text-ink-500">
                    {d.ins.length} check-in{d.ins.length === 1 ? '' : 's'} · {d.outs.length} check-out
                    {d.outs.length === 1 ? '' : 's'}
                  </span>
                </span>
              ),
              right: (
                <span className="num text-sm font-bold text-brand-700">
                  {value(d.ins) ? inr(value(d.ins)) : '—'}
                </span>
              ),
            }))}
          />
        </Block>

        {/* Free stay management */}
        <Block title="Free stays" note="What each plan gives, and what is left">
          <Rows
            items={memberships.map((p) => {
              const used = rows.filter((b) => b.freeStay && b.membership === p.name).length;
              const total = p.freeStay?.nights ?? 0;
              return {
                key: p.id,
                left: (
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink-900">{p.name}</span>
                    <span className="block text-xs text-ink-500">
                      {total} free night{total === 1 ? '' : 's'} · {p.freeStay?.validity || 'no validity set'}
                    </span>
                  </span>
                ),
                right: (
                  <>
                    <span className="num text-sm text-ink-500">used {used}</span>
                    <Badge tone={total - used > 0 ? 'green' : 'slate'}>{Math.max(0, total - used)} left</Badge>
                  </>
                ),
              };
            })}
          />
          <p className="mt-3 text-xs text-ink-400">
            The entitlement is deducted automatically when a booking is marked as a free stay.
          </p>
        </Block>

        {/* Hotel confirmation queue */}
        <Block
          title="Waiting on hotels"
          note="Send, chase, then upload the confirmation"
          wide
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Booking', 'Hotel', 'Customer', 'Check-in', 'Rooms', 'Vendor', 'Deadline', 'Status', ''].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {queue.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-soft">
                    <td className="num py-2.5 font-bold text-brand-700">
                      <button onClick={() => onOpen(b)}>{b.id}</button>
                    </td>
                    <td className="py-2.5 text-ink-800">{b.hotel}</td>
                    <td className="py-2.5 text-ink-700">{b.customer}</td>
                    <td className="num py-2.5 text-ink-700">{b.checkIn}</td>
                    <td className="num py-2.5 text-ink-700">{b.rooms}</td>
                    <td className="py-2.5 text-ink-700">{b.vendor}</td>
                    <td className="num py-2.5 text-ink-700">{b.confirmation?.deadline}</td>
                    <td className="py-2.5">
                      <Badge tone={confirmTone[b.confirmation?.status] || 'slate'} dot>
                        {b.confirmation?.status}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <span className="flex justify-end gap-1.5">
                        <button className="btn-ghost btn-sm" onClick={() => actions.note(`Sent to ${b.hotel}`)}>
                          <Send size={13} /> Send
                        </button>
                        <a href={`tel:${String(b.vendorContact?.phone || '').replace(/[^\d+]/g, '')}`} className="icon-btn h-8 w-8" title="Call the hotel">
                          <Phone size={13} />
                        </a>
                        <button className="btn-ghost btn-sm" onClick={() => actions.note('Confirmation upload comes with the storage work')}>
                          <Upload size={13} /> Upload
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-ink-500">
                      Every booking is confirmed by the hotel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Statuses: {confirmationStates.join(' · ')}
          </p>
        </Block>

        {/* Payment management */}
        <Block title="Money" note="What has come in, and what is still due" wide>
          <div className="grid gap-3 sm:grid-cols-5">
            <Stat label="Total collection" value={inr(collected)} tone="text-brand-700" />
            <Stat label="Today" value={inr(paidOf(newToday))} />
            <Stat label="Pending" value={inr(outstanding)} tone={outstanding ? 'text-amber-600' : 'text-ink-900'} />
            <Stat label="Part paid" value={pendingPay.length} hint="bookings" />
            <Stat label="Refunded" value={inr(cancellationRequests.reduce((s, c) => s + (c.status === 'Refunded' ? c.refund : 0), 0))} />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Booking', 'Customer', 'Amount', 'Paid', 'Balance', 'Mode', 'Transaction', 'Date', 'Status'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {rows.map((b) => {
                  const balance = Number(b.amount || 0) - Number(b.paid || 0);
                  return (
                    <tr key={b.id} className="hover:bg-surface-soft">
                      <td className="num py-2.5 font-bold text-brand-700">
                        <button onClick={() => onOpen(b)}>{b.id}</button>
                      </td>
                      <td className="py-2.5 text-ink-800">{b.customer}</td>
                      <td className="num py-2.5 text-ink-700">{inr(b.amount)}</td>
                      <td className="num py-2.5 text-ink-700">{inr(b.paid)}</td>
                      <td className={`num py-2.5 font-bold ${balance ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {balance ? inr(balance) : 'Settled'}
                      </td>
                      <td className="py-2.5 text-ink-700">{b.payment?.method || '—'}</td>
                      <td className="num py-2.5 text-ink-500">{b.payment?.txnId || '—'}</td>
                      <td className="num py-2.5 text-ink-500">{b.payment?.date || '—'}</td>
                      <td className="py-2.5">
                        <Badge tone={bookingStatusTone[b.status]} dot>
                          {b.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Block>

        {/* Cancellations and rescheduling */}
        <Block title="Cancellations" note="Charges, refund and who approved it">
          <Rows
            empty="No cancellation requests."
            items={cancellationRequests.map((c) => ({
              key: c.id,
              left: (
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink-900">
                    {c.customer} <span className="num text-xs font-semibold text-ink-400">{c.booking}</span>
                  </span>
                  <span className="block text-xs text-ink-500">
                    {c.reason} · asked {c.requested} · charge {inr(c.charges)} · refund {inr(c.refund)}
                  </span>
                </span>
              ),
              right: <Badge tone={c.status === 'Refunded' ? 'green' : 'amber'}>{c.status}</Badge>,
            }))}
          />
        </Block>

        <Block title="Date changes" note="Original date, new date and what it cost">
          <Rows
            empty="No reschedule requests."
            items={rescheduleRequests.map((r) => ({
              key: r.id,
              left: (
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink-900">
                    {r.customer} <span className="num text-xs font-semibold text-ink-400">{r.booking}</span>
                  </span>
                  <span className="block text-xs text-ink-500">
                    {r.from} → {r.to} · {r.reason} · {r.availability} · extra {inr(r.extra)}
                  </span>
                </span>
              ),
              right: <Badge tone={r.status === 'Rescheduled' ? 'green' : 'amber'}>{r.status}</Badge>,
            }))}
          />
        </Block>

        {/* Who is handling what */}
        <Block title="Who is handling what" note="Assign, reassign or transfer a booking" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Booking', 'Customer', 'Assigned to', 'Role', 'Created by', 'Confirmed by', 'Modified by', ''].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-soft">
                    <td className="num py-2.5 font-bold text-brand-700">
                      <button onClick={() => onOpen(b)}>{b.id}</button>
                    </td>
                    <td className="py-2.5 text-ink-800">{b.customer}</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <Avatar name={b.owner} size="sm" /> <span className="font-semibold text-ink-800">{b.owner}</span>
                      </span>
                    </td>
                    <td className="py-2.5 text-ink-600">{b.assignedRole || '—'}</td>
                    <td className="py-2.5 text-ink-600">{b.handledBy?.created || '—'}</td>
                    <td className="py-2.5 text-ink-600">{b.handledBy?.confirmed || '—'}</td>
                    <td className="py-2.5 text-ink-600">{b.handledBy?.modified || '—'}</td>
                    <td className="py-2.5 text-right">
                      <button className="btn-ghost btn-sm" onClick={() => actions.note(`${b.id} reassigned`)}>
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        {/* Vendors and hotels */}
        <Block title="Hotels and vendors" note="Who we booked with, and what we owe them" wide>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.07] text-left">
                  {['Vendor', 'Hotel', 'Contact', 'Phone', 'Rate plan', 'Rooms booked', 'Confirmation', 'Payable'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.07]">
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-soft">
                    <td className="py-2.5 font-bold text-ink-900">{b.vendor}</td>
                    <td className="py-2.5 text-ink-700">{b.hotel}</td>
                    <td className="py-2.5 text-ink-700">{b.vendorContact?.person || '—'}</td>
                    <td className="num py-2.5 text-ink-600">{b.vendorContact?.phone || '—'}</td>
                    <td className="py-2.5 text-ink-600">{b.vendorContact?.ratePlan || '—'}</td>
                    <td className="num py-2.5 text-ink-700">{b.rooms}</td>
                    <td className="py-2.5">
                      <Badge tone={confirmTone[b.confirmation?.status] || 'slate'}>{b.confirmation?.status}</Badge>
                    </td>
                    <td className="num py-2.5 font-bold text-ink-900">
                      {b.vendorContact?.payable ? inr(b.vendorContact.payable) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        {/* Reports */}
        <Block
          title="Reports"
          note="Pull any of these for the period on screen"
          wide
          action={
            <div className="flex gap-1.5">
              <button className="btn-ghost btn-sm" onClick={actions.exportBookings}>
                <FileSpreadsheet size={14} /> Excel
              </button>
              <button className="btn-ghost btn-sm" onClick={actions.exportBookings}>
                <Download size={14} /> CSV
              </button>
              <button className="btn-ghost btn-sm" onClick={() => actions.note('Opening the print dialog — choose Save as PDF')}>
                <FileText size={14} /> PDF
              </button>
            </div>
          }
        >
          <div className="flex flex-wrap gap-2">
            {reports.map((r) => (
              <button
                key={r}
                className="chip text-ink-600 hover:text-ink-900"
                onClick={() => actions.note(`${r} report ready to export`)}
              >
                <CalendarCheck size={13} /> {r}
              </button>
            ))}
          </div>
        </Block>
      </div>
    </div>
  );
}

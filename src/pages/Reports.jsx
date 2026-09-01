import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Mail,
  CalendarClock,
  Save,
  Plus,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { useApp, byOwner } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import { daysUntil } from '../lib/membership.js';
import {
  enquiryStatuses,
  statusTone,
  salesTrend,
  inr,
  shortInr,
} from '../data/mockData.js';
import { ticketCategories, priorities } from '../data/supportData.js';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import {
  sourceCosts,
  engagementStats,
  messagingStats,
  scheduledReports as seedSchedules,
  reportRecipients,
  reportModules,
  reportMeasures,
} from '../data/reportsData.js';

const SECTIONS = [
  'Overview',
  'Sales',
  'Leads',
  'Membership',
  'Members',
  'Bookings',
  'Revenue & finance',
  'Team',
  'Partners',
  'Customer & support',
  'WhatsApp & automation',
  'Retention & renewal',
  'Report builder',
  'Scheduled reports',
  'Export centre',
];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(11,21,36,0.06)',
  boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
  fontSize: 12,
  fontWeight: 600,
};

/** A table that takes plain rows, so every report reads the same. */
function Table({ head, rows, empty = 'Nothing to report yet.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink-900/[0.07] text-left">
            {head.map((h) => (
              <th key={h} className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/[0.07]">
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-surface-soft">
              {r.cells.map((c, i) => (
                <td key={i} className={`py-2.5 ${i === 0 ? 'font-bold text-ink-900' : 'text-ink-700'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-ink-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Report & Analytics as the client's sheet lays it out: fifteen reports
 * behind one switcher, every one built from what the panel already knows.
 */
export default function Reports() {
  const {
    enquiries, bookings, invoices, payments, team, customers,
    memberSignups, memberships, tickets, partners, automations,
    owner, range, toast,
  } = useApp();

  const [section, setSection] = useState('Overview');
  const [builder, setBuilder] = useState({ module: 'Sales', dimension: 'Salesperson', measure: 'Revenue' });
  const [schedules, setSchedules] = useState(seedSchedules);

  const leads = byOwner(enquiries, owner);
  const trips = byOwner(bookings, owner);
  const num = (v) => <span className="num">{v}</span>;

  // -- The money, once, so every report agrees ------------------------------
  const bookedValue = trips.reduce((s, b) => s + Number(b.amount || 0), 0);
  const collected = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
  const pending = invoices.reduce((s, i) => s + Math.max(0, Number(i.amount || 0) - Number(i.paid || 0)), 0);
  const membershipRevenue = memberSignups.reduce((s, m) => s + Number(m.paid || 0), 0);
  const payout = trips.reduce((s, b) => s + Number(b.vendorContact?.payable || 0), 0);
  const commission = Math.max(0, bookedValue - payout);
  const won = leads.filter((e) => e.status === 'Won');
  const lost = leads.filter((e) => e.status === 'Lost');

  const chart = salesTrend.map((d) => ({ ...d }));

  const exportAs = (name, rows, columns) => {
    downloadCsv(name, rows, columns);
    toast(`${name} exported`);
  };

  const printPdf = () => {
    toast('Opening the print dialog — choose “Save as PDF”', 'info');
    setTimeout(() => window.print(), 400);
  };

  // -- Per-consultant sales performance -------------------------------------
  const salesRows = team.map((m) => {
    const first = m.name.split(' ')[0];
    const mine = leads.filter((e) => e.owner === first);
    const mineWon = mine.filter((e) => e.status === 'Won');
    const revenue = Number(m.revenue || 0);
    const achievement = m.target ? Math.round((revenue / m.target) * 100) : 0;
    return {
      key: m.id,
      name: m.name,
      leads: mine.length,
      calls: m.calls ?? 0,
      connected: m.callDetail?.connected ?? Math.round((m.calls ?? 0) * 0.6),
      qualified: mine.filter((e) => !['New', 'Lost'].includes(e.status)).length,
      presentations: m.presentations ?? 0,
      visits: m.visits ?? 0,
      followUps: m.followUps ?? 0,
      closings: m.bookings ?? 0,
      revenue,
      conversion: mine.length ? Math.round((mineWon.length / mine.length) * 100) : 0,
      avgDeal: mineWon.length ? Math.round(mineWon.reduce((s, e) => s + Number(e.budget || 0), 0) / mineWon.length) : 0,
      target: Number(m.target || 0),
      achievement,
      incentive: achievement >= 100 ? Math.round(revenue * 0.02) : Math.round(revenue * 0.01),
    };
  });

  // -- Lead sources, with what each one costs -------------------------------
  const sources = [...new Set(leads.map((e) => e.source).filter(Boolean))];
  const sourceRows = sources.map((s) => {
    const all = leads.filter((e) => e.source === s);
    const w = all.filter((e) => e.status === 'Won');
    const revenue = w.reduce((sum, e) => sum + Number(e.budget || 0), 0);
    const cost = Number(sourceCosts[s] || 0);
    return {
      source: s,
      leads: all.length,
      qualified: all.filter((e) => !['New', 'Lost'].includes(e.status)).length,
      presentations: all.filter((e) => ['Presentation', 'Visit scheduled', 'Closing', 'Won'].includes(e.status)).length,
      sales: w.length,
      revenue,
      conversion: all.length ? Math.round((w.length / all.length) * 100) : 0,
      cpl: all.length ? Math.round(cost / all.length) : 0,
      cpa: w.length ? Math.round(cost / w.length) : 0,
      roi: cost ? Math.round(((revenue - cost) / cost) * 100) : null,
    };
  });

  // -- Vendors, from what has been booked with them -------------------------
  const vendors = [...new Set(trips.map((b) => b.vendor).filter(Boolean))];

  const sectionBody = {
    Overview: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="The headline numbers" note={`Everything below follows ${range.toLowerCase()}`} wide>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <Stat label="Leads" value={leads.length} hint={`${won.length} won`} />
            <Stat label="Bookings" value={trips.length} />
            <Stat label="Booked value" value={inr(bookedValue)} tone="text-brand-700" />
            <Stat label="Collected" value={inr(collected)} />
            <Stat label="Membership revenue" value={inr(membershipRevenue)} />
            <Stat label="Open complaints" value={tickets.filter((t) => !['Closed', 'Customer confirmed'].includes(t.stage)).length} />
          </div>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(11,21,36,0.07)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#96a2b4' }} dy={6} />
                <YAxis tickLine={false} axisLine={false} width={58} tick={{ fontSize: 11, fill: '#96a2b4' }} tickFormatter={shortInr} />
                <Tooltip formatter={(v, n) => [n === 'Revenue' ? inr(v) : v, n]} labelFormatter={(d) => `Day ${d}`} contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" name="Revenue" fill="#0b8472" radius={[6, 6, 3, 3]} maxBarSize={18} />
                <Line type="monotone" dataKey="target" name="Daily target" stroke="#f0a04b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Block>
      </div>
    ),

    Sales: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Sales funnel" note="Count, share, drop-off and what each stage is worth" wide>
          <Table
            head={['Stage', 'Leads', 'Share', 'Carried from last', 'Drop-off', 'Value']}
            rows={enquiryStatuses
              .filter((s) => s !== 'Lost')
              .map((stage, i, all) => {
                const at = leads.filter((e) => e.status === stage);
                const prev = i === 0 ? null : leads.filter((e) => e.status === all[i - 1]).length;
                const carried = prev ? Math.round((at.length / prev) * 100) : null;
                return {
                  key: stage,
                  cells: [
                    <Badge tone={statusTone[stage]}>{stage}</Badge>,
                    num(at.length),
                    num(`${leads.length ? Math.round((at.length / leads.length) * 100) : 0}%`),
                    carried == null ? '—' : num(`${carried}%`),
                    carried == null ? '—' : num(`${Math.max(0, 100 - carried)}%`),
                    num(inr(at.reduce((s, e) => s + Number(e.budget || 0), 0))),
                  ],
                };
              })}
          />
        </Block>

        <Block
          title="Sales performance"
          note="Every consultant, from leads assigned to incentive earned"
          wide
          action={
            <button
              className="btn-line btn-sm"
              onClick={() =>
                exportAs('smira-club-sales-performance', salesRows, [
                  { key: 'name', header: 'Salesperson' },
                  { key: 'leads', header: 'Leads assigned' },
                  { key: 'calls', header: 'Calls' },
                  { key: 'connected', header: 'Connected' },
                  { key: 'qualified', header: 'Qualified' },
                  { key: 'presentations', header: 'Presentations' },
                  { key: 'visits', header: 'Visits' },
                  { key: 'followUps', header: 'Follow-ups' },
                  { key: 'closings', header: 'Closings' },
                  { key: 'revenue', header: 'Revenue' },
                  { key: 'conversion', header: 'Conversion %' },
                  { key: 'avgDeal', header: 'Average deal' },
                  { key: 'target', header: 'Target' },
                  { key: 'achievement', header: 'Achievement %' },
                  { key: 'incentive', header: 'Incentive' },
                ])
              }
            >
              <Download size={14} /> Export
            </button>
          }
        >
          <Table
            head={['Salesperson', 'Leads', 'Calls', 'Connected', 'Qualified', 'Present.', 'Visits', 'Follow-ups', 'Closings', 'Revenue', 'Conv.', 'Avg deal', 'Target', 'Achieved', 'Incentive']}
            rows={salesRows.map((r) => ({
              key: r.key,
              cells: [
                <span className="flex items-center gap-2.5">
                  <Avatar name={r.name} size="sm" /> {r.name}
                </span>,
                num(r.leads), num(r.calls), num(r.connected), num(r.qualified), num(r.presentations),
                num(r.visits), num(r.followUps), num(r.closings),
                <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
                num(`${r.conversion}%`),
                num(r.avgDeal ? inr(r.avgDeal) : '—'),
                num(r.target ? shortInr(r.target) : '—'),
                <span className={`num font-bold ${r.achievement >= 100 ? 'text-emerald-600' : 'text-ink-700'}`}>
                  {r.target ? `${r.achievement}%` : '—'}
                </span>,
                num(r.incentive ? inr(r.incentive) : '—'),
              ],
            }))}
          />
        </Block>
      </div>
    ),

    Leads: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Lead source report" note="What each channel brings, costs and returns" wide>
          <Table
            head={['Source', 'Leads', 'Qualified', 'Presentations', 'Sales', 'Revenue', 'Conversion', 'Cost per lead', 'Cost per sale', 'ROI']}
            rows={sourceRows.map((r) => ({
              key: r.source,
              cells: [
                r.source, num(r.leads), num(r.qualified), num(r.presentations), num(r.sales),
                <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
                num(`${r.conversion}%`),
                num(r.cpl ? inr(r.cpl) : 'free'),
                num(r.cpa ? inr(r.cpa) : '—'),
                r.roi == null ? '—' : (
                  <span className={`num font-bold ${r.roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{r.roi}%</span>
                ),
              ],
            }))}
          />
        </Block>

        <Block title="Why leads are lost" note="Reason, and what walked away with it">
          <Table
            head={['Reason', 'Leads', 'Value']}
            empty="Nothing lost in this view."
            rows={[...new Set(lost.map((e) => e.lostReason).filter(Boolean))].map((reason) => {
              const at = lost.filter((e) => e.lostReason === reason);
              return {
                key: reason,
                cells: [reason, num(at.length), num(inr(at.reduce((s, e) => s + Number(e.budget || 0), 0)))],
              };
            })}
          />
        </Block>
      </div>
    ),

    Membership: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Membership sales" note="By plan, with what each one earns" wide>
          <Table
            head={['Plan', 'Members', 'Revenue', 'Average value', 'Free nights', 'Discount']}
            rows={memberships.map((p) => {
              const mine = memberSignups.filter((m) => m.planId === p.id);
              const revenue = mine.reduce((s, m) => s + Number(m.paid || 0), 0);
              return {
                key: p.id,
                cells: [
                  p.name, num(mine.length),
                  <span className="num font-bold text-brand-700">{revenue ? inr(revenue) : '—'}</span>,
                  num(mine.length ? inr(Math.round(revenue / mine.length)) : '—'),
                  num(p.freeStay?.nights ?? 0),
                  num(`${p.discount}%`),
                ],
              };
            })}
          />
        </Block>

        <Block title="Membership status" note="Where every membership stands today">
          <Table
            head={['Status', 'Memberships']}
            rows={['Active', 'New', 'Quoted', 'Expired', 'Suspended', 'Cancelled'].map((s) => ({
              key: s,
              cells: [s, num(memberSignups.filter((m) => m.status === s).length)],
            }))}
          />
        </Block>

        <Block title="Movement" note="New against renewals, upgrades and losses">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="New memberships" value={memberSignups.filter((m) => !m.renewal?.stage || m.renewal.stage === '—').length} />
            <Stat label="Renewals in flight" value={memberSignups.filter((m) => m.renewal?.stage && m.renewal.stage !== '—').length} />
            <Stat label="Expiring in 30 days" value={memberSignups.filter((m) => { const l = daysUntil(m.expiresOn); return l != null && l >= 0 && l <= 30; }).length} tone="text-amber-600" />
            <Stat label="Expired" value={memberSignups.filter((m) => (daysUntil(m.expiresOn) ?? 1) < 0).length} tone="text-rose-600" />
            <Stat label="Membership revenue" value={inr(membershipRevenue)} tone="text-brand-700" />
            <Stat
              label="Conversion from signup"
              value={`${memberSignups.length ? Math.round((memberSignups.filter((m) => m.status === 'Active').length / memberSignups.length) * 100) : 0}%`}
            />
          </div>
        </Block>
      </div>
    ),

    Members: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Member growth" note="Who joined, who is active and who is slipping">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Members" value={customers.length} />
            <Stat label="Active memberships" value={memberSignups.filter((m) => m.status === 'Active').length} tone="text-emerald-600" />
            <Stat label="Inactive" value={customers.filter((c) => c.engagement === 'Low engagement' || c.engagement === 'At risk').length} />
            <Stat label="Expiring members" value={memberSignups.filter((m) => { const l = daysUntil(m.expiresOn); return l != null && l >= 0 && l <= 45; }).length} tone="text-amber-600" />
          </div>
        </Block>

        <Block title="Member engagement" note="What members actually do">
          <Table
            head={['Activity', 'Count']}
            rows={[
              ['App logins', engagementStats.logins],
              ['Searches', engagementStats.searches],
              ['Wishlist adds', engagementStats.wishlist],
              ['Booking enquiries', engagementStats.inquiries],
              ['Bookings', engagementStats.bookings],
              ['Offers viewed', engagementStats.offersViewed],
              ['Gifts claimed', engagementStats.giftsClaimed],
              ['Referrals', engagementStats.referrals],
              ['WhatsApp interactions', engagementStats.whatsapp],
            ].map(([label, value]) => ({ key: label, cells: [label, num(value)] }))}
          />
        </Block>

        <Block title="Member value" note="What a member is worth over their life with the agency" wide>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat
              label="Average revenue per member"
              value={customers.length ? inr(Math.round(customers.reduce((s, c) => s + Number(c.spend || 0), 0) / customers.length)) : '—'}
            />
            <Stat
              label="Member lifetime value"
              value={customers.length ? inr(Math.round((customers.reduce((s, c) => s + Number(c.spend || 0), 0) + membershipRevenue) / customers.length)) : '—'}
              tone="text-brand-700"
            />
            <Stat
              label="Repeat booking rate"
              value={`${customers.length ? Math.round((customers.filter((c) => (c.trips || 0) > 1).length / customers.length) * 100) : 0}%`}
            />
            <Stat label="Benefits saving given" value={inr(memberSignups.reduce((s, m) => s + Number(m.saving || 0), 0))} />
          </div>
        </Block>
      </div>
    ),

    Bookings: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Booking overview" note="Every booking by where it stands">
          <Table
            head={['Status', 'Bookings', 'Value']}
            rows={['Confirmed', 'Part paid', 'Pending', 'Completed', 'Cancelled'].map((s) => {
              const at = trips.filter((b) => b.status === s);
              return {
                key: s,
                cells: [s, num(at.length), num(inr(at.reduce((sum, b) => sum + Number(b.amount || 0), 0)))],
              };
            })}
          />
        </Block>

        <Block title="Booking performance" note="By what was sold">
          <Table
            head={['Type', 'Bookings', 'Value', 'Average']}
            rows={[...new Set(trips.map((b) => b.bookingType || 'Package'))].map((t) => {
              const at = trips.filter((b) => (b.bookingType || 'Package') === t);
              const v = at.reduce((s, b) => s + Number(b.amount || 0), 0);
              return {
                key: t,
                cells: [t, num(at.length), num(inr(v)), num(at.length ? inr(Math.round(v / at.length)) : '—')],
              };
            })}
          />
        </Block>

        <Block title="What the bookings are worth" note="After the vendor is paid" wide>
          <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-7">
            <Stat label="Booking value" value={inr(bookedValue)} tone="text-brand-700" />
            <Stat label="Collected" value={inr(collected)} />
            <Stat label="Pending" value={inr(pending)} tone={pending ? 'text-amber-600' : 'text-ink-900'} />
            <Stat label="Vendor payout" value={inr(payout)} />
            <Stat label="Commission" value={inr(commission)} tone="text-emerald-600" />
            <Stat label="Average booking" value={trips.length ? inr(Math.round(bookedValue / trips.length)) : '—'} />
            <Stat
              label="Cancellation value"
              value={inr(trips.filter((b) => b.status === 'Cancelled').reduce((s, b) => s + Number(b.amount || 0), 0))}
            />
          </div>
        </Block>
      </div>
    ),

    'Revenue & finance': (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Where the money comes from" note="Trips and memberships together" wide>
          <Table
            head={['Source', 'Value', 'Collected', 'Pending']}
            rows={[
              {
                key: 'trips',
                cells: ['Trips', num(inr(bookedValue)), num(inr(collected)), num(inr(pending))],
              },
              {
                key: 'membership',
                cells: [
                  'Memberships',
                  num(inr(memberSignups.reduce((s, m) => s + Number(m.amount || 0), 0))),
                  num(inr(membershipRevenue)),
                  num(inr(memberSignups.reduce((s, m) => s + Math.max(0, Number(m.amount || 0) - Number(m.paid || 0)), 0))),
                ],
              },
            ]}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Stat label="Total collected" value={inr(collected + membershipRevenue)} tone="text-brand-700" />
            <Stat label="Vendor payout" value={inr(payout)} />
            <Stat label="Commission kept" value={inr(commission)} tone="text-emerald-600" />
            <Stat label="Receipts recorded" value={payments.length} />
          </div>
        </Block>

        <Block title="Receipts" note="Every payment that has landed" wide>
          <Table
            head={['Receipt', 'Customer', 'Invoice', 'Mode', 'Date', 'Amount', 'Status']}
            rows={payments.map((p) => ({
              key: p.id,
              cells: [p.id, p.customer, p.invoice, p.mode, p.date, num(inr(p.amount)), <Badge tone="green" dot>{p.status}</Badge>],
            }))}
          />
        </Block>
      </div>
    ),

    Team: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Daily team report" note="What the desk did today" wide>
          <Table
            head={['Member', 'Calls', 'Connected', 'Leads', 'Follow-ups', 'Presentations', 'Visits', 'Closings', 'Revenue']}
            rows={salesRows.map((r) => ({
              key: r.key,
              cells: [
                r.name, num(r.calls), num(r.connected), num(r.leads), num(r.followUps),
                num(r.presentations), num(r.visits), num(r.closings),
                <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
              ],
            }))}
          />
          <p className="mt-3 text-xs text-ink-400">
            Management can read this by employee, team, manager, branch or date.
          </p>
        </Block>

        <Block title="Leaderboard" note="Ranked on revenue, then closings" wide>
          <Table
            head={['Rank', 'Member', 'Revenue', 'Closings', 'Conversion', 'Qualified', 'Presentations', 'Follow-ups']}
            rows={[...salesRows]
              .sort((a, b) => b.revenue - a.revenue || b.closings - a.closings)
              .map((r, i) => ({
                key: r.key,
                cells: [
                  <span className="num font-extrabold text-ink-900">#{i + 1}</span>,
                  r.name,
                  <span className="num font-bold text-brand-700">{r.revenue ? inr(r.revenue) : '—'}</span>,
                  num(r.closings), num(`${r.conversion}%`), num(r.qualified), num(r.presentations), num(r.followUps),
                ],
              }))}
          />
        </Block>
      </div>
    ),

    Partners: (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Partner and vendor performance" note="What we booked, what we owe and what we keep" wide>
          <Table
            head={['Vendor', 'Hotels', 'Bookings', 'Booking value', 'Payout', 'Commission', 'Pending confirmations']}
            rows={vendors.map((v) => {
              const mine = trips.filter((b) => b.vendor === v);
              const value = mine.reduce((s, b) => s + Number(b.amount || 0), 0);
              const owed = mine.reduce((s, b) => s + Number(b.vendorContact?.payable || 0), 0);
              return {
                key: v,
                cells: [
                  v,
                  [...new Set(mine.map((b) => b.hotel))].join(', '),
                  num(mine.length),
                  num(inr(value)),
                  num(inr(owed)),
                  <span className="num font-bold text-emerald-600">{inr(Math.max(0, value - owed))}</span>,
                  num(mine.filter((b) => b.confirmation?.status !== 'Hotel confirmed').length),
                ],
              };
            })}
          />
        </Block>

        <Block title="Partners on the books" note="Everyone the agency works with">
          <Table
            head={['Partner', 'Kind', 'Status']}
            rows={(partners || []).map((p) => ({
              key: p.id,
              cells: [p.name, p.kind || p.type || '—', <Badge tone="green">{p.status || 'Active'}</Badge>],
            }))}
          />
        </Block>
      </div>
    ),

    'Customer & support': (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Support report" note="Complaints, and how fast they close">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Total complaints" value={tickets.length} />
            <Stat label="Open" value={tickets.filter((t) => ['New', 'Assigned', 'Waiting'].includes(t.stage)).length} />
            <Stat label="In progress" value={tickets.filter((t) => t.stage === 'In progress').length} />
            <Stat label="Resolved" value={tickets.filter((t) => ['Resolved', 'Customer confirmed', 'Closed'].includes(t.stage)).length} tone="text-emerald-600" />
            <Stat label="Escalated" value={tickets.filter((t) => (t.escalation || 1) > 1).length} tone="text-rose-600" />
            <Stat label="SLA breaches" value={tickets.filter((t) => t.slaState === 'Breached').length} tone="text-rose-600" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat
              label="Average resolution"
              value={(() => {
                const done = tickets.filter((t) => t.resolutionMins);
                return done.length ? `${Math.round(done.reduce((s, t) => s + t.resolutionMins, 0) / done.length / 60)} hrs` : '—';
              })()}
            />
            <Stat
              label="Customer rating"
              value={(() => {
                const rated = tickets.filter((t) => t.rating != null);
                return rated.length ? `${(rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1)}/5` : '—';
              })()}
              tone="text-amber-600"
            />
          </div>
        </Block>

        <Block title="Complaint categories" note="What people complain about most">
          <Table
            head={['Category', 'Tickets', 'Open', 'Priority mix']}
            rows={Object.keys(ticketCategories).map((c) => {
              const at = tickets.filter((t) => t.category === c);
              return {
                key: c,
                cells: [
                  c,
                  num(at.length),
                  num(at.filter((t) => !['Closed', 'Customer confirmed'].includes(t.stage)).length),
                  priorities
                    .map((p) => `${p.key} ${at.filter((t) => t.priority === p.key).length}`)
                    .filter((s) => !s.endsWith(' 0'))
                    .join(' · ') || '—',
                ],
              };
            })}
          />
        </Block>
      </div>
    ),

    'WhatsApp & automation': (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Messages" note="What went out, and what came back">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Sent" value={messagingStats.sent} />
            <Stat label="Delivered" value={messagingStats.delivered} />
            <Stat label="Read" value={messagingStats.read} tone="text-emerald-600" />
            <Stat label="Replied" value={messagingStats.replied} />
            <Stat label="Templates" value={messagingStats.templates} />
            <Stat label="Campaigns" value={messagingStats.campaigns} />
          </div>
        </Block>

        <Block title="Automation" note="Rules the panel runs on its own">
          <Table
            head={['Rule', 'Runs', 'Completed', 'Errors', 'Leads touched', 'Status']}
            empty="No automation rules yet."
            rows={(automations || []).map((a) => ({
              key: a.id,
              cells: [
                a.name, num(a.runs ?? 0), num(a.completed ?? 0),
                <span className={`num ${a.errors ? 'text-rose-600' : 'text-ink-700'}`}>{a.errors ?? 0}</span>,
                num(a.leads ?? 0),
                <Badge tone={a.status === 'Active' ? 'green' : 'slate'} dot>{a.status}</Badge>,
              ],
            }))}
          />
        </Block>
      </div>
    ),

    'Retention & renewal': (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Retention" note="How much of the base stays" wide>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat
              label="Renewal rate"
              value={`${memberSignups.length ? Math.round((memberSignups.filter((m) => m.renewal?.stage === 'Renewed').length / memberSignups.length) * 100) : 0}%`}
            />
            <Stat
              label="Churn rate"
              value={`${memberSignups.length ? Math.round((memberSignups.filter((m) => (daysUntil(m.expiresOn) ?? 1) < 0 || m.renewal?.stage === 'Renewal lost').length / memberSignups.length) * 100) : 0}%`}
              tone="text-rose-600"
            />
            <Stat
              label="Repeat booking rate"
              value={`${customers.length ? Math.round((customers.filter((c) => (c.trips || 0) > 1).length / customers.length) * 100) : 0}%`}
            />
            <Stat label="At risk" value={customers.filter((c) => c.engagement === 'At risk').length} tone="text-amber-600" />
          </div>
        </Block>

        <Block title="Renewal pipeline" note="90 → 60 → 30 → 15 → 7 days, then expired" wide>
          <Table
            head={['Member', 'Plan', 'Expiry', 'Days left', 'Renewal stage', 'Assigned']}
            rows={memberSignups.map((m) => {
              const l = daysUntil(m.expiresOn);
              return {
                key: m.id,
                cells: [
                  m.name, m.plan, m.expiresOn || '—',
                  l == null ? '—' : (
                    <span className={`num font-bold ${l < 0 ? 'text-rose-600' : l <= 45 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {l < 0 ? `lapsed ${Math.abs(l)}d` : `${l} days`}
                    </span>
                  ),
                  m.renewal?.stage && m.renewal.stage !== '—' ? m.renewal.stage : 'Not started',
                  m.expert || '—',
                ],
              };
            })}
          />
        </Block>
      </div>
    ),

    'Report builder': (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Build a report" note="Pick the module, what to break it down by, and what to measure" wide>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Module</label>
              <select
                className="input"
                value={builder.module}
                onChange={(e) =>
                  setBuilder({ module: e.target.value, dimension: reportModules[e.target.value][0], measure: builder.measure })
                }
              >
                {Object.keys(reportModules).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Break down by</label>
              <select
                className="input"
                value={builder.dimension}
                onChange={(e) => setBuilder({ ...builder, dimension: e.target.value })}
              >
                {reportModules[builder.module].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Measure</label>
              <select
                className="input"
                value={builder.measure}
                onChange={(e) => setBuilder({ ...builder, measure: e.target.value })}
              >
                {reportMeasures.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
            {builder.module} → {builder.dimension} → {builder.measure}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-action" onClick={() => toast('Report saved')}>
              <Save size={15} /> Save report
            </button>
            <button
              className="btn-line"
              onClick={() => {
                setSchedules((list) => [
                  ...list,
                  {
                    id: `SCH-0${list.length + 1}`,
                    name: `${builder.module} by ${builder.dimension.toLowerCase()}`,
                    every: 'Weekly',
                    at: 'Monday, 9:00 am',
                    module: builder.module,
                    recipients: ['Admin'],
                    format: 'PDF',
                    status: 'On',
                  },
                ]);
                setSection('Scheduled reports');
                toast('Report scheduled weekly');
              }}
            >
              <CalendarClock size={15} /> Schedule
            </button>
            <button className="btn-line" onClick={() => toast('Report emailed to the admin')}>
              <Mail size={15} /> Email
            </button>
            <button className="btn-line" onClick={() => exportAs('smira-club-custom-report', salesRows, [{ key: 'name', header: builder.dimension }, { key: 'revenue', header: builder.measure }])}>
              <FileSpreadsheet size={15} /> Export Excel
            </button>
            <button className="btn-line" onClick={printPdf}>
              <FileText size={15} /> Export PDF
            </button>
          </div>
        </Block>
      </div>
    ),

    'Scheduled reports': (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block
          title="Reports that send themselves"
          note="Daily, weekly and monthly, to whoever needs them"
          wide
          action={
            <button className="btn-line btn-sm" onClick={() => setSection('Report builder')}>
              <Plus size={14} /> New schedule
            </button>
          }
        >
          <Table
            head={['Report', 'Runs', 'When', 'Module', 'Goes to', 'Format', 'Status']}
            rows={schedules.map((s) => ({
              key: s.id,
              cells: [
                s.name, s.every, s.at, s.module, s.recipients.join(', '), s.format,
                <Badge tone={s.status === 'On' ? 'green' : 'slate'} dot>{s.status}</Badge>,
              ],
            }))}
          />
          <p className="eyebrow mt-4">Who can receive them</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {reportRecipients.map((r) => (
              <span key={r} className="chip text-ink-500">
                {r}
              </span>
            ))}
          </div>
        </Block>
      </div>
    ),

    'Export centre': (
      <div className="grid gap-5 xl:grid-cols-2">
        <Block title="Export centre" note="Every list, as Excel, CSV or PDF" wide>
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {[
              ['Leads', leads, [{ key: 'id', header: 'Lead' }, { key: 'name', header: 'Client' }, { key: 'status', header: 'Stage' }, { key: 'source', header: 'Source' }, { key: 'budget', header: 'Budget' }, { key: 'owner', header: 'Owner' }]],
              ['Bookings', trips, [{ key: 'id', header: 'Booking' }, { key: 'customer', header: 'Customer' }, { key: 'hotel', header: 'Hotel' }, { key: 'checkIn', header: 'Check-in' }, { key: 'amount', header: 'Amount' }, { key: 'status', header: 'Status' }]],
              ['Memberships', memberSignups, [{ key: 'id', header: 'Membership' }, { key: 'name', header: 'Member' }, { key: 'plan', header: 'Plan' }, { key: 'status', header: 'Status' }, { key: 'expiresOn', header: 'Expiry' }, { key: 'paid', header: 'Paid' }]],
              ['Members', customers, [{ key: 'id', header: 'Member' }, { key: 'name', header: 'Name' }, { key: 'phone', header: 'Mobile' }, { key: 'trips', header: 'Trips' }, { key: 'spend', header: 'Spend' }, { key: 'engagement', header: 'Engagement' }]],
              ['Invoices', invoices, [{ key: 'id', header: 'Invoice' }, { key: 'customer', header: 'Customer' }, { key: 'amount', header: 'Amount' }, { key: 'paid', header: 'Paid' }, { key: 'status', header: 'Status' }]],
              ['Complaints', tickets, [{ key: 'id', header: 'Ticket' }, { key: 'customer', header: 'Customer' }, { key: 'category', header: 'Category' }, { key: 'stage', header: 'Status' }, { key: 'slaState', header: 'SLA' }, { key: 'rating', header: 'Rating' }]],
            ].map(([label, rows, columns]) => (
              <li key={label} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink-900">{label}</span>
                  <span className="num block text-xs text-ink-500">{rows.length} rows</span>
                </span>
                <button className="btn-line btn-sm" onClick={() => exportAs(`smira-club-${label.toLowerCase()}`, rows, columns)}>
                  <FileSpreadsheet size={13} /> Excel
                </button>
                <button className="btn-line btn-sm" onClick={() => exportAs(`smira-club-${label.toLowerCase()}`, rows, columns)}>
                  <Download size={13} /> CSV
                </button>
                <button className="btn-line btn-sm" onClick={printPdf}>
                  <FileText size={13} /> PDF
                </button>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    ),
  };

  return (
    <>
      <PageHeader title="Report and analytics" subtitle={`Fifteen reports over the same data · ${range.toLowerCase()}`}>
        <button className="btn-line" onClick={() => setSection('Export centre')}>
          <FileSpreadsheet size={16} /> Export centre
        </button>
        <button className="btn-action" onClick={printPdf}>
          <Download size={16} /> Download PDF
        </button>
      </PageHeader>

      {/* Which report you are reading */}
      <SectionTabs
        className="mb-5"
        items={SECTIONS}
        value={section}
        onChange={setSection}
      />

      {sectionBody[section]}
    </>
  );
}

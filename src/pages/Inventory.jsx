import { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  CalendarDays,
  AlertTriangle,
  Timer,
  X,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useApp } from '../store/AppStore.jsx';
import { downloadCsv } from '../lib/csv.js';
import { inr, shortInr } from '../data/mockData.js';
import Block from '../components/ui/Block.jsx';
import Stat from '../components/ui/Stat.jsx';
import SectionTabs from '../components/ui/SectionTabs.jsx';
import {
  categories,
  rateTypes,
  salesChannels,
  integrationFlow,
  automation,
  inventoryRoles,
  availability,
  holds,
  blackouts,
  contractAlerts,
  membershipTiers,
  rateRules,
  vendorScores,
  inventoryAlertKinds,
  integrations,
} from '../data/inventoryData.js';

const SECTIONS = [
  'Dashboard',
  'All inventory',
  'Availability',
  'Rates',
  'Allocation',
  'Vendors',
  'Reservations',
  'Contracts',
  'Automation',
  'Alerts',
  'Analytics',
  'Import and API',
  'Permissions',
];

const statusTone = { Active: 'green', Limited: 'amber', Low: 'amber', 'Sold out': 'rose', Blocked: 'slate' };

function Table({ head, rows, empty = 'Nothing here yet.' }) {
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
            <tr key={r.key} className={`hover:bg-surface-soft ${r.onClick ? 'cursor-pointer' : ''}`} onClick={r.onClick}>
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

/** What a rate type comes to once its rule is applied to the selling rate. */
const rateFor = (item, rule) => {
  const selling = Number(item.baseRate || 0) + Number(item.markup || 0);
  if (rule.type === 'Member rate') return selling - Number(item.memberDiscount || 0);
  return Math.round(selling * (1 + rule.pct / 100));
};

/** Base rate → markup → selling → member price, the way the sheet spells it. */
function RateLine({ item }) {
  const selling = Number(item.baseRate) + Number(item.markup);
  const member = selling - Number(item.memberDiscount);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {[
        ['Vendor rate', inr(item.baseRate), 'text-ink-700'],
        ['+ markup', inr(item.markup), 'text-emerald-600'],
        ['= selling', inr(selling), 'text-ink-900'],
        ['− member discount', inr(item.memberDiscount), 'text-brand-700'],
        ['= member price', inr(member), 'text-brand-700'],
      ].map(([label, value, tone], i) => (
        <span key={label} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-300">·</span>}
          <span className="text-ink-500">{label}</span>
          <span className={`num font-bold ${tone}`}>{value}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Travel inventory as the client's sheet describes it: what the agency holds,
 * what is free today, what it costs, who it is kept for, and what is about to
 * sell out or expire.
 */
export default function Inventory() {
  const { inventory, update, toast } = useApp();
  const [section, setSection] = useState('Dashboard');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [viewing, setViewing] = useState(null);
  const [ratedItem, setRatedItem] = useState('INV-H01');
  const [calItem, setCalItem] = useState('INV-H01');
  const [month, setMonth] = useState(new Date(2026, 7, 1));
  const [days, setDays] = useState(availability);
  const [blocks, setBlocks] = useState(blackouts);
  const [picked, setPicked] = useState(null);
  const [newRate, setNewRate] = useState('');

  const nameOf = (id) => inventory.find((x) => x.id === id)?.name || id;
  const freeOf = (i) => Math.max(0, Number(i.units || 0) - Number(i.booked || 0) - Number(i.blocked || 0));
  const sellingOf = (i) => Number(i.baseRate || 0) + Number(i.markup || 0);
  const valueOf = (i) => freeOf(i) * sellingOf(i);

  const rows = inventory.filter((i) => {
    if (category !== 'All' && i.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [i.name, i.code, i.destination, i.vendor, i.category].some((v) =>
      String(v || '').toLowerCase().includes(q)
    );
  });

  const active = inventory.filter((i) => i.status !== 'Blocked');
  const lowStock = inventory.filter((i) => freeOf(i) > 0 && freeOf(i) <= 2);
  const soldOut = inventory.filter((i) => freeOf(i) === 0);
  const blocked = inventory.reduce((s, i) => s + Number(i.blocked || 0), 0);
  const waiting = inventory.filter((i) => i.confirmation !== 'Confirmed');
  const missingRate = inventory.filter((i) => !i.baseRate || !i.markup);
  const stockValue = inventory.reduce((s, i) => s + valueOf(i), 0);
  const expiringSoon = contractAlerts.length;

  const vendors = [...new Set(inventory.map((i) => i.vendor))];

  /** How much of an item is already spoken for, tiers plus channels plus buffer. */
  const tierTotal = (i) => Object.values(i.allocation?.tiers || {}).reduce((s, n) => s + Number(n || 0), 0);
  const allocatedOf = (i) =>
    tierTotal(i) +
    Object.values(i.allocation?.channels || {}).reduce((s, n) => s + Number(n || 0), 0) +
    Number(i.allocation?.buffer || 0);

  // -- The availability calendar --------------------------------------------
  const DAY_MS = 86400000;
  const key = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ');
  const dayRow = (d) => days.find((a) => a.item === calItem && a.date === key(d));
  const calStock = inventory.find((i) => i.id === calItem);
  const inBlackout = (d) => {
    const t = d.getTime();
    return blocks.some((b) => {
      if (b.item !== calItem) return false;
      const from = new Date(b.from).getTime();
      const to = new Date(b.to).getTime();
      return !Number.isNaN(from) && !Number.isNaN(to) && t >= from && t <= to;
    });
  };
  const monthGrid = (() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, n) => new Date(start.getTime() + n * DAY_MS));
  })();

  /** Writes a day back, creating the row when the calendar has never held one. */
  const setDay = (patch) => {
    if (!picked) { toast('Pick a day on the calendar first', 'info'); return; }
    const date = key(picked);
    setDays((list) => {
      const at = list.findIndex((a) => a.item === calItem && a.date === date);
      if (at === -1) {
        return [...list, { date, item: calItem, left: freeOf(calStock), rate: sellingOf(calStock), ...patch }];
      }
      return list.map((a, i) => (i === at ? { ...a, ...patch } : a));
    });
  };
  const dayActions = {
    'Increase inventory': () => {
      const row = dayRow(picked);
      setDay({ left: Number(row?.left ?? freeOf(calStock)) + 1, note: '' });
      toast('One more unit on sale that day');
    },
    'Reduce inventory': () => {
      const row = dayRow(picked);
      setDay({ left: Math.max(0, Number(row?.left ?? freeOf(calStock)) - 1) });
      toast('One unit taken off that day');
    },
    'Block dates': () => { setDay({ left: 0, note: 'Blocked' }); toast('Nothing can be sold that day'); },
    'Open dates': () => { setDay({ left: freeOf(calStock), note: '' }); toast('Back on sale'); },
    'Change rate': () => {
      if (!newRate) { toast('Type the new rate first', 'info'); return; }
      setDay({ rate: Number(newRate) });
      setNewRate('');
      toast('Rate changed for that day');
    },
    'Add blackout': () => {
      if (!picked) { toast('Pick a day first', 'info'); return; }
      const date = key(picked);
      setBlocks((list) => [...list, { item: calItem, from: date, to: date, reason: 'Added from the calendar' }]);
      setDay({ left: 0, note: 'Blackout' });
      toast('Blackout added');
    },
    'Override vendor availability': () => {
      setDay({ left: Number(calStock?.units || 0), note: 'Overridden' });
      toast("The vendor's number has been overridden");
    },
  };

  // -- What needs somebody's attention right now ----------------------------
  const alerts = [
    ...soldOut.map((i) => ({ key: `so-${i.id}`, kind: 'Sold out', item: i.name, level: 'critical', note: 'Nothing left to sell' })),
    ...lowStock.map((i) => ({ key: `lo-${i.id}`, kind: 'Low availability', item: i.name, level: 'warning', note: `${freeOf(i)} left` })),
    ...missingRate.map((i) => ({ key: `mr-${i.id}`, kind: 'Missing rate', item: i.name, level: 'critical', note: 'Cannot be sold without a rate' })),
    ...waiting.map((i) => ({ key: `wv-${i.id}`, kind: 'Waiting on the vendor', item: i.name, level: 'warning', note: i.confirmation })),
    ...contractAlerts.map((c, n) => ({
      key: `ca-${n}`, kind: c.kind, item: c.item === '—' ? 'Across the panel' : nameOf(c.item),
      level: 'warning', note: `due ${c.on}`,
    })),
    ...inventory
      .filter((i) => allocatedOf(i) >= Number(i.units || 0))
      .map((i) => ({ key: `al-${i.id}`, kind: 'Allocation used up', item: i.name, level: 'warning', note: 'Every unit is spoken for' })),
    ...blocks.map((b, n) => ({ key: `bl-${n}`, kind: 'Blackout', item: nameOf(b.item), level: 'info', note: `${b.from} to ${b.to}` })),
    ...holds
      .filter((h) => h.minutesLeft <= 5)
      .map((h) => ({ key: `hd-${h.id}`, kind: 'Hold about to time out', item: nameOf(h.item), level: 'critical', note: `${h.minutesLeft} min left` })),
  ];

  const exportInventory = () =>
    downloadCsv(
      'smira-club-travel-inventory',
      inventory.map((i) => ({
        ...i,
        free: freeOf(i),
        selling: sellingOf(i),
        member: sellingOf(i) - Number(i.memberDiscount || 0),
      })),
      [
        { key: 'id', header: 'Item' },
        { key: 'category', header: 'Category' },
        { key: 'name', header: 'Name' },
        { key: 'code', header: 'Code' },
        { key: 'destination', header: 'Destination' },
        { key: 'grade', header: 'Category or grade' },
        { key: 'vendor', header: 'Vendor' },
        { key: 'units', header: 'Units' },
        { key: 'booked', header: 'Booked' },
        { key: 'blocked', header: 'Blocked' },
        { key: 'free', header: 'Available' },
        { key: 'baseRate', header: 'Vendor rate' },
        { key: 'markup', header: 'Markup' },
        { key: 'selling', header: 'Selling rate' },
        { key: 'member', header: 'Member price' },
        { key: 'status', header: 'Status' },
        { key: 'contractEnds', header: 'Contract ends' },
      ]
    );

  const body = {
    Dashboard: (
      <>
        <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <section className="card relative overflow-hidden p-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Inventory value</p>
              <p className="num mt-2 font-display text-4xl font-extrabold leading-none text-ink-900">{inr(stockValue)}</p>
              <p className="mt-1.5 text-sm text-ink-500">
                {inventory.reduce((s, i) => s + freeOf(i), 0)} units free across {inventory.length} items
              </p>
              <div className="mt-5">
                <p className="flex items-baseline justify-between text-xs font-semibold text-ink-500">
                  <span>Sold or held</span>
                  <span className="num">
                    {Math.round(
                      (inventory.reduce((s, i) => s + Number(i.booked || 0), 0) /
                        Math.max(1, inventory.reduce((s, i) => s + Number(i.units || 0), 0))) *
                        100
                    )}
                    %
                  </span>
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{
                      width: `${Math.round(
                        (inventory.reduce((s, i) => s + Number(i.booked || 0), 0) /
                          Math.max(1, inventory.reduce((s, i) => s + Number(i.units || 0), 0))) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Running out</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Sold out', value: soldOut.length, tone: 'bg-rose-500' },
                { label: 'Two units or fewer', value: lowStock.length, tone: 'bg-amber-500' },
                { label: 'Blocked', value: blocked, tone: 'bg-ink-900/25' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Waiting on someone</p>
            <ul className="mt-3 space-y-3">
              {[
                { label: 'Vendor confirmation', value: waiting.length, tone: 'bg-amber-500' },
                { label: 'Missing a rate', value: missingRate.length, tone: 'bg-rose-500' },
                { label: 'Contracts expiring', value: expiringSoon, tone: 'bg-sky-500' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${r.tone}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-ink-700">{r.label}</span>
                  <span className="num font-display text-2xl font-extrabold text-ink-900">{r.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="card grid divide-y divide-ink-900/[0.07] sm:grid-cols-2 sm:divide-y-0 xl:col-span-2 sm:grid-cols-2 lg:grid-cols-5 sm:[&>*]:border-ink-900/[0.07] lg:[&>*]:border-l lg:[&>*:nth-child(5n+1)]:border-l-0">
          {[
            { label: 'Total inventory', value: inventory.reduce((s, i) => s + Number(i.units || 0), 0), hint: `${inventory.length} items` },
            { label: 'Active inventory', value: active.length, hint: 'on sale' },
            { label: 'Available today', value: inventory.reduce((s, i) => s + freeOf(i), 0), hint: 'units free' },
            { label: 'Low availability', value: lowStock.length, hint: 'two units or fewer' },
            { label: 'Sold or booked', value: inventory.reduce((s, i) => s + Number(i.booked || 0), 0) },
            { label: 'Blocked inventory', value: blocked, hint: 'held back' },
            { label: 'Expiring inventory', value: expiringSoon, hint: 'contracts and rates' },
            { label: 'Inventory value', value: shortInr(stockValue), hint: 'at selling rate' },
            { label: 'Pending vendor confirmation', value: waiting.length },
            { label: 'Unmapped or missing rate', value: missingRate.length },
          ].map((g) => (
            <div key={g.label} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{g.label}</p>
              <p className="num mt-1.5 font-display text-2xl font-extrabold text-ink-900">{g.value}</p>
              {g.hint && <p className="mt-0.5 text-xs text-ink-400">{g.hint}</p>}
            </div>
          ))}
        </div>

        <Block title="What the agency holds" note="Every category, and what has to be managed for it" wide>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {categories.map((c) => {
              const mine = inventory.filter((i) => i.category === c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => { setCategory(mine.length ? c.key : 'All'); setSection('All inventory'); }}
                  className="rounded-xl border border-ink-900/[0.07] px-4 py-3 text-left transition hover:bg-surface-soft"
                >
                  <p className="text-lg">{c.icon}</p>
                  <p className="mt-1 text-sm font-bold text-ink-900">{c.key}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{c.manage}</p>
                  <p className="num mt-1.5 text-xs font-bold text-brand-700">
                    {mine.length ? `${mine.reduce((s, i) => s + freeOf(i), 0)} free` : 'nothing held yet'}
                  </p>
                </button>
              );
            })}
          </div>
        </Block>

        <Block title="How a booking eats into stock" note="Nothing is deducted until the money lands" wide>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            {integrationFlow.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                {i > 0 && <span className="text-ink-300">→</span>}
                <span className="rounded-lg bg-surface-soft px-2.5 py-1.5 font-semibold text-ink-700">{step}</span>
              </span>
            ))}
          </div>
        </Block>
      </>
    ),

    'All inventory': (
      <Block
        title="All inventory"
        note="Click an item to open what is inside it"
        wide
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input h-9 w-44 py-0 pl-9 text-sm"
                placeholder="Search inventory…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="input h-9 w-auto py-0 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c.key}>{c.key}</option>
              ))}
            </select>
            <button className="btn-line btn-sm" onClick={exportInventory}>
              <Download size={14} /> Export
            </button>
          </div>
        }
      >
        <Table
          head={['Item', 'Category', 'Destination', 'Grade', 'Units', 'Booked', 'Available', 'Vendor rate', 'Selling', 'Member', 'Vendor', 'Status']}
          empty="No inventory matches this view."
          rows={rows.map((i) => ({
            key: i.id,
            onClick: () => setViewing(i),
            cells: [
              <span>
                {i.name}
                <span className="num block text-xs text-ink-400">{i.code}</span>
              </span>,
              i.category,
              i.destination,
              i.grade,
              <span className="num">{i.units}</span>,
              <span className="num">{i.booked}</span>,
              <span className={`num font-bold ${freeOf(i) === 0 ? 'text-rose-600' : freeOf(i) <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {freeOf(i)}
              </span>,
              <span className="num">{inr(i.baseRate)}</span>,
              <span className="num font-bold text-ink-900">{inr(sellingOf(i))}</span>,
              <span className="num text-brand-700">{inr(sellingOf(i) - Number(i.memberDiscount || 0))}</span>,
              i.vendor,
              <Badge tone={freeOf(i) === 0 ? 'rose' : statusTone[i.status] || 'slate'} dot>
                {freeOf(i) === 0 ? 'Sold out' : i.status}
              </Badge>,
            ],
          }))}
        />
      </Block>
    ),

    Availability: (
      <>
        <Block
          title="Availability calendar"
          note="Day by day, what is left and what it costs — click a day to work on it"
          wide
          action={
            <div className="flex flex-wrap items-center gap-2">
              <select className="input h-9 w-auto py-0 text-sm" value={calItem} onChange={(e) => { setCalItem(e.target.value); setPicked(null); }}>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              <button className="btn-line btn-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                Previous
              </button>
              <span className="num min-w-[110px] text-center text-sm font-bold text-ink-900">
                {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <button className="btn-line btn-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                Next
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-7 gap-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <p key={d} className="pb-1 text-center text-[11px] font-bold uppercase tracking-wide text-ink-400">{d}</p>
            ))}
            {monthGrid.map((d) => {
              const thisMonth = d.getMonth() === month.getMonth();
              const row = dayRow(d);
              const black = inBlackout(d);
              const left = row ? Number(row.left) : thisMonth ? freeOf(calStock) : null;
              const on = picked && key(picked) === key(d);
              const tone = black || left === 0
                ? 'border-rose-200 bg-rose-50'
                : left != null && left <= 2
                  ? 'border-amber-200 bg-amber-50'
                  : row
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-ink-900/[0.07]';
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setPicked(d)}
                  className={`min-h-[74px] rounded-lg border p-2 text-left transition ${tone} ${
                    thisMonth ? '' : 'opacity-40'
                  } ${on ? 'ring-2 ring-brand-500' : 'hover:brightness-[0.98]'}`}
                >
                  <span className="num block text-[11px] font-bold text-ink-500">{d.getDate()}</span>
                  {thisMonth && (
                    <>
                      <span className={`num block text-sm font-extrabold ${
                        black || left === 0 ? 'text-rose-600' : left <= 2 ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {black ? 'Blackout' : left === 0 ? 'Sold out' : `${left} left`}
                      </span>
                      {row?.rate ? <span className="num block text-[10px] text-ink-500">{shortInr(row.rate)}</span> : null}
                      {row?.note ? <span className="block truncate text-[10px] text-ink-400">{row.note}</span> : null}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <p className="eyebrow mt-5">
            {picked ? `Working on ${key(picked)} · ${calStock?.name}` : 'Pick a day, then act on it'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {Object.keys(dayActions).map((a) => (
              <button
                key={a}
                className="chip text-ink-600 hover:text-ink-900 disabled:opacity-40"
                disabled={!picked}
                onClick={dayActions[a]}
              >
                <CalendarDays size={13} /> {a}
              </button>
            ))}
            <input
              className="input h-8 w-28 py-0 text-sm"
              type="number"
              placeholder="New rate"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
            />
          </div>
        </Block>

        <Block title="Blackout dates" note="Nothing can be sold on these" wide>
          <Table
            head={['Item', 'From', 'To', 'Why']}
            rows={blocks.map((b, i) => ({
              key: `${b.item}-${i}`,
              cells: [nameOf(b.item), <span className="num">{b.from}</span>, <span className="num">{b.to}</span>, b.reason],
            }))}
          />
        </Block>
      </>
    ),

    Rates: (
      <>
        <Block title="Rate engine" note="One vendor rate, everything else worked out from it" wide>
          <ul className="space-y-3">
            {inventory.map((i) => (
              <li key={i.id} className="rounded-xl border border-ink-900/[0.07] px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-bold text-ink-900">{i.name}</p>
                  <Badge tone="teal">{i.category}</Badge>
                </div>
                <div className="mt-2">
                  <RateLine item={i} />
                </div>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          title="Every rate type, worked out"
          note="One vendor rate at the top, ten rates underneath it"
          wide
          action={
            <select className="input h-9 w-auto py-0 text-sm" value={ratedItem} onChange={(e) => setRatedItem(e.target.value)}>
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          }
        >
          {(() => {
            const item = inventory.find((i) => i.id === ratedItem) || inventory[0];
            if (!item) return <p className="text-sm text-ink-500">Nothing to price yet.</p>;
            const selling = sellingOf(item);
            return (
              <>
                <div className="mb-4">
                  <RateLine item={item} />
                </div>
                <Table
                  head={['Rate type', 'Rule', 'Applies to', 'Rate', 'Against selling']}
                  rows={rateRules.map((rule) => {
                    const value = rateFor(item, rule);
                    const diff = selling ? Math.round(((value - selling) / selling) * 100) : 0;
                    return {
                      key: rule.type,
                      cells: [
                        rule.type,
                        <span className="text-ink-500">{rule.note}</span>,
                        rule.on,
                        <span className="num font-bold text-ink-900">{inr(value)}</span>,
                        <span className={`num font-bold ${diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-emerald-600' : 'text-ink-400'}`}>
                          {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : 'base'}
                        </span>,
                      ],
                    };
                  })}
                />
              </>
            );
          })()}
          <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
            A rate works like this: vendor charges ₹4,000, the agency adds ₹800, so it sells at ₹4,800 — and a member
            takes ₹500 off, paying ₹4,300.
          </p>
        </Block>
      </>
    ),

    Allocation: (
      <Block
        title="Who the stock is kept for"
        note="Reserving by membership and channel stops one of them taking everything"
        wide
      >
        <p className="eyebrow mb-2">Kept for each membership</p>
        <Table
          head={['Item', 'Units', ...membershipTiers, 'Members total']}
          rows={inventory.map((i) => {
            const tiers = i.allocation?.tiers || {};
            return {
              key: i.id,
              cells: [
                i.name,
                <span className="num">{i.units}</span>,
                ...membershipTiers.map((t) => (
                  <span key={t} className={`num ${tiers[t] ? '' : 'text-ink-300'}`}>{tiers[t] ?? 0}</span>
                )),
                <span className="num font-bold text-brand-700">{tierTotal(i)}</span>,
              ],
            };
          })}
        />

        <p className="eyebrow mb-2 mt-6">Kept for each channel</p>
        <Table
          head={['Item', 'Units', ...salesChannels, 'Buffer', 'Unallocated']}
          rows={inventory.map((i) => {
            const ch = i.allocation?.channels || {};
            const left = Math.max(0, Number(i.units || 0) - allocatedOf(i));
            return {
              key: i.id,
              cells: [
                i.name,
                <span className="num">{i.units}</span>,
                ...salesChannels.map((c) => (
                  <span key={c} className={`num ${ch[c] ? '' : 'text-ink-300'}`}>{ch[c] ?? 0}</span>
                )),
                <span className="num">{i.allocation?.buffer ?? 0}</span>,
                <span className={`num font-bold ${left > 0 ? 'text-emerald-600' : 'text-ink-400'}`}>{left}</span>,
              ],
            };
          })}
        />
        <p className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
          Reserving by tier and by channel is what stops one of them consuming everything — an emergency buffer is
          held back on top.
        </p>
      </Block>
    ),

    Vendors: (
      <>
        <Block title="Vendor dashboard" note="Every item belongs to somebody, and this is what they owe and are owed" wide>
          <Table
            head={['Vendor', 'Items supplied', 'Active contracts', 'Units', 'Available', 'Bookings', 'Cancellations', 'Stock value', 'Vendor payable', 'Pending confirmation']}
            rows={vendors.map((v) => {
              const mine = inventory.filter((i) => i.vendor === v);
              const score = vendorScores[v] || {};
              const waitingHere = mine.filter((i) => i.confirmation !== 'Confirmed').length;
              return {
                key: v,
                cells: [
                  v,
                  <span className="num">{mine.length}</span>,
                  <span className="num">{score.activeContracts ?? '—'}</span>,
                  <span className="num">{mine.reduce((s, i) => s + Number(i.units || 0), 0)}</span>,
                  <span className="num font-bold text-emerald-600">{mine.reduce((s, i) => s + freeOf(i), 0)}</span>,
                  <span className="num">{mine.reduce((s, i) => s + Number(i.booked || 0), 0)}</span>,
                  <span className={`num ${score.cancellations ? 'text-rose-600' : 'text-ink-400'}`}>{score.cancellations ?? 0}</span>,
                  <span className="num font-bold text-brand-700">{shortInr(mine.reduce((s, i) => s + valueOf(i), 0))}</span>,
                  <span className="num">{score.payable ? inr(score.payable) : '—'}</span>,
                  waitingHere ? (
                    <Badge tone="amber" dot>{waitingHere} waiting</Badge>
                  ) : (
                    <Badge tone="green" dot>All confirmed</Badge>
                  ),
                ],
              };
            })}
          />
        </Block>

        <Block title="Vendor performance" note="The five things the sheet scores a supplier on" wide>
          <Table
            head={['Vendor', 'Confirmation rate', 'Response time', 'Cancellation rate', 'Price competitiveness', 'Booking success', 'Contract ends']}
            rows={vendors.map((v) => {
              const score = vendorScores[v] || {};
              const mine = inventory.filter((i) => i.vendor === v);
              return {
                key: v,
                cells: [
                  v,
                  <span className={`num font-bold ${(score.confirmationRate ?? 0) >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {score.confirmationRate != null ? `${score.confirmationRate}%` : '—'}
                  </span>,
                  <span className={`num ${(score.responseMins ?? 0) > 30 ? 'font-bold text-rose-600' : 'text-ink-700'}`}>
                    {score.responseMins != null ? `${score.responseMins} min` : '—'}
                  </span>,
                  <span className={`num ${(score.cancellationRate ?? 0) > 5 ? 'font-bold text-rose-600' : 'text-ink-700'}`}>
                    {score.cancellationRate != null ? `${score.cancellationRate}%` : '—'}
                  </span>,
                  score.priceIndex == null ? '—' : (
                    <span className={`num font-bold ${score.priceIndex <= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {score.priceIndex <= 100 ? `${100 - score.priceIndex}% under market` : `${score.priceIndex - 100}% over market`}
                    </span>
                  ),
                  <span className="num font-bold text-ink-900">
                    {score.bookingSuccess != null ? `${score.bookingSuccess}%` : '—'}
                  </span>,
                  <span className="num">{mine[0]?.contractEnds || '—'}</span>,
                ],
              };
            })}
          />
        </Block>
      </>
    ),

    Reservations: (
      <Block title="Held, not sold" note="Stock is only deducted once the payment lands" wide>
        <Table
          head={['Hold', 'Item', 'Units', 'For', 'Channel', 'Held for', 'Time left', 'Stage']}
          empty="Nothing is on hold."
          rows={holds.map((h) => ({
            key: h.id,
            cells: [
              <span className="num">{h.id}</span>,
              nameOf(h.item),
              <span className="num">{h.units}</span>,
              h.customer,
              h.channel,
              <span className="num">{h.heldFor} min</span>,
              <span className={`num font-bold ${h.minutesLeft <= 5 ? 'text-rose-600' : 'text-amber-600'}`}>
                {h.minutesLeft} min
              </span>,
              <Badge tone="amber" dot>
                {h.stage}
              </Badge>,
            ],
          }))}
        />
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
          <Timer size={15} className="shrink-0 text-ink-400" />
          Payment received turns a hold into a booking; the timer running out puts the units straight back on sale.
        </p>
      </Block>
    ),

    Contracts: (
      <Block title="What is about to expire" note="Contracts, rates and credentials that need renewing" wide>
        <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
          {contractAlerts.map((c, i) => (
            <li key={`${c.kind}-${i}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <AlertTriangle size={15} className="shrink-0 text-amber-500" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink-900">{c.kind}</span>
                <span className="block text-xs text-ink-500">{c.item === '—' ? 'Across the panel' : nameOf(c.item)}</span>
              </span>
              <span className="num text-sm font-semibold text-ink-700">{c.on}</span>
              <button className="btn-line btn-sm" onClick={() => toast(`Renewal started for ${c.kind.toLowerCase()}`)}>
                Renew
              </button>
            </li>
          ))}
        </ul>
      </Block>
    ),

    Automation: (
      <Block title="What runs on its own" note="Nobody has to remember any of this" wide>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(automation).map(([group, list]) => (
            <div key={group} className="rounded-xl border border-ink-900/[0.07] p-4">
              <p className="eyebrow">{group}</p>
              <ul className="mt-2 space-y-1.5">
                {list.map((x) => (
                  <li key={x} className="text-sm text-ink-700">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>
    ),

    Alerts: (
      <Block title="What needs somebody now" note="Raised the moment the panel notices it" wide>
        <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
          {alerts.map((a) => (
            <li key={a.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  a.level === 'critical' ? 'bg-rose-100 text-rose-700' : a.level === 'info' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <AlertTriangle size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink-900">{a.kind}</span>
                <span className="block text-xs text-ink-500">{a.item} · {a.note}</span>
              </span>
              <Badge tone={a.level === 'critical' ? 'rose' : a.level === 'info' ? 'sky' : 'amber'}>{a.level}</Badge>
            </li>
          ))}
          {alerts.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing needs attention.</li>}
        </ul>
        <p className="eyebrow mt-4">What the panel watches for</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {inventoryAlertKinds.map((k) => <span key={k} className="chip text-ink-500">{k}</span>)}
        </div>
      </Block>
    ),

    Analytics: (
      <>
        <Block title="How hard the stock is working" note="Every category, and how much of it is sold" wide>
          <Table
            head={['Category', 'Items', 'Units', 'Booked', 'Blocked', 'Available', 'Utilisation', 'Stock value']}
            rows={categories.map((c) => {
              const mine = inventory.filter((i) => i.category === c.key);
              const units = mine.reduce((s, i) => s + Number(i.units || 0), 0);
              const booked = mine.reduce((s, i) => s + Number(i.booked || 0), 0);
              return {
                key: c.key,
                cells: [
                  `${c.icon} ${c.key}`,
                  <span className="num">{mine.length}</span>,
                  <span className="num">{units}</span>,
                  <span className="num">{booked}</span>,
                  <span className="num">{mine.reduce((s, i) => s + Number(i.blocked || 0), 0)}</span>,
                  <span className="num font-bold text-emerald-600">{mine.reduce((s, i) => s + freeOf(i), 0)}</span>,
                  <span className="num font-bold text-ink-900">{units ? `${Math.round((booked / units) * 100)}%` : '—'}</span>,
                  <span className="num font-bold text-brand-700">{shortInr(mine.reduce((s, i) => s + valueOf(i), 0))}</span>,
                ],
              };
            })}
          />
        </Block>

        <Block title="By destination" note="Where the stock actually sits">
          <Table
            head={['Destination', 'Items', 'Available', 'Value']}
            rows={[...new Set(inventory.map((i) => i.destination))].map((d) => {
              const mine = inventory.filter((i) => i.destination === d);
              return {
                key: d,
                cells: [
                  d,
                  <span className="num">{mine.length}</span>,
                  <span className="num font-bold text-emerald-600">{mine.reduce((s, i) => s + freeOf(i), 0)}</span>,
                  <span className="num font-bold text-brand-700">{shortInr(mine.reduce((s, i) => s + valueOf(i), 0))}</span>,
                ],
              };
            })}
          />
        </Block>

        <Block title="Margin by item" note="What is kept on every unit sold">
          <Table
            head={['Item', 'Vendor rate', 'Selling', 'Margin', 'Margin %']}
            rows={[...inventory]
              .sort((a, b) => Number(b.markup || 0) - Number(a.markup || 0))
              .map((i) => ({
                key: i.id,
                cells: [
                  i.name,
                  <span className="num">{inr(i.baseRate)}</span>,
                  <span className="num font-bold text-ink-900">{inr(sellingOf(i))}</span>,
                  <span className="num font-bold text-emerald-600">{inr(Number(i.markup || 0))}</span>,
                  <span className="num">{sellingOf(i) ? `${Math.round((Number(i.markup || 0) / sellingOf(i)) * 100)}%` : '—'}</span>,
                ],
              }))}
          />
        </Block>
      </>
    ),

    'Import and API': (
      <>
        <Block title="Import and export" note="Bring stock in as a sheet, take it out the same way" wide>
          <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
            {categories.map((c) => {
              const mine = inventory.filter((i) => i.category === c.key);
              return (
                <li key={c.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink-900">{c.icon} {c.key}</span>
                    <span className="num block text-xs text-ink-500">{mine.length} items · {mine.reduce((s, i) => s + Number(i.units || 0), 0)} units</span>
                  </span>
                  <button className="btn-line btn-sm" onClick={() => toast(`Upload the ${c.key.toLowerCase()} sheet`, 'info')}>
                    <Upload size={13} /> Import
                  </button>
                  <button
                    className="btn-line btn-sm"
                    onClick={() => {
                      downloadCsv(`smira-club-${c.key.toLowerCase().replace(/ /g, '-')}`, mine, [
                        { key: 'id', header: 'Item' },
                        { key: 'name', header: 'Name' },
                        { key: 'destination', header: 'Destination' },
                        { key: 'units', header: 'Units' },
                        { key: 'booked', header: 'Booked' },
                        { key: 'baseRate', header: 'Vendor rate' },
                        { key: 'markup', header: 'Markup' },
                        { key: 'vendor', header: 'Vendor' },
                        { key: 'status', header: 'Status' },
                      ]);
                      toast(`${c.key} exported`);
                    }}
                  >
                    <Download size={13} /> Export
                  </button>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block title="Feeds the panel pulls from" note="Where availability and rates come in from" wide>
          <Table
            head={['Integration', 'What it carries', 'Status', 'Last sync', 'Credentials expire', '']}
            rows={integrations.map((x) => ({
              key: x.name,
              cells: [
                x.name,
                x.kind,
                <Badge tone={x.status === 'Connected' ? 'green' : x.status === 'Needs attention' ? 'amber' : 'slate'} dot>
                  {x.status}
                </Badge>,
                <span className="num text-ink-500">{x.lastSync}</span>,
                <span className="num">{x.expires}</span>,
                <button className="btn-line btn-sm" onClick={() => toast(`${x.name} sync started`)}>Sync now</button>,
              ],
            }))}
          />
        </Block>
      </>
    ),

    Permissions: (
      <Block title="Who can touch what" note="Inventory access follows the role" wide>
        <Table
          head={['Role', 'What they can reach']}
          rows={inventoryRoles.map((r) => ({
            key: r.role,
            cells: [
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand-600" /> {r.role}
              </span>,
              r.access,
            ],
          }))}
        />
      </Block>
    ),
  };

  return (
    <>
      <PageHeader title="Travel inventory" subtitle="What the agency holds, what it costs and what is left">
        <button className="btn-line" onClick={() => toast('Import opens with the file work')}>
          <Upload size={16} /> Import
        </button>
        <button className="btn-line" onClick={exportInventory}>
          <Download size={16} /> Export
        </button>
        <button className="btn-action" onClick={() => toast('Pick a category to add stock to')}>
          <Plus size={16} /> Add inventory
        </button>
      </PageHeader>

      <SectionTabs
        className="mb-5"
        items={SECTIONS}
        value={section}
        onChange={setSection}
      />

      <div className="grid gap-5 xl:grid-cols-2">{body[section]}</div>

      {/* What is inside one item */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-ink-900/40 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <aside className="flex h-full w-full max-w-[900px] flex-col bg-surface-base shadow-lift">
            <header className="flex flex-wrap items-center gap-2.5 border-b border-ink-900/[0.07] bg-white px-5 py-3.5">
              <h2 className="font-display text-lg font-extrabold text-ink-900">{viewing.name}</h2>
              <Badge tone="teal">{viewing.category}</Badge>
              <Badge tone={statusTone[viewing.status] || 'slate'} dot>
                {viewing.status}
              </Badge>
              <button onClick={() => setViewing(null)} className="icon-btn ml-auto h-8 w-8">
                <X size={15} />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
              <section className="card p-5">
                <h3 className="font-display text-base font-extrabold text-ink-900">Basic information</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Stat label="Code" value={viewing.code} />
                  <Stat label="Grade" value={viewing.grade} />
                  <Stat label="Destination" value={viewing.destination} />
                  <Stat label="Check-in" value={viewing.checkIn} />
                  <Stat label="Check-out" value={viewing.checkOut} />
                  <Stat label="Contact" value={viewing.contact} />
                </div>
                <p className="mt-4 text-sm text-ink-700">{viewing.description}</p>
                <p className="mt-2 text-sm text-ink-500">
                  {viewing.address} · {viewing.gps}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(viewing.amenities || []).map((a) => (
                    <span key={a} className="chip text-ink-600">
                      {a}
                    </span>
                  ))}
                </div>
              </section>

              <section className="card p-5">
                <h3 className="font-display text-base font-extrabold text-ink-900">Rates</h3>
                <div className="mt-3">
                  <RateLine item={viewing} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Stat label="Units held" value={viewing.units} />
                  <Stat label="Booked" value={viewing.booked} />
                  <Stat label="Blocked" value={viewing.blocked} />
                  <Stat
                    label="Available"
                    value={freeOf(viewing)}
                    tone={freeOf(viewing) === 0 ? 'text-rose-600' : 'text-emerald-600'}
                  />
                </div>
              </section>

              {viewing.rooms?.length > 0 && (
                <section className="card p-5">
                  <h3 className="font-display text-base font-extrabold text-ink-900">Room inventory</h3>
                  <div className="mt-4">
                    <Table
                      head={['Room type', 'Rooms', 'Occupancy', 'Extra bed', 'Child policy', 'Meal plan', 'Rack', 'B2B', 'Smira', 'Member', 'Weekend', 'Seasonal', 'Blackout']}
                      rows={viewing.rooms.map((r) => ({
                        key: r.type,
                        cells: [
                          r.type,
                          <span className="num">{r.count}</span>,
                          <span className="num">{r.occupancy}</span>,
                          r.extraBed ? 'Yes' : 'No',
                          r.child,
                          r.meal,
                          <span className="num">{inr(r.rack)}</span>,
                          <span className="num">{inr(r.b2b)}</span>,
                          <span className="num font-bold text-ink-900">{inr(r.smira)}</span>,
                          <span className="num text-brand-700">{inr(r.member)}</span>,
                          <span className="num">{r.weekend ? inr(r.weekend) : '—'}</span>,
                          <span className="num">{r.seasonal ? inr(r.seasonal) : '—'}</span>,
                          <span className="num text-ink-500">{r.blackout || '—'}</span>,
                        ],
                      }))}
                    />
                  </div>
                </section>
              )}

              <section className="card p-5">
                <h3 className="font-display text-base font-extrabold text-ink-900">Kept for</h3>
                <p className="eyebrow mt-4">By membership</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-5">
                  {membershipTiers.map((t) => (
                    <Stat key={t} label={t} value={viewing.allocation?.tiers?.[t] ?? 0} />
                  ))}
                </div>
                <p className="eyebrow mt-4">By channel</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-4">
                  {salesChannels.map((c) => (
                    <Stat key={c} label={c} value={viewing.allocation?.channels?.[c] ?? 0} />
                  ))}
                  <Stat label="Emergency buffer" value={viewing.allocation?.buffer ?? 0} />
                  <Stat
                    label="Unallocated"
                    value={Math.max(0, Number(viewing.units || 0) - allocatedOf(viewing))}
                    tone="text-emerald-600"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-line btn-sm" onClick={() => { update('inventory', viewing.id, { units: Number(viewing.units) + 1 }); toast('One unit added'); }}>
                    Increase inventory
                  </button>
                  <button
                    className="btn-line btn-sm"
                    onClick={() => { update('inventory', viewing.id, { blocked: Number(viewing.blocked || 0) + 1 }); toast('One unit blocked'); }}
                  >
                    Block a unit
                  </button>
                  <button className="btn-line btn-sm" onClick={() => toast('Vendor asked to confirm')}>
                    Ask the vendor to confirm
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

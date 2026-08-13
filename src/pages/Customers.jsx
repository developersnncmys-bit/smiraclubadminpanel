import { useState } from 'react';
import {
  Plus,
  Phone,
  MessageCircle,
  Mail,
  Pencil,
  Trash2,
  CalendarPlus,
  Crown,
  Gift,
  Check,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import RowMenu from '../components/ui/RowMenu.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormModal from '../components/ui/FormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useApp, phoneDigits } from '../store/AppStore.jsx';
import {
  inr,
  formatDate,
  signupTone,
  membershipAmount,
  giftKey,
} from '../data/mockData.js';

const TIERS = ['Platinum', 'Gold', 'Silver'];
const SPECIAL_LABELS = ['Anniversary', 'Spouse birthday', 'Child birthday', 'Other'];
const SOURCES = ['Website', 'Instagram', 'Referral', 'Walk-in', 'Google Ads', 'WhatsApp'];
const tierTone = { Platinum: 'violet', Gold: 'amber', Silver: 'slate' };
const digits = (phone) => String(phone).replace(/[^\d]/g, '');

/** Days until the next anniversary of a date, ignoring the year it happened. */
function daysUntilNext(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate());
  return Math.round((next - today) / 86400000);
}

function yearsSince(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const beforeBirthday =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthday) years -= 1;
  return years;
}

function countdown(days) {
  if (days === null) return null;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/** Label-and-value line in the profile sheet. */
function Row({ label, value, note }) {
  return (
    <div className="flex items-start gap-4 px-4 py-2.5">
      <dt className="w-32 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm leading-relaxed text-ink-800">
        {value === 0 || value ? value : <span className="text-ink-400">Not recorded</span>}
      </dd>
      {note && (
        <span className="shrink-0 pt-0.5 text-xs font-semibold text-brand-700">{note}</span>
      )}
    </div>
  );
}

export default function Customers() {
  const navigate = useNavigate();
  const {
    customers,
    memberSignups,
    memberships,
    quotations,
    bookings,
    create,
    update,
    remove,
    toggleGift,
  } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  /** The website membership a traveller signed up for, if any. */
  const membershipFor = (customer) => {
    if (!customer) return null;
    const wanted = phoneDigits(customer.phone);
    const signup = memberSignups.find(
      (s) => phoneDigits(s.phone) === wanted || (s.email && s.email === customer.email)
    );
    if (!signup) return null;
    return { signup, plan: memberships.find((p) => p.id === signup.planId) || null };
  };

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'address', label: 'Address', type: 'textarea', full: true, placeholder: 'Flat / street / area, city, PIN' },
    { name: 'dob', label: 'Date of birth', type: 'date' },
    { name: 'specialLabel', label: 'Special date is a', type: 'select', options: SPECIAL_LABELS },
    { name: 'special', label: 'Special date', type: 'date', help: 'Used for greetings and offers' },
    { name: 'source', label: 'Came from', type: 'select', options: SOURCES },
    { name: 'trips', label: 'Trips taken', type: 'number' },
    { name: 'spend', label: 'Lifetime value (₹)', type: 'number' },
    { name: 'tier', label: 'Tier', type: 'select', options: TIERS },
    { name: 'last', label: 'Latest trip', type: 'text', placeholder: '24 Aug 2026' },
  ];

  const save = (values) => {
    if (editing) update('customers', editing.id, values);
    else create('customers', values);
  };

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (r) => {
        const membership = membershipFor(r);
        return (
          <div className="flex items-center gap-3">
            <Avatar name={r.name} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-bold text-ink-900">
                {r.name}
                {membership && (
                  <span className="chip shrink-0 bg-brand-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-700">
                    <Crown size={10} /> Member
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-ink-500">{r.email}</p>
            </div>
          </div>
        );
      },
    },
    { key: 'phone', header: 'Phone', render: (r) => <span className="text-ink-600">{r.phone}</span> },
    { key: 'city', header: 'City' },
    {
      key: 'dob',
      header: 'Birthday',
      csv: (r) => r.dob || '',
      render: (r) => {
        const days = daysUntilNext(r.dob);
        if (!r.dob) return <span className="text-ink-400">—</span>;
        return (
          <div>
            <p className="whitespace-nowrap font-semibold text-ink-800">{formatDate(r.dob)}</p>
            {days !== null && days <= 30 && (
              <p className="text-xs font-semibold text-brand-700">{countdown(days)}</p>
            )}
          </div>
        );
      },
    },
    { key: 'trips', header: 'Trips', render: (r) => <span className="font-bold text-ink-900 num">{r.trips}</span> },
    {
      key: 'spend',
      header: 'Lifetime value',
      render: (r) => <span className="font-bold text-brand-700 num">{inr(r.spend)}</span>,
    },
    {
      key: 'gifts',
      header: 'Gifts',
      csv: (r) => {
        const m = membershipFor(r);
        return m?.plan ? `${(r.giftsGiven || []).length}/${m.plan.gifts?.length || 0}` : '';
      },
      render: (r) => {
        const m = membershipFor(r);
        if (!m?.plan) return <span className="text-ink-400">—</span>;
        const total = m.plan.gifts?.length || 0;
        const given = (r.giftsGiven || []).length;
        const done = total > 0 && given >= total;
        return (
          <span
            className={`chip ${
              done
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15'
            }`}
            title={done ? 'All gifts handed over' : `${total - given} still to give`}
          >
            <Gift size={11} />
            <span className="num">
              {given}/{total}
            </span>
          </span>
        );
      },
    },
    { key: 'tier', header: 'Tier', render: (r) => <Badge tone={tierTone[r.tier]}>{r.tier}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <a href={`tel:${digits(r.phone)}`} title="Call" className="icon-btn hover:border-emerald-400 hover:text-emerald-600">
            <Phone size={14} />
          </a>
          <a
            href={`https://wa.me/${digits(r.phone)}`}
            target="_blank"
            rel="noreferrer"
            title="WhatsApp"
            className="icon-btn hover:border-emerald-400 hover:text-emerald-600"
          >
            <MessageCircle size={14} />
          </a>
          <RowMenu
            items={[
              { label: 'View details', icon: FileText, onClick: () => setViewing(r) },
              { label: 'Edit customer', icon: Pencil, onClick: () => { setEditing(r); setFormOpen(true); } },
              { label: 'Email', icon: Mail, onClick: () => { window.location.href = `mailto:${r.email}`; } },
              { label: 'New booking', icon: CalendarPlus, onClick: () => navigate('/bookings') },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setConfirm([r.id]) },
            ]}
          />
        </div>
      ),
    },
  ];

  const membership = membershipFor(viewing);
  const profile = viewing ? customers.find((c) => c.id === viewing.id) || viewing : null;
  const planGifts = membership?.plan?.gifts || [];
  const givenGifts = profile?.giftsGiven || [];
  const customerQuotes = viewing
    ? quotations.filter((q) => q.customer === viewing.name).slice(0, 4)
    : [];
  const customerTrips = viewing ? bookings.filter((b) => b.customer === viewing.name).length : 0;

  return (
    <>
      <PageHeader title="Customers" subtitle="Repeat travellers, key dates and memberships">
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> Add customer
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={customers}
        searchKeys={['name', 'email', 'phone', 'city']}
        searchPlaceholder="Search customers…"
        filters={[
          { key: 'tier', label: 'Tier', options: TIERS },
          { key: 'source', label: 'Came from', options: SOURCES },
        ]}
        exportName="smira-club-customers"
        emptyLabel="No customers match this view"
        onRowClick={(r) => setViewing(r)}
        bulkActions={[{ label: 'Delete', icon: Trash2, danger: true, onClick: (ids) => setConfirm(ids) }]}
      />

      {/* Traveller profile */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || ''}
        subtitle={viewing ? `${viewing.id} · ${viewing.city || 'City not recorded'}` : ''}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setViewing(null)}>
              Close
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setEditing(viewing);
                setViewing(null);
                setFormOpen(true);
              }}
            >
              <Pencil size={16} /> Edit customer
            </button>
          </>
        }
      >
        {profile && (
          <div className="space-y-5">
            {/* Who they are */}
            <div className="flex items-center gap-3.5">
              <Avatar name={profile.name} size="lg" />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-display text-lg font-extrabold text-ink-900">
                  {profile.name}
                  <Badge tone={tierTone[profile.tier]}>{profile.tier}</Badge>
                  {profile.source && (
                    <Badge tone={profile.source === 'Website' ? 'sky' : 'slate'}>
                      {profile.source}
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-500">
                  {profile.phone} · {profile.email}
                </p>
              </div>
            </div>

            {/* Everything about them, in one quiet list */}
            <dl className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
              <Row label="Address" value={profile.address} />
              <Row
                label="Birthday"
                value={
                  profile.dob
                    ? `${formatDate(profile.dob)}${
                        yearsSince(profile.dob) !== null ? ` · ${yearsSince(profile.dob)} yrs` : ''
                      }`
                    : ''
                }
                note={countdown(daysUntilNext(profile.dob))}
              />
              <Row
                label={profile.specialLabel || 'Special date'}
                value={profile.special ? formatDate(profile.special) : ''}
                note={countdown(daysUntilNext(profile.special))}
              />
              <Row label="Trips taken" value={profile.trips ?? 0} />
              <Row label="Lifetime value" value={inr(profile.spend)} />
              <Row label="Latest trip" value={profile.last} />
            </dl>

            {/* Membership, in one line */}
            <div>
              <p className="eyebrow mb-2">Membership</p>
              {membership ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-brand-600/20 bg-brand-50/60 px-4 py-3">
                  <Crown size={16} className="shrink-0 text-brand-600" />
                  <span className="font-display text-sm font-extrabold text-ink-900">
                    {membership.signup.plan}
                  </span>
                  <Badge tone={signupTone[membership.signup.status]} dot>
                    {membership.signup.status}
                  </Badge>
                  <span className="text-sm text-ink-600">
                    {membership.signup.members}{' '}
                    {membership.signup.members === 1 ? 'member' : 'members'}
                    {membership.plan
                      ? ` · ${inr(membershipAmount(membership.plan, membership.signup.members).total)}`
                      : ''}
                  </span>
                  {membership.signup.quote && (
                    <button
                      onClick={() => navigate('/quotations')}
                      className="ml-auto text-sm font-bold text-brand-700 hover:underline"
                    >
                      {membership.signup.quote}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-ink-900/15 px-4 py-3">
                  <p className="flex-1 text-sm text-ink-500">No membership yet.</p>
                  <button className="btn-ghost btn-sm" onClick={() => navigate('/memberships')}>
                    View plans
                  </button>
                </div>
              )}
            </div>

            {/* Gifts — tap a row to tick it off */}
            {membership?.plan && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="eyebrow">Gifts</p>
                  <span className="text-xs font-semibold text-ink-400">
                    {givenGifts.length} of {planGifts.length} given
                  </span>
                </div>

                <ul className="divide-y divide-ink-900/[0.07] overflow-hidden rounded-xl border border-ink-900/[0.07]">
                  {planGifts.map((gift) => {
                    const record = givenGifts.find((g) => giftKey(g.gift) === giftKey(gift));
                    return (
                      <li key={gift}>
                        <button
                          onClick={() => toggleGift(profile.id, gift)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-soft"
                          title={record ? 'Mark as not given' : 'Mark as given'}
                        >
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                              record
                                ? 'border-brand-600 bg-brand-600 text-white'
                                : 'border-ink-900/20 text-transparent'
                            }`}
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                          <span
                            className={`min-w-0 flex-1 text-sm ${
                              record ? 'text-ink-500 line-through' : 'font-semibold text-ink-800'
                            }`}
                          >
                            {gift}
                          </span>
                          <span className="shrink-0 text-xs text-ink-400">
                            {record ? record.date : 'Tap to give'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {planGifts.length === 0 && (
                    <li className="px-4 py-4 text-sm text-ink-500">
                      This plan has no gifts set up yet.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={save}
        title={editing ? `Edit ${editing.name}` : 'Add customer'}
        subtitle={editing ? editing.id : 'Create a traveller profile'}
        fields={fields}
        initial={
          editing || { tier: 'Silver', trips: 0, spend: 0, specialLabel: 'Anniversary', source: 'Website' }
        }
        submitLabel={editing ? 'Save changes' : 'Add customer'}
      />


      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove('customers', confirm)}
        title="Delete customers?"
        message={`This removes ${confirm?.length || 0} customer profile(s).`}
      />
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import FormModal from '../ui/FormModal.jsx';
import Avatar from '../ui/Avatar.jsx';
import Badge from '../ui/Badge.jsx';
import { enquiryStatuses, statusTone, leadSources, liveStatuses, inr } from '../../data/mockData.js';

const LABELS = ['Honeymoon', 'Family', 'Luxury', 'Group', 'Adventure', 'Beach', 'Couple', 'Shopping'];
const TASK_TYPES = [
  'Call', 'Follow-up', 'WhatsApp', 'Presentation', 'Customer Visit',
  'Payment Follow-up', 'Booking Follow-up', 'Documentation', 'Membership Activation',
];
const PRIORITIES = ['High', 'Medium', 'Low'];

/** Today, as the records in this panel write it: "31 Aug 2026". */
const today = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const firstName = (name) => String(name || '').split(' ')[0];

/** A checkbox row — used by every picker below. */
function Pick({ on, onToggle, children }) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
        on ? 'border-brand-400 bg-brand-50' : 'border-ink-900/[0.07] hover:bg-surface-soft'
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
          on ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-900/20 bg-white'
        }`}
      >
        {on && <Check size={13} strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

/** A lead, the way it reads in every picker. */
function LeadRow({ lead }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar name={lead.name} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink-900">{lead.name}</span>
        <span className="block truncate text-xs text-ink-500">
          {lead.destination} · {lead.budget ? inr(lead.budget) : 'no budget'} · {lead.owner || 'Unassigned'}
        </span>
      </span>
      <Badge tone={statusTone[lead.status]}>{lead.status}</Badge>
    </span>
  );
}

/**
 * Everything the Team Status quick actions actually do. One `action` string
 * drives which dialog is open, and each one writes to the store — a lead is
 * really created, a task really lands on someone's desk, leads really move
 * from one consultant to another.
 */
export default function TeamActions({ action, context = {}, onClose, store }) {
  const { team, tasks, enquiries, create, update, updateMany, toast } = store;

  const consultants = useMemo(() => team.map((m) => firstName(m.name)), [team]);
  const fieldOfficers = useMemo(
    () => team.filter((m) => /field/i.test(m.role) || /field/i.test(m.department || '')).map((m) => firstName(m.name)),
    [team]
  );

  const [picked, setPicked] = useState([]);
  const [owner, setOwner] = useState(context.member ? firstName(context.member.name) : consultants[0] || '');
  const [target, setTarget] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState(context.member?.live || 'Online');

  // Every dialog opens clean — with the employee it was opened from already ticked.
  useEffect(() => {
    setPicked(action === 'message' && context.member ? [context.member.id] : []);
    setText('');
    setOwner(context.member ? firstName(context.member.name) : consultants[0] || '');
    setTarget(consultants.find((c) => c !== (context.member ? firstName(context.member.name) : '')) || '');
    setStatus(context.member?.live || 'Online');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const close = () => onClose();

  // -- Add lead --------------------------------------------------------------
  if (action === 'add-lead') {
    return (
      <FormModal
        open
        onClose={close}
        title="Add lead"
        subtitle="It lands in Sales & Leads straight away"
        submitLabel="Create lead"
        fields={[
          { name: 'name', label: 'Client name', type: 'text', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 ' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'destination', label: 'Destination', type: 'text', required: true },
          { name: 'pax', label: 'Travellers', type: 'number' },
          { name: 'travelDate', label: 'Travel date', type: 'text', placeholder: '18 Sep 2026' },
          { name: 'budget', label: 'Budget (₹)', type: 'number' },
          { name: 'status', label: 'Status', type: 'select', options: enquiryStatuses },
          { name: 'source', label: 'Source', type: 'select', options: leadSources },
          { name: 'label', label: 'Label', type: 'select', options: LABELS },
          { name: 'owner', label: 'Assign to', type: 'select', options: ['Unassigned', ...consultants] },
          { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES },
        ]}
        initial={{
          status: 'New',
          owner: context.member ? firstName(context.member.name) : 'Unassigned',
          source: leadSources[0],
          priority: 'Medium',
        }}
        onSubmit={(values) => {
          const id = create('enquiries', { ...values, created: today(), lastContact: 'just now' });
          const who = values.owner && values.owner !== 'Unassigned' ? values.owner : null;
          if (who) {
            const m = team.find((t) => firstName(t.name) === who);
            if (m) update('team', m.id, { leads: Number(m.leads || 0) + 1 }, { silent: true });
          }
          toast(`Lead ${id} created${who ? ` for ${who}` : ''}`);
          close();
        }}
      />
    );
  }

  // -- Create task / follow-up / presentation / visit ------------------------
  if (action === 'task') {
    const preset = context.type || 'Call';
    return (
      <FormModal
        open
        onClose={close}
        title={context.title || 'Create task'}
        subtitle="It appears on the Tasks tab and on the employee's desk"
        submitLabel="Create task"
        fields={[
          { name: 'title', label: 'Task', type: 'text', required: true, full: true },
          { name: 'type', label: 'Task type', type: 'select', options: TASK_TYPES },
          { name: 'owner', label: 'Assign to', type: 'select', options: consultants },
          { name: 'customer', label: 'Customer', type: 'text' },
          { name: 'lead', label: 'Lead ID', type: 'text', placeholder: 'LEAD-2291' },
          { name: 'dueDate', label: 'Due date', type: 'date' },
          { name: 'dueTime', label: 'Due time', type: 'text', placeholder: '04:30 pm' },
          { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES },
          { name: 'nextAction', label: 'Next action', type: 'text', full: true },
          { name: 'note', label: 'Remarks', type: 'textarea', full: true },
        ]}
        initial={{
          type: preset,
          owner: context.member ? firstName(context.member.name) : consultants[0],
          priority: 'Medium',
          customer: context.customer || '',
          title: context.suggest || '',
        }}
        onSubmit={(values) => {
          const { dueDate, dueTime, ...rest } = values;
          const id = create('tasks', {
            ...rest,
            due: [dueDate || today(), dueTime].filter(Boolean).join(', '),
            created: today(),
            createdBy: 'Management',
            bucket: 'today',
            status: 'Pending',
            lastAction: 'Created from Team Status',
          });
          const m = team.find((t) => firstName(t.name) === values.owner);
          if (m) {
            update(
              'team',
              m.id,
              {
                tasksTotal: Number(m.tasksTotal || 0) + 1,
                taskDetail: { ...(m.taskDetail || {}), pending: Number(m.taskDetail?.pending || 0) + 1 },
              },
              { silent: true }
            );
          }
          toast(`${values.type} ${id} assigned to ${values.owner}`);
          close();
        }}
      />
    );
  }

  // -- Assign leads ----------------------------------------------------------
  if (action === 'assign-lead') {
    const pool = enquiries.filter((e) => !['Won', 'Lost'].includes(e.status));
    const unassigned = pool.filter((e) => !e.owner || e.owner === 'Unassigned');
    const list = unassigned.length ? unassigned : pool;
    return (
      <Modal
        open
        onClose={close}
        title="Assign leads"
        subtitle={unassigned.length ? `${unassigned.length} lead(s) waiting for an owner` : 'Every open lead'}
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <button
              className="btn-action"
              disabled={!picked.length || !owner}
              onClick={() => {
                updateMany('enquiries', picked, { owner }, `${picked.length} lead(s) assigned to ${owner}`);
                const m = team.find((t) => firstName(t.name) === owner);
                if (m) update('team', m.id, { leads: Number(m.leads || 0) + picked.length }, { silent: true });
                close();
              }}
            >
              Assign {picked.length || ''}
            </button>
            <button className="btn-line" onClick={close}>Cancel</button>
          </div>
        }
      >
        <label className="label">Assign to</label>
        <select className="input mb-4" value={owner} onChange={(e) => setOwner(e.target.value)}>
          {consultants.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="space-y-2">
          {list.map((e) => (
            <Pick key={e.id} on={picked.includes(e.id)} onToggle={() => toggle(e.id)}>
              <LeadRow lead={e} />
            </Pick>
          ))}
          {list.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No open leads.</p>}
        </div>
      </Modal>
    );
  }

  // -- Reassign / rebalance --------------------------------------------------
  if (action === 'reassign' || action === 'rebalance') {
    const from = owner;
    const mine = enquiries.filter((e) => e.owner === from && !['Won', 'Lost'].includes(e.status));
    const theirTasks = tasks.filter((t) => t.owner === from && t.bucket !== 'done');
    return (
      <Modal
        open
        onClose={close}
        title={action === 'rebalance' ? 'Rebalance workload' : 'Reassign leads'}
        subtitle="Move open leads and tasks to another consultant"
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <button
              className="btn-action"
              disabled={!picked.length || !target || target === from}
              onClick={() => {
                const leadIds = picked.filter((id) => mine.some((e) => e.id === id));
                const taskIds = picked.filter((id) => theirTasks.some((t) => t.id === id));
                if (leadIds.length) updateMany('enquiries', leadIds, { owner: target }, `${leadIds.length} lead(s) moved to ${target}`);
                if (taskIds.length) updateMany('tasks', taskIds, { owner: target }, `${taskIds.length} task(s) moved to ${target}`);
                const a = team.find((t) => firstName(t.name) === from);
                const b = team.find((t) => firstName(t.name) === target);
                if (a) update('team', a.id, { leads: Math.max(0, Number(a.leads || 0) - leadIds.length) }, { silent: true });
                if (b) update('team', b.id, { leads: Number(b.leads || 0) + leadIds.length }, { silent: true });
                close();
              }}
            >
              Move {picked.length || ''}
            </button>
            <button className="btn-line" onClick={close}>Cancel</button>
          </div>
        }
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label">From</span>
            <select className="input" value={from} onChange={(e) => { setOwner(e.target.value); setPicked([]); }}>
              {consultants.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">To</span>
            <select className="input" value={target} onChange={(e) => setTarget(e.target.value)}>
              {consultants.filter((c) => c !== from).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        {mine.length > 0 && <p className="eyebrow mb-2">Open leads</p>}
        <div className="space-y-2">
          {mine.map((e) => (
            <Pick key={e.id} on={picked.includes(e.id)} onToggle={() => toggle(e.id)}>
              <LeadRow lead={e} />
            </Pick>
          ))}
        </div>

        {theirTasks.length > 0 && <p className="eyebrow mb-2 mt-4">Open tasks</p>}
        <div className="space-y-2">
          {theirTasks.map((t) => (
            <Pick key={t.id} on={picked.includes(t.id)} onToggle={() => toggle(t.id)}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink-900">{t.title}</span>
                <span className="block truncate text-xs text-ink-500">{t.type} · due {t.due}</span>
              </span>
            </Pick>
          ))}
        </div>

        {mine.length === 0 && theirTasks.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-500">{from} has nothing open to move.</p>
        )}
      </Modal>
    );
  }

  // -- Assign a field officer to a visit ------------------------------------
  if (action === 'field-officer') {
    const visits = tasks.filter((t) => t.type === 'Customer Visit' && t.bucket !== 'done');
    return (
      <Modal
        open
        onClose={close}
        title="Assign a field officer"
        subtitle="Pick the visits and who is going"
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <button
              className="btn-action"
              disabled={!picked.length || !owner}
              onClick={() => {
                updateMany('tasks', picked, { owner }, `${picked.length} visit(s) assigned to ${owner}`);
                close();
              }}
            >
              Assign {picked.length || ''}
            </button>
            <button className="btn-line" onClick={close}>Cancel</button>
          </div>
        }
      >
        <label className="label">Field officer</label>
        <select className="input mb-4" value={owner} onChange={(e) => setOwner(e.target.value)}>
          {(fieldOfficers.length ? fieldOfficers : consultants).map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="space-y-2">
          {visits.map((t) => (
            <Pick key={t.id} on={picked.includes(t.id)} onToggle={() => toggle(t.id)}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink-900">{t.title}</span>
                <span className="block truncate text-xs text-ink-500">
                  {t.customer} · due {t.due} · now {t.owner}
                </span>
              </span>
            </Pick>
          ))}
          {visits.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-500">No visits scheduled. Create one first.</p>
          )}
        </div>
      </Modal>
    );
  }

  // -- Mark leads priority ---------------------------------------------------
  if (action === 'priority') {
    const pool = enquiries.filter((e) => !['Won', 'Lost'].includes(e.status));
    return (
      <Modal
        open
        onClose={close}
        title="Mark priority"
        subtitle="Priority leads sit at the top of the consultant's day"
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <button
              className="btn-action"
              disabled={!picked.length}
              onClick={() => {
                updateMany('enquiries', picked, { priority: 'High' }, `${picked.length} lead(s) marked priority`);
                close();
              }}
            >
              Mark {picked.length || ''} priority
            </button>
            <button className="btn-line" onClick={close}>Cancel</button>
          </div>
        }
      >
        <div className="space-y-2">
          {pool.map((e) => (
            <Pick key={e.id} on={picked.includes(e.id)} onToggle={() => toggle(e.id)}>
              <LeadRow lead={e} />
            </Pick>
          ))}
          {pool.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No open leads.</p>}
        </div>
      </Modal>
    );
  }

  // -- Send a message / send a reminder -------------------------------------
  if (action === 'message') {
    const chosen = picked;
    return (
      <Modal
        open
        onClose={close}
        title={context.title || 'Send a message'}
        subtitle="It lands in the employee's activity log"
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <button
              className="btn-action"
              disabled={!chosen.length || !text.trim()}
              onClick={() => {
                chosen.forEach((id) => {
                  const m = team.find((t) => t.id === id);
                  if (!m) return;
                  update(
                    'team',
                    m.id,
                    {
                      activityLog: [
                        { at: 'just now', kind: context.kind || 'Message', text: text.trim() },
                        ...(m.activityLog || []),
                      ],
                    },
                    { silent: true }
                  );
                });
                toast(`Sent to ${chosen.length} ${chosen.length === 1 ? 'person' : 'people'}`);
                close();
              }}
            >
              Send
            </button>
            <button className="btn-line" onClick={close}>Cancel</button>
          </div>
        }
      >
        <label className="label">Message</label>
        <textarea
          className="input mb-4 min-h-[90px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={context.placeholder || 'Type what the desk needs to hear…'}
        />
        <p className="eyebrow mb-2">Who gets it</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {team.map((m) => (
            <Pick key={m.id} on={chosen.includes(m.id)} onToggle={() => toggle(m.id)}>
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <Avatar name={m.name} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink-900">{m.name}</span>
                  <span className="block truncate text-xs text-ink-500">{m.live}</span>
                </span>
              </span>
            </Pick>
          ))}
        </div>
      </Modal>
    );
  }

  // -- Add a note to someone's log ------------------------------------------
  if (action === 'note') {
    const m = context.member || team.find((t) => firstName(t.name) === owner);
    return (
      <Modal
        open
        onClose={close}
        title="Add a note"
        subtitle="Kept on the employee's activity log"
        size="sm"
        footer={
          <div className="flex items-center gap-2">
            <button
              className="btn-action"
              disabled={!text.trim() || !m}
              onClick={() => {
                update(
                  'team',
                  m.id,
                  { activityLog: [{ at: 'just now', kind: 'Note', text: text.trim() }, ...(m.activityLog || [])] },
                  { silent: true }
                );
                toast(`Note added to ${firstName(m.name)}'s log`);
                close();
              }}
            >
              Save note
            </button>
            <button className="btn-line" onClick={close}>Cancel</button>
          </div>
        }
      >
        {!context.member && (
          <>
            <label className="label">About</label>
            <select className="input mb-3" value={owner} onChange={(e) => setOwner(e.target.value)}>
              {consultants.map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        )}
        <label className="label">Note</label>
        <textarea
          className="input min-h-[110px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What should the desk remember?"
        />
      </Modal>
    );
  }

  // -- Change someone's live status -----------------------------------------
  if (action === 'change-status' && context.member) {
    const m = context.member;
    return (
      <Modal
        open
        onClose={close}
        title={`Change status — ${m.name}`}
        subtitle="Sets what the live board shows"
        size="sm"
        footer={
          <div className="flex items-center gap-2">
            <button
              className="btn-action"
              onClick={() => {
                update('team', m.id, { live: status }, { message: `${firstName(m.name)} is now ${status}` });
                close();
              }}
            >
              Save
            </button>
            <button className="btn-line" onClick={close}>Cancel</button>
          </div>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {liveStatuses.map((s) => (
            <Pick key={s} on={status === s} onToggle={() => setStatus(s)}>
              <span className="text-sm font-semibold text-ink-800">{s}</span>
            </Pick>
          ))}
        </div>
      </Modal>
    );
  }

  return null;
}

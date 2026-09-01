import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Avatar from '../ui/Avatar.jsx';
import Badge from '../ui/Badge.jsx';
import { stageTone } from '../../data/supportData.js';

const firstName = (name) => String(name || '').split(' ')[0];
const now = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();

/** A checkbox row, the same one the team dialogs use. */
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

/** A ticket, the way it reads in every picker. */
function TicketRow({ t }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar name={t.customer} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink-900">{t.customer}</span>
        <span className="num block truncate text-xs text-ink-500">
          {t.id} · {t.category} · {t.executive || 'unassigned'}
        </span>
      </span>
      <Badge tone={stageTone[t.stage]}>{t.stage}</Badge>
    </span>
  );
}

/**
 * What the support quick actions actually do. Each one writes to the store —
 * a ticket really changes hands, an escalation really moves the ladder, and a
 * note really lands on the ticket's timeline.
 */
export default function SupportActions({ action, tickets, team, onClose, store, onOpen }) {
  const { update, updateMany, toast } = store;

  const consultants = team.map((m) => firstName(m.name));
  const open = tickets.filter((t) => !['Closed', 'Customer confirmed'].includes(t.stage));

  const [picked, setPicked] = useState([]);
  const [owner, setOwner] = useState(consultants[0] || '');
  const [text, setText] = useState('');

  useEffect(() => {
    setPicked([]);
    setText('');
    setOwner(consultants[0] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const chosen = tickets.filter((t) => picked.includes(t.id));

  /** Adds a line to a ticket's timeline without losing what is there. */
  const log = (t, entry) =>
    update(
      'tickets',
      t.id,
      { timeline: [...(t.timeline || []), { at: now(), ...entry }], updated: 'just now' },
      { silent: true }
    );

  const footer = (label, run, disabled) => (
    <div className="flex items-center gap-2">
      <button className="btn-action" disabled={disabled} onClick={run}>
        {label}
      </button>
      <button className="btn-line" onClick={onClose}>Cancel</button>
    </div>
  );

  // -- Assign a ticket to someone -------------------------------------------
  if (action === 'assign') {
    return (
      <Modal
        open
        onClose={onClose}
        title="Assign tickets"
        subtitle={`${open.length} open complaint${open.length === 1 ? '' : 's'}`}
        size="md"
        footer={footer(
          `Assign ${picked.length || ''}`,
          () => {
            updateMany('tickets', picked, { executive: owner, stage: 'Assigned' }, `${picked.length} ticket(s) assigned to ${owner}`);
            chosen.forEach((t) => log(t, { who: 'Management', channel: 'Panel', text: `Assigned to ${owner}` }));
            onClose();
          },
          !picked.length || !owner
        )}
      >
        <label className="label">Assign to</label>
        <select className="input mb-4" value={owner} onChange={(e) => setOwner(e.target.value)}>
          {consultants.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="space-y-2">
          {open.map((t) => (
            <Pick key={t.id} on={picked.includes(t.id)} onToggle={() => toggle(t.id)}>
              <TicketRow t={t} />
            </Pick>
          ))}
          {open.length === 0 && <p className="py-8 text-center text-sm text-ink-500">Nothing open.</p>}
        </div>
      </Modal>
    );
  }

  // -- Escalate --------------------------------------------------------------
  if (action === 'escalate') {
    return (
      <Modal
        open
        onClose={onClose}
        title="Escalate tickets"
        subtitle="Moves them up the ladder and marks them escalated"
        size="md"
        footer={footer(
          `Escalate ${picked.length || ''}`,
          () => {
            chosen.forEach((t) => {
              update(
                'tickets',
                t.id,
                {
                  stage: 'Escalated',
                  escalation: Math.min(4, Number(t.escalation || 1) + 1),
                  timeline: [
                    ...(t.timeline || []),
                    { at: now(), who: 'Management', channel: 'Panel', text: `Escalated to level ${Math.min(4, Number(t.escalation || 1) + 1)}` },
                  ],
                  updated: 'just now',
                },
                { silent: true }
              );
            });
            toast(`${picked.length} ticket(s) escalated`);
            onClose();
          },
          !picked.length
        )}
      >
        <div className="space-y-2">
          {open.map((t) => (
            <Pick key={t.id} on={picked.includes(t.id)} onToggle={() => toggle(t.id)}>
              <TicketRow t={t} />
            </Pick>
          ))}
          {open.length === 0 && <p className="py-8 text-center text-sm text-ink-500">Nothing open.</p>}
        </div>
      </Modal>
    );
  }

  // -- WhatsApp the customer -------------------------------------------------
  if (action === 'whatsapp') {
    const one = chosen[0];
    return (
      <Modal
        open
        onClose={onClose}
        title="Send WhatsApp"
        subtitle="Opens WhatsApp and logs it on the ticket"
        size="md"
        footer={footer(
          'Send',
          () => {
            const digits = String(one.phone).replace(/[^\d]/g, '');
            window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank');
            log(one, { who: 'Management', channel: 'WhatsApp', text: text.trim() });
            toast(`WhatsApp sent to ${one.customer}`);
            onClose();
          },
          !one || !text.trim()
        )}
      >
        <label className="label">Message</label>
        <textarea
          className="input mb-4 min-h-[90px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What should the customer hear?"
        />
        <p className="eyebrow mb-2">Which ticket</p>
        <div className="space-y-2">
          {open.map((t) => (
            <Pick key={t.id} on={picked[0] === t.id} onToggle={() => setPicked([t.id])}>
              <TicketRow t={t} />
            </Pick>
          ))}
        </div>
      </Modal>
    );
  }

  // -- Call the customer -----------------------------------------------------
  if (action === 'call') {
    return (
      <Modal open onClose={onClose} title="Call a customer" subtitle="Pick the ticket you are calling about" size="md">
        <ul className="space-y-2">
          {open.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl border border-ink-900/[0.07] px-3.5 py-2.5">
              <TicketRow t={t} />
              <span className="flex shrink-0 gap-1.5">
                <a
                  href={`tel:${String(t.phone).replace(/[^\d]/g, '')}`}
                  className="btn-action btn-sm"
                  onClick={() => log(t, { who: 'Management', channel: 'Call', text: 'Called the customer' })}
                >
                  Call
                </a>
                <button className="btn-line btn-sm" onClick={() => { onOpen(t); onClose(); }}>
                  Open
                </button>
              </span>
            </li>
          ))}
          {open.length === 0 && <li className="py-8 text-center text-sm text-ink-500">Nothing open.</li>}
        </ul>
      </Modal>
    );
  }

  // -- Internal note ---------------------------------------------------------
  if (action === 'note') {
    const one = chosen[0];
    return (
      <Modal
        open
        onClose={onClose}
        title="Add an internal note"
        subtitle="Kept on the ticket's timeline"
        size="md"
        footer={footer(
          'Save note',
          () => {
            log(one, { who: 'Management', channel: 'Internal note', text: text.trim() });
            toast(`Note added to ${one.id}`);
            onClose();
          },
          !one || !text.trim()
        )}
      >
        <label className="label">Note</label>
        <textarea
          className="input mb-4 min-h-[90px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What should the desk know?"
        />
        <p className="eyebrow mb-2">Which ticket</p>
        <div className="space-y-2">
          {tickets.map((t) => (
            <Pick key={t.id} on={picked[0] === t.id} onToggle={() => setPicked([t.id])}>
              <TicketRow t={t} />
            </Pick>
          ))}
        </div>
      </Modal>
    );
  }

  return null;
}

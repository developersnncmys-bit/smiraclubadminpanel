import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  tone = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-line" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn text-white ${
              tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            tone === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'
          }`}
        >
          <AlertTriangle size={20} />
        </span>
        <p className="text-sm leading-relaxed text-ink-600">{message}</p>
      </div>
    </Modal>
  );
}

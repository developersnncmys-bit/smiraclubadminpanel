import { CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { useApp } from '../../store/AppStore.jsx';

const skins = {
  success: { bar: 'bg-emerald-500', icon: CheckCircle2, tint: 'text-emerald-600' },
  info: { bar: 'bg-sky-500', icon: Info, tint: 'text-sky-600' },
  danger: { bar: 'bg-rose-500', icon: Trash2, tint: 'text-rose-600' },
};

export default function Toaster() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
      {toasts.map((t) => {
        const skin = skins[t.tone] || skins.success;
        const Icon = skin.icon;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 overflow-hidden rounded-xl bg-white pr-3 shadow-lift ring-1 ring-ink-900/5"
          >
            <span className={`h-full w-1 self-stretch ${skin.bar}`} />
            <Icon size={17} className={`shrink-0 ${skin.tint}`} />
            <p className="flex-1 py-3 text-sm font-semibold text-ink-800">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-surface-soft hover:text-ink-700"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

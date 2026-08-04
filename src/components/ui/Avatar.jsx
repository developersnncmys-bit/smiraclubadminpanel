const palette = [
  'bg-brand-100 text-brand-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
];

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  };

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold ${palette[idx]} ${sizes[size]} ${className}`}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

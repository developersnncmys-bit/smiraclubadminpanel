import { Layers } from 'lucide-react';
import MenuButton from './MenuButton.jsx';

/**
 * The switcher a module uses to move between its sections: one dark button
 * naming the section you are on, and the rest of them behind it. Every page
 * uses this, so the panel only ever asks you to pick one thing at a time.
 *
 * items: strings, or [{ key, label, icon, count }]
 */
export default function SectionTabs({ items, value, onChange, className = '', children }) {
  const list = items.map((i) => (typeof i === 'string' ? { key: i, label: i } : i));
  const current = list.find((i) => i.key === value) || list[0];
  const label = current
    ? `${current.label ?? current.key}${current.count != null ? ` · ${current.count}` : ''}`
    : 'Choose a section';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <MenuButton
        label={label}
        icon={current?.icon || Layers}
        variant="dark"
        value={value}
        items={list}
        onSelect={onChange}
        width="w-[260px]"
        title="Change section"
      />
      {children}
    </div>
  );
}

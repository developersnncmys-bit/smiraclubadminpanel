import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Card from '../ui/Card.jsx';
import { sources } from '../../data/mockData.js';

export default function SourceDonut() {
  const total = sources.reduce((s, x) => s + x.value, 0);

  return (
    <Card title="Enquiry sources" subtitle="Where this week's enquiries came from">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-[190px] w-[190px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sources}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={3}
                stroke="none"
              >
                {sources.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(11,21,36,0.06)',
                  boxShadow: '0 20px 45px -20px rgba(11,21,36,0.28)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold leading-none">{total}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Enquiries</p>
            </div>
          </div>
        </div>

        <ul className="w-full space-y-2.5">
          {sources.map((s) => (
            <li key={s.name} className="flex items-center gap-3 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="flex-1 font-semibold text-ink-700">{s.name}</span>
              <span className="text-ink-500">{Math.round((s.value / total) * 100)}%</span>
              <span className="w-8 text-right font-bold text-ink-900">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

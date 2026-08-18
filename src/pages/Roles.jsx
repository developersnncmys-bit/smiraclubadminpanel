import RecordsPage from '../components/ui/RecordsPage.jsx';
import Badge from '../components/ui/Badge.jsx';
import { Check, X } from 'lucide-react';
import { permissionAreas } from '../data/modulesData.js';
import { useApp } from '../store/AppStore.jsx';

/** Who can see and do what. */
export default function Roles() {
  const { update, team } = useApp();

  const toggleArea = (row, area) => {
    const has = row.areas.includes(area);
    update(
      'roles',
      row.id,
      { areas: has ? row.areas.filter((a) => a !== area) : [...row.areas, area] },
      { message: `${row.name} ${has ? 'lost' : 'gained'} access to ${area}` }
    );
  };

  return (
    <RecordsPage
      collection="roles"
      title="Users & Roles"
      subtitle="Who can see and do what in the panel"
      addLabel="Add role"
      searchKeys={['name', 'description']}
      initial={{ areas: ['Sales & leads'], canDelete: false, canExport: false, people: 0 }}
      stats={(rows) => [
        { label: 'Roles', value: rows.length },
        { label: 'People assigned', value: team.length },
        { label: 'Can delete records', value: rows.filter((r) => r.canDelete).length, tone: 'text-orange-600' },
        { label: 'Can export data', value: rows.filter((r) => r.canExport).length },
      ]}
      fields={[
        { name: 'name', label: 'Role name', type: 'text', required: true },
        { name: 'people', label: 'People in this role', type: 'number' },
        { name: 'description', label: 'What this role is for', type: 'text', full: true },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Role',
          render: (r) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-ink-900">{r.name}</p>
              <p className="truncate text-xs text-ink-500">{r.description}</p>
            </div>
          ),
        },
        {
          key: 'people',
          header: 'People',
          render: (r) => <span className="num font-semibold text-ink-800">{r.people}</span>,
        },
        {
          key: 'areas',
          header: 'Pages they can open',
          csv: (r) => r.areas.join(' | '),
          render: (r) => (
            <div className="flex max-w-[420px] flex-wrap gap-1.5">
              {permissionAreas.map((area) => {
                const on = r.areas.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggleArea(r, area)}
                    title={on ? 'Remove access' : 'Give access'}
                    className={`chip transition ${
                      on
                        ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/20'
                        : 'bg-surface-soft text-ink-400 hover:text-ink-600'
                    }`}
                  >
                    {on ? <Check size={11} strokeWidth={3} /> : <X size={11} />}
                    {area}
                  </button>
                );
              })}
            </div>
          ),
        },
        {
          key: 'canDelete',
          header: 'Delete',
          csv: (r) => (r.canDelete ? 'yes' : 'no'),
          render: (r) => (
            <Badge tone={r.canDelete ? 'rose' : 'slate'}>{r.canDelete ? 'Allowed' : 'No'}</Badge>
          ),
        },
        {
          key: 'canExport',
          header: 'Export',
          csv: (r) => (r.canExport ? 'yes' : 'no'),
          render: (r) => (
            <Badge tone={r.canExport ? 'green' : 'slate'}>{r.canExport ? 'Allowed' : 'No'}</Badge>
          ),
        },
      ]}
      rowActions={(row, app) => [
        {
          label: row.canDelete ? 'Remove delete rights' : 'Allow deleting',
          onClick: () => app.update('roles', row.id, { canDelete: !row.canDelete }),
        },
        {
          label: row.canExport ? 'Remove export rights' : 'Allow exporting',
          onClick: () => app.update('roles', row.id, { canExport: !row.canExport }),
        },
      ]}
    />
  );
}

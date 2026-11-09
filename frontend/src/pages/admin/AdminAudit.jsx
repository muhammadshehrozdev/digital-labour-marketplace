import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Alert, Button, DataTable, EmptyState, PageHeader, Pagination, Select, Skeleton, TextField } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import styles from './Admin.module.css';

const PAGE_SIZE = 50;
const EMPTY = { action: '', from: '', to: '' };

// Read-only audit log. Entries cannot be edited or deleted; `npm run audit:verify` checks the hash chain.
export default function AdminAudit() {
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const params = { page: String(page), limit: String(PAGE_SIZE) };
  for (const [k, v] of Object.entries(applied)) if (v) params[k] = v;
  const { data, error, reload } = useApiQuery('/admin/audit', params);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const columns = [
    { key: 'seq', header: '#', render: (e) => <span className="tabular">{e.seq}</span> },
    { key: 'time', header: 'Time', render: (e) => <span className="tabular">{new Date(e.createdAt).toLocaleString('en-GB')}</span> },
    { key: 'actor', header: 'By', render: (e) => (e.actor?.name ? `${e.actor.name} (${e.actorRole})` : e.actorRole) },
    { key: 'action', header: 'Action', render: (e) => <code>{e.action}</code> },
    { key: 'target', header: 'Target', render: (e) => (e.targetType ? `${e.targetType} ${e.targetId ?? ''}` : '—') },
    { key: 'change', header: 'Change', render: (e) => (e.fromState || e.toState ? `${e.fromState ?? '—'} → ${e.toState ?? '—'}` : '—') },
    { key: 'reason', header: 'Reason / note', render: (e) => e.reason ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Audit log" description="Every identity decision, CNIC reveal and admin creation, newest first. Read-only." />
      <form className={styles.filters} onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(filters); }}>
        <Select label="Action" value={filters.action} onChange={set('action')} placeholder="All actions" options={(data?.actions ?? []).map((a) => ({ value: a, label: a }))} />
        <TextField label="From" type="date" value={filters.from} onChange={set('from')} />
        <TextField label="To" type="date" value={filters.to} onChange={set('to')} />
        <Button type="submit">Apply</Button>
        {(applied.action || applied.from || applied.to) && <Button variant="ghost" onClick={() => { setFilters(EMPTY); setApplied(EMPTY); setPage(1); }}>Clear</Button>}
      </form>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>Try again</Button>}>{error}</Alert>}
      {!data && !error && <div aria-busy="true"><span className="visually-hidden" role="status">Loading…</span><Skeleton variant="block" height={240} /></div>}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{data.total} entr{data.total === 1 ? 'y' : 'ies'}</p>
          <DataTable
            caption="Audit log entries"
            columns={columns}
            rows={data.entries}
            rowKey={(e) => e.seq}
            empty={<EmptyState icon={ScrollText} headingLevel={2} title="No entries" description="Nothing matches these filters." />}
          />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
    </div>
  );
}

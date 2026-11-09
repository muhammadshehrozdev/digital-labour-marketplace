import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Alert, Button, DataTable, EmptyState, PageHeader, Pagination, Select, Skeleton, TextField } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

const PAGE_SIZE = 50;
const EMPTY = { action: '', from: '', to: '' };

// Read-only audit log. Entries cannot be edited or deleted; `npm run audit:verify` checks the hash chain.
export default function AdminAudit() {
  const { t, te, formatDate } = useT();
  useDocumentTitle(t('titles.adminAudit'));
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const params = { page: String(page), limit: String(PAGE_SIZE) };
  for (const [k, v] of Object.entries(applied)) if (v) params[k] = v;
  const { data, error, reload } = useApiQuery('/admin/audit', params);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const columns = [
    { key: 'seq', header: t('admin.audit.columns.seq'), render: (e) => <span className="tabular">{e.seq}</span> },
    { key: 'time', header: t('admin.audit.columns.time'), render: (e) => <span className="tabular">{formatDate(e.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</span> },
    { key: 'actor', header: t('admin.audit.columns.by'), render: (e) => (e.actor?.name ? `${e.actor.name} (${t(`roles.${e.actorRole}`)})` : t(`roles.${e.actorRole}`)) },
    { key: 'action', header: t('admin.audit.columns.action'), render: (e) => <code>{e.action}</code> },
    { key: 'target', header: t('admin.audit.columns.target'), render: (e) => (e.targetType ? <span dir="ltr">{`${e.targetType} ${e.targetId ?? ''}`}</span> : t('common.empty')) },
    { key: 'change', header: t('admin.audit.columns.change'), render: (e) => (e.fromState || e.toState ? <span dir="ltr">{`${e.fromState ?? '—'} → ${e.toState ?? '—'}`}</span> : t('common.empty')) },
    { key: 'reason', header: t('admin.audit.columns.reason'), render: (e) => <span dir="auto">{e.reason ?? '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title={t('admin.audit.title')} description={t('admin.audit.lead')} />
      <form className={styles.filters} onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(filters); }}>
        <Select label={t('admin.audit.action')} value={filters.action} onChange={set('action')} placeholder={t('admin.audit.allActions')} options={(data?.actions ?? []).map((a) => ({ value: a, label: a }))} />
        <TextField label={t('admin.audit.from')} type="date" value={filters.from} onChange={set('from')} />
        <TextField label={t('admin.audit.to')} type="date" value={filters.to} onChange={set('to')} />
        <Button type="submit">{t('common.apply')}</Button>
        {(applied.action || applied.from || applied.to) && <Button variant="ghost" onClick={() => { setFilters(EMPTY); setApplied(EMPTY); setPage(1); }}>{t('common.clear')}</Button>}
      </form>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <div aria-busy="true"><span className="visually-hidden" role="status">{t('common.loading')}</span><Skeleton variant="block" height={240} /></div>}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{t('admin.audit.count', { count: data.total })}</p>
          <DataTable
            caption={t('admin.audit.caption')}
            columns={columns}
            rows={data.entries}
            rowKey={(e) => e.seq}
            empty={<EmptyState icon={ScrollText} headingLevel={2} title={t('admin.audit.emptyTitle')} description={t('admin.audit.emptyText')} />}
          />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
    </div>
  );
}

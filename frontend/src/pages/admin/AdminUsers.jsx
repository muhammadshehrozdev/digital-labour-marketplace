// Admin: users (Batch 4, feature 26). Search and filter accounts (filters live in the address,
// so a view can be bookmarked), open one to see what belongs to it, and suspend or reactivate it
// with a required reason. The server checks every rule again (role, not yourself, not an admin).
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Ban, LockKeyhole, RotateCcw, Search } from 'lucide-react';
import API from '../../api';
import {
  Alert, Badge, Button, DataTable, Dialog, Drawer, EmptyState, PageHeader, Pagination, Select, Skeleton, StatusChip, Tabs, TextArea, TextField, useToast,
} from '../../components/ui';
import ReputationBreakdown from '../../features/admin/ReputationBreakdown';
import TemplatePicker from '../../features/admin/TemplatePicker';
import { actionKey } from '../../features/admin/adminHelpers';
import { useAuth } from '../../context/auth';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import styles from './Admin.module.css';

const ROLES = ['all', 'worker', 'customer', 'admin'];
const STATUSES = ['all', 'active', 'suspended'];
const PAGE_SIZE = 25;

// Asks for the reason, then PATCH /api/admin/users/:id/status.
function StatusDialog({ user, onClose, onDone }) {
  const toast = useToast();
  const { t, te } = useT();
  const suspend = user.status !== 'suspended';
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const send = async () => {
    if (reason.trim().length < 5) {
      setReasonError('adminx.users.reasonError');
      return;
    }
    setReasonError(null);
    setError(null);
    setSaving(true);
    try {
      const { data } = await API.patch(`/admin/users/${user._id}/status`, { status: suspend ? 'suspended' : 'active', reason: reason.trim() });
      toast.show({ title: t(suspend ? 'adminx.users.suspended' : 'adminx.users.reactivated'), message: t('adminx.users.savedText') });
      onDone(data.user);
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (fields.reason) setReasonError(fields.reason);
      else setError(apiError(err, 'adminx.users.saveFailed'));
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={t(suspend ? 'adminx.users.suspendTitle' : 'adminx.users.reactivateTitle', { name: user.name })}
      description={t(suspend ? 'adminx.users.suspendText' : 'adminx.users.reactivateText')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant={suspend ? 'danger' : 'primary'} loading={saving} onClick={send}>{t(suspend ? 'adminx.users.suspend' : 'adminx.users.reactivate')}</Button>
        </>
      }
    >
      {error && <Alert tone="danger">{te(error)}</Alert>}
      <TemplatePicker kind={suspend ? 'user_suspend' : 'user_reactivate'} onPick={setReason} />
      <TextArea label={t('adminx.users.reasonLabel')} required maxLength={300} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} error={reasonError} hint={t('adminx.users.reasonHint')} />
    </Dialog>
  );
}

function UserDrawer({ id, onClose, onChanged }) {
  const { t, te, formatDate, formatNumber } = useT();
  const { user: me } = useAuth();
  const { categoryLabel } = useTaxonomy();
  const detail = useApiQuery(`/admin/users/${id}`);
  const [asking, setAsking] = useState(false);
  const [workerTab, setWorkerTab] = useState('profile'); // Module 4: Profile | Reputation
  const u = detail.data?.user;
  const w = detail.data?.worker;
  const isSelf = u && me && u._id === me._id;
  const actionLabel = (action) => (t(actionKey(action)) === actionKey(action) ? action : t(actionKey(action)));
  // Module 4: the worker summary is the first tab, the reputation breakdown the second
  const workerSummary = w ? (
              <section aria-labelledby="worker-summary">
                <h3 id="worker-summary" className={styles.sectionTitle}>{t('adminx.users.workerSummary')}</h3>
                {!w.profileId ? (
                  <p className={styles.method}>{t('adminx.users.noProfile')}</p>
                ) : (
                  <dl className={styles.details}>
                    <div><dt>{t('adminx.users.workerId')}</dt><dd className="tabular" dir="ltr">{w.workerIdCode}</dd></div>
                    <div><dt>{t('adminx.users.trade')}</dt><dd>{w.occupation || t('common.empty')} · {categoryLabel(w.category) || t('common.empty')}</dd></div>
                    <div><dt>{t('adminx.users.identity')}</dt><dd><StatusChip kind="identity" status={w.verificationStatus} /></dd></div>
                    <div><dt>{t('adminx.users.skills')}</dt><dd className="tabular">{formatNumber(w.skills)}</dd></div>
                    <div><dt>{t('adminx.users.completion')}</dt><dd className="tabular">{formatNumber(w.profileCompletion)}%</dd></div>
                    <div><dt>{t('adminx.users.proof')}</dt><dd>{t('adminx.users.proofCounts', w.evidence)}</dd></div>
                  </dl>
                )}
                {w.workerIdCode && <p><Link to={`/admin/identity?status=All&q=${encodeURIComponent(w.workerIdCode)}`}>{t('adminx.users.openIdentity')}</Link></p>}
              </section>
  ) : null;

  return (
    <>
      <Drawer open onClose={onClose} title={u ? u.name : t('adminx.users.account')} description={t('adminx.users.detailText')}>
        {detail.error && <Alert tone="danger">{te(detail.error)}</Alert>}
        {detail.loading && <Skeleton variant="block" height={280} />}
        {u && (
          <>
            <div className={styles.statusRow}>
              <StatusChip kind="account" status={u.status} />
              <Badge>{t(`roles.${u.role}`)}</Badge>
              {u.lockedNow && <Badge tone="warning" icon={LockKeyhole}>{t('adminx.users.lockedNow')}</Badge>}
            </div>
            <dl className={styles.details}>
              <div><dt>{t('adminx.users.columns.email')}</dt><dd dir="ltr">{u.email}</dd></div>
              <div><dt>{t('adminx.users.columns.phone')}</dt><dd className="tabular" dir="ltr">{u.phone}</dd></div>
              <div><dt>{t('adminx.users.joined')}</dt><dd className="tabular">{formatDate(u.createdAt)}</dd></div>
              {u.status === 'suspended' && (
                <>
                  <div><dt>{t('adminx.users.suspendedOn')}</dt><dd className="tabular">{formatDate(u.suspendedAt, { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
                  <div><dt>{t('adminx.users.reason')}</dt><dd dir="auto">{u.suspensionReason}</dd></div>
                </>
              )}
            </dl>

            {w && !w.profileId && workerSummary}
            {w && w.profileId && (
              <Tabs
                label={t('adminm4.breakdown.tabs')}
                value={workerTab}
                onChange={setWorkerTab}
                tabs={[
                  { id: 'profile', label: t('adminx.users.workerSummary'), content: workerSummary },
                  { id: 'reputation', label: t('reputation.title'), content: <ReputationBreakdown profileId={w.profileId} /> },
                ]}
              />
            )}
            {detail.data.customer && (
              <section aria-labelledby="customer-summary">
                <h3 id="customer-summary" className={styles.sectionTitle}>{t('adminx.users.customerSummary')}</h3>
                <p>{t('adminx.users.savedWorkers', { count: detail.data.customer.savedWorkers })}</p>
              </section>
            )}

            <section aria-labelledby="user-activity">
              <h3 id="user-activity" className={styles.sectionTitle}>{t('adminx.users.activity')}</h3>
              {detail.data.activity.length === 0 ? (
                <p className={styles.method}>{t('adminx.users.noActivity')}</p>
              ) : (
                <ol className={styles.activity}>
                  {detail.data.activity.map((entry) => (
                    <li key={entry.seq}>
                      <strong>{actionLabel(entry.action)}</strong>
                      <span className={styles.method}> · <time dateTime={entry.createdAt}>{formatDate(entry.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</time></span>
                      {entry.reason && <p className={styles.method} dir="auto">{entry.reason}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {u.role === 'admin' ? (
              <Alert tone="info">{t(isSelf ? 'adminx.users.selfNote' : 'adminx.users.adminNote')}</Alert>
            ) : (
              <div className={styles.actions}>
                <Button variant={u.status === 'suspended' ? 'primary' : 'danger'} icon={u.status === 'suspended' ? RotateCcw : Ban} onClick={() => setAsking(true)}>
                  {t(u.status === 'suspended' ? 'adminx.users.reactivate' : 'adminx.users.suspend')}
                </Button>
              </div>
            )}
          </>
        )}
      </Drawer>
      {asking && u && (
        <StatusDialog
          user={u}
          onClose={() => setAsking(false)}
          onDone={() => {
            setAsking(false);
            detail.reload();
            onChanged();
          }}
        />
      )}
    </>
  );
}

export default function AdminUsers() {
  const { t, te, formatDate } = useT();
  useDocumentTitle(t('adminx.titles.users'));
  const [params, setParams] = useSearchParams();
  const role = ROLES.includes(params.get('role')) ? params.get('role') : 'all';
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : 'all';
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const [q, setQ] = useState(params.get('q') ?? '');
  const [selected, setSelected] = useState(null);

  // Filters live in the address bar; changing one goes back to page 1.
  const set = (changes) => {
    const next = new URLSearchParams(params);
    next.delete('page');
    for (const [key, value] of Object.entries(changes)) {
      if (value && value !== 'all') next.set(key, value); else next.delete(key);
    }
    setParams(next);
  };
  const query = { page: String(page), limit: String(PAGE_SIZE) };
  if (role !== 'all') query.role = role;
  if (status !== 'all') query.status = status;
  if (params.get('q')) query.q = params.get('q');
  const { data, error, reload } = useApiQuery('/admin/users', query);

  const columns = [
    { key: 'name', header: t('adminx.users.columns.name'), minWidth: '10rem', sortable: true, sortValue: (u) => u.name, render: (u) => <span dir="auto">{u.name}</span> },
    { key: 'email', header: t('adminx.users.columns.email'), render: (u) => <span dir="ltr" className={styles.wrapAnywhere}>{u.email}</span> },
    { key: 'phone', header: t('adminx.users.columns.phone'), render: (u) => <span className="tabular" dir="ltr">{u.phone}</span> },
    { key: 'role', header: t('adminx.users.columns.role'), sortable: true, sortValue: (u) => u.role, render: (u) => t(`roles.${u.role}`) },
    { key: 'status', header: t('adminx.users.columns.status'), render: (u) => <StatusChip kind="account" status={u.status} /> },
    { key: 'joined', header: t('adminx.users.columns.joined'), sortable: true, sortValue: (u) => u.createdAt, render: (u) => <span className="tabular">{formatDate(u.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeader title={t('adminx.users.title')} description={t('adminx.users.lead')} />
      <form className={styles.filters} role="search" onSubmit={(e) => { e.preventDefault(); set({ q: q.trim() }); }}>
        <TextField label={t('adminx.users.search')} type="search" icon={Search} maxLength={50} value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label={t('adminx.users.role')} value={role} onChange={(e) => set({ role: e.target.value })} options={ROLES.map((r) => ({ value: r, label: r === 'all' ? t('adminx.users.allRoles') : t(`roles.${r}`) }))} />
        <Select label={t('adminx.users.status')} value={status} onChange={(e) => set({ status: e.target.value })} options={STATUSES.map((s) => ({ value: s, label: t(`adminx.users.statuses.${s}`) }))} />
        <Button type="submit" icon={Search}>{t('common.search')}</Button>
      </form>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <div aria-busy="true"><span className="visually-hidden" role="status">{t('common.loading')}</span><Skeleton variant="block" height={240} /></div>}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{t('adminx.users.count', { count: data.total })}</p>
          <DataTable
            caption={t('adminx.users.caption')}
            columns={columns}
            rows={data.users}
            rowKey={(u) => u._id}
            onRowClick={(u) => setSelected(u._id)}
            rowLabel={(u) => t('adminx.users.open', { name: u.name })}
            empty={<EmptyState art="empty-search" headingLevel={2} title={t('adminx.users.emptyTitle')} description={t('adminx.users.emptyText')} />}
          />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={(p) => { const next = new URLSearchParams(params); if (p > 1) next.set('page', String(p)); else next.delete('page'); setParams(next); }} />
        </>
      )}
      {selected && <UserDrawer key={selected} id={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </div>
  );
}

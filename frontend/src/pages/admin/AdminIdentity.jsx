import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import API from '../../api';
import {
  Alert, Badge, Button, ConfirmDialog, DataTable, Drawer, EmptyState, PageHeader, Pagination, RadioCardGroup, Select, Skeleton, StatusChip, TextArea, TextField, useToast,
} from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiError } from '../../utils/apiErrors';
import { useDocumentTitle, useT } from '../../i18n';
import { useApiQuery } from '../../hooks/useApiQuery';
import WaitingBadge from '../../features/admin/WaitingBadge';
import TemplatePicker from '../../features/admin/TemplatePicker';
import ShortcutsHelp, { ShortcutsButton } from '../../features/admin/ShortcutsHelp';
import { useReviewShortcuts } from '../../features/admin/useReviewShortcuts';
import styles from './Admin.module.css';

const STATUSES = ['Pending', 'Unverified', 'Verified', 'Rejected', 'All'];
const PAGE_SIZE = 25;

// Decision panel for one worker: CNIC reveal through a ConfirmDialog (audited), and a decision
// that always needs a note (M1-9).
// Keyboard (feature 30): A = verified, R = not accepted, J / K = next / previous worker, ? = help.
function DecisionDrawer({ worker, onClose, onDecided, onNext, onPrevious }) {
  const toast = useToast();
  const { t, te } = useT();
  const { categoryLabel } = useTaxonomy();
  const [status, setStatus] = useState(worker?.cnicOnFile ? 'Verified' : 'Rejected');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [cnic, setCnic] = useState('');
  const [help, setHelp] = useState(false);
  const shortcuts = useMemo(
    () => ({
      approve: () => worker?.cnicOnFile && setStatus('Verified'),
      reject: () => setStatus('Rejected'),
      next: onNext,
      previous: onPrevious,
      help: () => setHelp(true),
    }),
    [worker, onNext, onPrevious]
  );
  useReviewShortcuts(shortcuts, Boolean(worker) && !confirmReveal && !help);

  const reveal = async () => {
    setRevealing(true);
    try {
      const { data } = await API.get(`/admin/workers/${worker._id}/cnic`);
      setCnic(data.cnic);
    } catch (err) {
      setError(apiError(err, 'admin.identity.revealFailed'));
    } finally {
      setRevealing(false);
      setConfirmReveal(false);
    }
  };

  const decide = async () => {
    setError(null);
    if (note.trim().length < 5) {
      setNoteError('validation.identityNote');
      return;
    }
    setNoteError(null);
    setSaving(true);
    try {
      await API.patch(`/admin/workers/${worker._id}/identity`, { status, note: note.trim() });
      toast.show({ title: t('admin.identity.decided', { status: t(`status.identityShort.${status}`) }), message: t('admin.identity.decidedText') });
      onDecided();
    } catch (err) {
      setError(apiError(err, 'admin.identity.saveFailed'));
      setSaving(false);
    }
  };

  return (
    <>
      <Drawer
        open={Boolean(worker)}
        onClose={onClose}
        title={worker ? `${worker.user?.name ?? t('common.worker')} · ${worker.workerIdCode}` : ''}
        description={t('admin.identity.drawerText')}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
            <Button onClick={decide} loading={saving}>{t('admin.identity.saveDecision')}</Button>
          </>
        }
      >
        {worker && (
          <>
            {error && <Alert tone="danger">{te(error)}</Alert>}
            <div className={styles.drawerTools}>
              {worker.verificationStatus === 'Pending' ? <WaitingBadge since={worker.identityRequestedAt ?? worker.updatedAt} /> : <span />}
              <ShortcutsButton onClick={() => setHelp(true)} />
            </div>
            <dl className={styles.details}>
              <div><dt>{t('admin.identity.current')}</dt><dd><StatusChip kind="identity" status={worker.verificationStatus} /></dd></div>
              <div><dt>{t('admin.identity.phone')}</dt><dd className="tabular" dir="ltr">{worker.user?.phone}</dd></div>
              <div><dt>{t('admin.identity.email')}</dt><dd dir="ltr">{worker.user?.email}</dd></div>
              <div><dt>{t('admin.identity.trade')}</dt><dd>{worker.occupation || t('common.empty')} · {categoryLabel(worker.category) || t('common.empty')}</dd></div>
              <div><dt>{t('admin.identity.city')}</dt><dd>{worker.city || t('common.empty')}</dd></div>
              <div>
                <dt>{t('admin.identity.cnic')}</dt>
                <dd>
                  {!worker.cnicOnFile ? (
                    t('admin.identity.cnicNotSaved')
                  ) : cnic ? (
                    <span className="tabular" dir="ltr">{cnic}</span>
                  ) : (
                    <span className={styles.cnicRow}>
                      <span className="tabular" dir="ltr" aria-label={t('admin.identity.cnicHidden')}>•••••-•••••••-•</span>
                      <Button size="sm" variant="secondary" icon={Eye} onClick={() => setConfirmReveal(true)}>{t('admin.identity.reveal')}</Button>
                    </span>
                  )}
                </dd>
              </div>
              {worker.identityNote && <div><dt>{t('admin.identity.lastNote')}</dt><dd dir="auto">{worker.identityNote}</dd></div>}
            </dl>
            <RadioCardGroup
              legend={t('admin.identity.decision')}
              name="identity-decision"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'Verified', title: t('admin.identity.verifiedTitle'), description: worker.cnicOnFile ? t('admin.identity.verifiedText') : t('admin.identity.verifiedImpossible'), disabled: !worker.cnicOnFile },
                { value: 'Rejected', title: t('admin.identity.rejectedTitle'), description: t('admin.identity.rejectedText') },
              ]}
            />
            <TemplatePicker kind={status === 'Verified' ? 'identity_verify' : 'identity_reject'} onPick={setNote} />
            <TextArea
              label={t('admin.identity.note')}
              required
              maxLength={500}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              error={noteError}
              hint={t('admin.identity.noteHint')}
            />
          </>
        )}
      </Drawer>
      <ShortcutsHelp open={help} onClose={() => setHelp(false)} />
      <ConfirmDialog
        open={confirmReveal}
        title={t('admin.identity.revealTitle')}
        message={t('admin.identity.revealText')}
        confirmLabel={t('admin.identity.revealConfirm')}
        loading={revealing}
        onConfirm={reveal}
        onCancel={() => setConfirmReveal(false)}
      />
    </>
  );
}

export default function AdminIdentity() {
  const { t, te, formatDate } = useT();
  useDocumentTitle(t('titles.adminIdentity'));
  const { categoryLabel } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : 'Pending';
  const [q, setQ] = useState(params.get('q') ?? '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const query = { status, page: String(page), limit: String(PAGE_SIZE) };
  if (params.get('q')) query.q = params.get('q');
  const { data, error, reload } = useApiQuery('/admin/workers', query);

  // J / K in the drawer: the next or previous worker of this page of the list.
  const step = (by) => {
    const list = data?.workers ?? [];
    const at = list.findIndex((w) => w._id === selected?._id);
    const next = list[at + by];
    if (next) setSelected(next);
  };

  const columns = [
    { key: 'name', header: t('admin.identity.columns.worker'), sortable: true, sortValue: (w) => w.user?.name ?? '', minWidth: '11rem', render: (w) => w.user?.name ?? t('common.empty'), sub: (w) => <span className="tabular" dir="ltr">{w.workerIdCode}</span> },
    { key: 'trade', header: t('admin.identity.columns.trade'), minWidth: '10rem', sortable: true, sortValue: (w) => w.occupation, render: (w) => (w.occupation ? `${w.occupation} · ${categoryLabel(w.category)}` : t('common.empty')) },
    { key: 'city', header: t('admin.identity.columns.city'), sortable: true, sortValue: (w) => w.city, render: (w) => w.city || t('common.empty') },
    { key: 'cnic', header: t('admin.identity.columns.cnic'), render: (w) => (w.cnicOnFile ? <Badge tone="primary">{t('admin.identity.onFile')}</Badge> : <Badge>{t('admin.identity.notSaved')}</Badge>) },
    { key: 'status', header: t('admin.identity.columns.identity'), render: (w) => <StatusChip kind="identity" status={w.verificationStatus} /> },
    { key: 'waiting', header: t('adminx.waiting.column'), sortable: true, sortValue: (w) => w.identityRequestedAt ?? w.updatedAt, render: (w) => (w.verificationStatus === 'Pending' ? <WaitingBadge since={w.identityRequestedAt ?? w.updatedAt} /> : t('common.empty')) },
    { key: 'updated', header: t('admin.identity.columns.updated'), sortable: true, sortValue: (w) => w.updatedAt, render: (w) => <span className="tabular">{formatDate(w.updatedAt)}</span> },
  ];

  return (
    <div>
      <PageHeader title={t('admin.identity.title')} description={t('admin.identity.lead')} />
      <form
        className={styles.filters}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          const next = new URLSearchParams(params);
          if (q.trim()) next.set('q', q.trim()); else next.delete('q');
          setParams(next);
        }}
      >
        <Select label={t('admin.identity.status')} value={status} onChange={(e) => { setPage(1); const next = new URLSearchParams(params); next.set('status', e.target.value); setParams(next); }} options={STATUSES.map((s) => ({ value: s, label: t(`status.identityShort.${s}`) }))} />
        <TextField label={t('admin.identity.search')} maxLength={50} value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" icon={Search}>{t('common.search')}</Button>
      </form>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <div aria-busy="true"><span className="visually-hidden" role="status">{t('common.loading')}</span><Skeleton variant="block" height={240} /></div>}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{t('admin.identity.count', { count: data.total })}</p>
          <DataTable
            caption={t('admin.identity.caption')}
            columns={columns}
            rows={data.workers}
            rowKey={(w) => w._id}
            onRowClick={setSelected}
            rowLabel={(w) => t('admin.identity.review', { name: w.user?.name ?? t('common.worker') })}
            empty={<EmptyState art="all-done" headingLevel={2} title={t('admin.identity.emptyTitle')} description={t('admin.identity.emptyText')} />}
          />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {selected && (
        <DecisionDrawer
          key={selected._id}
          worker={selected}
          onNext={() => step(1)}
          onPrevious={() => step(-1)}
          onClose={() => setSelected(null)}
          onDecided={() => {
            setSelected(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

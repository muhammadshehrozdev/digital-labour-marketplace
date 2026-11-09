import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Inbox, ZoomIn, ZoomOut } from 'lucide-react';
import API from '../../api';
import {
  Alert, Badge, Button, DataTable, Dialog, Drawer, EmptyState, PageHeader, Pagination, Select, Skeleton, StatusChip, Switch, TextArea, useToast,
} from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiError } from '../../utils/apiErrors';
import { EVIDENCE_TYPES, REASON_CODES, evidenceFileUrl } from '../../features/evidence/evidenceText';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

const STATUSES = ['pending', 'approved', 'rejected', 'suspected_fake', 'revoked', 'all'];
const PAGE_SIZE = 25;

// Texts: admin.evidence.actions.<action>.{label,title,help}
const ACTION_UI = {
  approve: { tone: 'primary', needs: null },
  reject: { tone: 'danger', needs: 'code' },
  suspected_fake: { tone: 'danger', needs: 'note' },
  revoke: { tone: 'danger', needs: 'note' },
};

// Asks for the reason the action needs, then sends PATCH /api/admin/evidence/:id.
function DecisionDialog({ action, evidenceId, onClose, onDone }) {
  const toast = useToast();
  const { t, te } = useT();
  const ui = ACTION_UI[action];
  const text = (key) => t(`admin.evidence.actions.${action}.${key}`);
  const [reasonCode, setReasonCode] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    const found = {};
    if (ui.needs === 'code' && !reasonCode) found.reasonCode = 'validation.reasonChoose';
    if (ui.needs === 'code' && reasonCode === 'other' && note.trim().length < 5) found.note = 'validation.reasonOther';
    if (ui.needs === 'note' && note.trim().length < 5) found.note = 'validation.reasonNote';
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setError(null);
    const body = { action };
    if (reasonCode) body.reasonCode = reasonCode;
    if (note.trim()) body.note = note.trim();
    try {
      const { data } = await API.patch(`/admin/evidence/${evidenceId}`, body);
      toast.show({ title: t('admin.evidence.saved', { action: text('label') }), message: t('admin.evidence.savedText') });
      onDone(data);
    } catch (err) {
      setError(apiError(err, 'admin.evidence.saveFailed'));
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={text('title')}
      description={text('help')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant={ui.tone === 'danger' ? 'danger' : 'primary'} loading={saving} onClick={send}>{text('label')}</Button>
        </>
      }
    >
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {ui.needs === 'code' && (
        <Select
          label={t('admin.evidence.reason')}
          required
          placeholder={t('admin.evidence.reasonPlaceholder')}
          value={reasonCode}
          onChange={(e) => setReasonCode(e.target.value)}
          options={REASON_CODES.map((value) => ({ value, label: t(`evidence.reasons.${value}`) }))}
          error={errors.reasonCode}
        />
      )}
      {ui.needs !== null && (
        <TextArea
          label={ui.needs === 'note' ? t('admin.evidence.reason') : t('admin.evidence.noteOptional')}
          required={ui.needs === 'note'}
          maxLength={500}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          error={errors.note}
        />
      )}
    </Dialog>
  );
}

function ImageViewer({ id, alt }) {
  const { t } = useT();
  const [zoom, setZoom] = useState(false);
  return (
    <figure className={styles.viewer}>
      <div className={[styles.viewerFrame, zoom && styles.zoomed].filter(Boolean).join(' ')}>
        <img src={evidenceFileUrl(id)} alt={alt} />
      </div>
      <Button size="sm" variant="secondary" icon={zoom ? ZoomOut : ZoomIn} onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>
        {zoom ? t('admin.evidence.fit') : t('admin.evidence.zoom')}
      </Button>
    </figure>
  );
}

function ReviewDrawer({ id, onClose, onChanged }) {
  const { t, te, formatDate } = useT();
  const detail = useApiQuery(`/admin/evidence/${id}`);
  const [action, setAction] = useState(null);
  const e = detail.data?.evidence;
  const c = detail.data?.opinion; // admin-only numbers b, d, u, E
  const dup = detail.data?.duplicate;
  return (
    <>
      <Drawer open onClose={onClose} title={e ? `${e.skillName} · ${t(`evidence.types.${e.type}.title`)}` : t('admin.evidence.proof')} description={e ? `${e.worker?.name ?? t('common.worker')} · ${e.workerIdCode ?? ''}` : undefined}>
        {detail.error && <Alert tone="danger">{te(detail.error)}</Alert>}
        {detail.loading && <Skeleton variant="block" height={280} />}
        {e && (
          <>
            <div className={styles.statusRow}>
              <StatusChip kind="evidence" status={e.status} />
              {e.duplicateKind && <Badge tone="warning">{e.duplicateKind === 'exact' ? t('admin.evidence.sameAsOther') : t('admin.evidence.looksLike', { distance: e.duplicateDistance })}</Badge>}
            </div>
            {dup ? (
              <div className={styles.compare}>
                <div>
                  <p className={styles.compareLabel}>{t('admin.evidence.thisUpload')}</p>
                  <ImageViewer id={e._id} alt={t('admin.evidence.proofAlt', { skill: e.skillName })} />
                </div>
                <div>
                  <p className={styles.compareLabel}>{t('admin.evidence.possibleDuplicate', { name: dup.worker?.name ?? '', id: dup.workerIdCode ?? '', skill: dup.skillName ?? '' })}</p>
                  <ImageViewer id={dup._id} alt={t('admin.evidence.duplicateAlt', { name: dup.worker?.name ?? t('common.worker') })} />
                </div>
              </div>
            ) : (
              <ImageViewer id={e._id} alt={t('admin.evidence.proofAlt', { skill: e.skillName })} />
            )}
            <dl className={styles.details}>
              <div><dt>{t('admin.evidence.details.title')}</dt><dd dir="auto">{e.title || t('common.empty')}</dd></div>
              <div><dt>{t('admin.evidence.details.uploaded')}</dt><dd className="tabular">{formatDate(e.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
              <div><dt>{t('admin.evidence.details.image')}</dt><dd className="tabular">{t('admin.evidence.imageInfo', { width: e.width, height: e.height, size: Math.max(1, Math.round(e.size / 1024)) })}</dd></div>
              {e.reviewNote && <div><dt>{t('admin.evidence.details.last')}</dt><dd dir="auto">{e.reviewNote}</dd></div>}
            </dl>
            {c && (
              <section className={styles.numbers} aria-labelledby="numbers-title">
                <h3 id="numbers-title" className={styles.numbersTitle}>{t('admin.evidence.numbersTitle')}</h3>
                <dl className={styles.numberGrid} dir="ltr">
                  <div><dt>{t('admin.evidence.numbers.belief')}</dt><dd className="tabular">{c.belief.toFixed(3)}</dd></div>
                  <div><dt>{t('admin.evidence.numbers.disbelief')}</dt><dd className="tabular">{c.disbelief.toFixed(3)}</dd></div>
                  <div><dt>{t('admin.evidence.numbers.uncertainty')}</dt><dd className="tabular">{c.uncertainty.toFixed(3)}</dd></div>
                  <div><dt>{t('admin.evidence.numbers.expected')}</dt><dd className="tabular">{c.expected.toFixed(3)}</dd></div>
                </dl>
                <p className={styles.method}>{t('admin.evidence.method', { r: c.r, s: c.s })}</p>
                <div className={styles.statusRow}><StatusChip kind="skill" status={c.status} /></div>
              </section>
            )}
            {e.allowedActions.length > 0 ? (
              <div className={styles.actions}>
                {e.allowedActions.map((a) => (
                  <Button key={a} variant={a === 'approve' ? 'primary' : a === 'reject' ? 'secondary' : 'danger'} onClick={() => setAction(a)}>
                    {t(`admin.evidence.actions.${a}.label`)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className={styles.method}>{t('admin.evidence.noAction')}</p>
            )}
          </>
        )}
      </Drawer>
      {action && e && (
        <DecisionDialog
          action={action}
          evidenceId={e._id}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            detail.reload();
            onChanged();
          }}
        />
      )}
    </>
  );
}

export default function AdminEvidence() {
  const { t, te, formatDate } = useT();
  useDocumentTitle(t('titles.adminEvidence'));
  const { skills, categoryLabel } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : 'pending';
  const type = params.get('type') ?? 'all';
  const skillId = params.get('skillId') ?? '';
  const duplicates = params.get('duplicates') === 'true';
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'all') next.set(key, value); else next.delete(key);
    setPage(1);
    setParams(next);
  };
  const query = { status, page: String(page), limit: String(PAGE_SIZE) };
  if (type !== 'all') query.type = type;
  if (skillId) query.skillId = skillId;
  if (duplicates) query.duplicates = 'true';
  const { data, error, reload } = useApiQuery('/admin/evidence', query);

  const columns = [
    { key: 'worker', header: t('admin.evidence.columns.worker'), render: (e) => e.worker?.name ?? t('common.empty') },
    { key: 'id', header: t('admin.evidence.columns.id'), render: (e) => <span className="tabular" dir="ltr">{e.workerIdCode}</span> },
    { key: 'skill', header: t('admin.evidence.columns.skill'), sortable: true, sortValue: (e) => e.skillName, render: (e) => e.skillName },
    { key: 'type', header: t('admin.evidence.columns.type'), render: (e) => t(`evidence.types.${e.type}.title`) },
    { key: 'uploaded', header: t('admin.evidence.columns.uploaded'), sortable: true, sortValue: (e) => e.createdAt, render: (e) => <span className="tabular">{formatDate(e.createdAt)}</span> },
    { key: 'status', header: t('admin.evidence.columns.status'), render: (e) => <StatusChip kind="evidence" status={e.status} /> },
    { key: 'dup', header: t('admin.evidence.columns.dup'), render: (e) => (e.duplicateKind ? <Badge tone="warning">{e.duplicateKind === 'exact' ? t('admin.evidence.samePhoto') : t('admin.evidence.lookAlike')}</Badge> : t('common.empty')) },
  ];

  return (
    <div>
      <PageHeader title={t('admin.evidence.title')} description={t('admin.evidence.lead')} />
      <div className={styles.filters}>
        <Select label={t('admin.evidence.status')} value={status} onChange={(e) => set('status', e.target.value)} options={STATUSES.map((s) => ({ value: s, label: t(`status.evidence.${s}`) }))} />
        <Select label={t('admin.evidence.type')} value={type} onChange={(e) => set('type', e.target.value)} options={[{ value: 'all', label: t('admin.evidence.allTypes') }, ...EVIDENCE_TYPES.map((o) => ({ value: o.value, label: t(`evidence.types.${o.value}.title`) }))]} />
        <Select label={t('admin.evidence.skill')} value={skillId} onChange={(e) => set('skillId', e.target.value)} placeholder={t('admin.evidence.allSkills')} options={skills.map((s) => ({ value: s.id, label: `${s.name} (${categoryLabel(s.category)})` }))} />
        <Switch label={t('admin.evidence.duplicatesOnly')} checked={duplicates} onChange={(on) => set('duplicates', on ? 'true' : '')} />
      </div>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <div aria-busy="true"><span className="visually-hidden" role="status">{t('common.loading')}</span><Skeleton variant="block" height={240} /></div>}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{t('admin.evidence.count', { count: data.total })}</p>
          <DataTable
            caption={t('admin.evidence.caption')}
            columns={columns}
            rows={data.evidence}
            rowKey={(e) => e._id}
            onRowClick={(e) => setSelected(e._id)}
            rowLabel={(e) => t('admin.evidence.review', { name: e.worker?.name ?? t('common.worker'), skill: e.skillName })}
            empty={<EmptyState icon={Inbox} headingLevel={2} title={t('admin.evidence.emptyTitle')} description={t('admin.evidence.emptyText')} />}
          />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {selected && <ReviewDrawer key={selected} id={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </div>
  );
}

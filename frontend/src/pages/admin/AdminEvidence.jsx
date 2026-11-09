import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Inbox, ZoomIn, ZoomOut } from 'lucide-react';
import API from '../../api';
import {
  Alert, Badge, Button, DataTable, Dialog, Drawer, EmptyState, PageHeader, Pagination, Select, Skeleton, StatusChip, Switch, TextArea, useToast,
} from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiMessage } from '../../utils/apiErrors';
import { TYPE_LABEL, TYPE_OPTIONS, REASON_TEXT, evidenceFileUrl } from '../../features/evidence/evidenceText';
import styles from './Admin.module.css';

const STATUSES = [
  { value: 'pending', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Not accepted' },
  { value: 'suspected_fake', label: 'Suspected fake' },
  { value: 'revoked', label: 'Approval withdrawn' },
  { value: 'all', label: 'All' },
];
const PAGE_SIZE = 25;

const ACTION_UI = {
  approve: { label: 'Approve', title: 'Approve this proof?', tone: 'primary', needs: null, help: 'The skill will show "Verified by evidence" (unless a suspected fake exists).' },
  reject: { label: 'Reject', title: 'Reject this proof', tone: 'danger', needs: 'code', help: 'The worker sees the reason. A rejection does not count against the worker.' },
  suspected_fake: { label: 'Suspected fake', title: 'Mark as suspected fake', tone: 'danger', needs: 'note', help: 'The skill will show "Disputed". The worker cannot delete this item.' },
  revoke: { label: 'Revoke approval', title: 'Revoke the approval', tone: 'danger', needs: 'note', help: 'Use this to correct a mistaken approval. The item stops counting.' },
};

// Asks for the reason the action needs, then sends PATCH /api/admin/evidence/:id.
function DecisionDialog({ action, evidenceId, onClose, onDone }) {
  const toast = useToast();
  const ui = ACTION_UI[action];
  const [reasonCode, setReasonCode] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    const found = {};
    if (ui.needs === 'code' && !reasonCode) found.reasonCode = 'Choose a reason.';
    if (ui.needs === 'code' && reasonCode === 'other' && note.trim().length < 5) found.note = 'Write the reason (at least 5 characters).';
    if (ui.needs === 'note' && note.trim().length < 5) found.note = 'A written reason (at least 5 characters) is required.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setError('');
    const body = { action };
    if (reasonCode) body.reasonCode = reasonCode;
    if (note.trim()) body.note = note.trim();
    try {
      const { data } = await API.patch(`/admin/evidence/${evidenceId}`, body);
      toast.show({ title: `${ui.label}: saved`, message: 'The decision was written to the audit log.' });
      onDone(data);
    } catch (err) {
      setError(apiMessage(err, 'Could not save the decision.'));
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={ui.title}
      description={ui.help}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={ui.tone === 'danger' ? 'danger' : 'primary'} loading={saving} onClick={send}>{ui.label}</Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      {ui.needs === 'code' && (
        <Select
          label="Reason"
          required
          placeholder="Choose a reason"
          value={reasonCode}
          onChange={(e) => setReasonCode(e.target.value)}
          options={Object.entries(REASON_TEXT).map(([value, label]) => ({ value, label }))}
          error={errors.reasonCode}
        />
      )}
      {ui.needs !== null && (
        <TextArea
          label={ui.needs === 'note' ? 'Reason' : 'Note for the worker (optional)'}
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
  const [zoom, setZoom] = useState(false);
  return (
    <figure className={styles.viewer}>
      <div className={[styles.viewerFrame, zoom && styles.zoomed].filter(Boolean).join(' ')}>
        <img src={evidenceFileUrl(id)} alt={alt} />
      </div>
      <Button size="sm" variant="secondary" icon={zoom ? ZoomOut : ZoomIn} onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>
        {zoom ? 'Fit to panel' : 'Zoom to full size'}
      </Button>
    </figure>
  );
}

function ReviewDrawer({ id, onClose, onChanged }) {
  const detail = useApiQuery(`/admin/evidence/${id}`);
  const [action, setAction] = useState(null);
  const e = detail.data?.evidence;
  const c = detail.data?.opinion; // admin-only numbers b, d, u, E
  const dup = detail.data?.duplicate;
  return (
    <>
      <Drawer open onClose={onClose} title={e ? `${e.skillName} · ${TYPE_LABEL[e.type]}` : 'Proof'} description={e ? `${e.worker?.name ?? 'Worker'} · ${e.workerIdCode ?? ''}` : undefined}>
        {detail.error && <Alert tone="danger">{detail.error}</Alert>}
        {detail.loading && <Skeleton variant="block" height={280} />}
        {e && (
          <>
            <div className={styles.statusRow}>
              <StatusChip kind="evidence" status={e.status} />
              {e.duplicateKind && <Badge tone="warning">{e.duplicateKind === 'exact' ? 'Same photo as another worker' : `Looks like another worker's photo (distance ${e.duplicateDistance})`}</Badge>}
            </div>
            {dup ? (
              <div className={styles.compare}>
                <div>
                  <p className={styles.compareLabel}>This upload</p>
                  <ImageViewer id={e._id} alt={`Proof for ${e.skillName}`} />
                </div>
                <div>
                  <p className={styles.compareLabel}>Possible duplicate: {dup.worker?.name} · {dup.workerIdCode} · {dup.skillName}</p>
                  <ImageViewer id={dup._id} alt={`Possible duplicate from ${dup.worker?.name ?? 'another worker'}`} />
                </div>
              </div>
            ) : (
              <ImageViewer id={e._id} alt={`Proof for ${e.skillName}`} />
            )}
            <dl className={styles.details}>
              <div><dt>Title</dt><dd dir="auto">{e.title || '—'}</dd></div>
              <div><dt>Uploaded</dt><dd className="tabular">{new Date(e.createdAt).toLocaleString('en-GB')}</dd></div>
              <div><dt>Image</dt><dd className="tabular">{e.width} × {e.height} px, WebP, {Math.max(1, Math.round(e.size / 1024))} KB (metadata removed)</dd></div>
              {e.reviewNote && <div><dt>Last decision</dt><dd>{e.reviewNote}</dd></div>}
            </dl>
            {c && (
              <section className={styles.numbers} aria-labelledby="numbers-title">
                <h3 id="numbers-title" className={styles.numbersTitle}>Evidence for this skill (all items)</h3>
                <dl className={styles.numberGrid}>
                  <div><dt>belief b</dt><dd className="tabular">{c.belief.toFixed(3)}</dd></div>
                  <div><dt>disbelief d</dt><dd className="tabular">{c.disbelief.toFixed(3)}</dd></div>
                  <div><dt>uncertainty u</dt><dd className="tabular">{c.uncertainty.toFixed(3)}</dd></div>
                  <div><dt>expected E</dt><dd className="tabular">{c.expected.toFixed(3)}</dd></div>
                </dl>
                <p className={styles.method}>
                  How this is computed: r = {c.r} (approved: certificate 2, work photo or letter 1), s = {c.s} (suspected fakes),
                  b = r/(r+s+2), d = s/(r+s+2), u = 2/(r+s+2), E = b + 0.5·u. Weights are provisional (D-014). Shown to admins only.
                </p>
                <div className={styles.statusRow}><StatusChip kind="skill" status={c.status} /></div>
              </section>
            )}
            {e.allowedActions.length > 0 ? (
              <div className={styles.actions}>
                {e.allowedActions.map((a) => (
                  <Button key={a} variant={a === 'approve' ? 'primary' : a === 'reject' ? 'secondary' : 'danger'} onClick={() => setAction(a)}>
                    {ACTION_UI[a].label}
                  </Button>
                ))}
              </div>
            ) : (
              <p className={styles.method}>No further decision is possible for this item.</p>
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
  const { skills, categoryLabel } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const status = STATUSES.some((s) => s.value === params.get('status')) ? params.get('status') : 'pending';
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
    { key: 'worker', header: 'Worker', render: (e) => e.worker?.name ?? '—' },
    { key: 'id', header: 'Worker ID', render: (e) => <span className="tabular">{e.workerIdCode}</span> },
    { key: 'skill', header: 'Skill', sortable: true, sortValue: (e) => e.skillName, render: (e) => e.skillName },
    { key: 'type', header: 'Type', render: (e) => TYPE_LABEL[e.type] },
    { key: 'uploaded', header: 'Uploaded', sortable: true, sortValue: (e) => e.createdAt, render: (e) => <span className="tabular">{new Date(e.createdAt).toLocaleDateString('en-GB')}</span> },
    { key: 'status', header: 'Status', render: (e) => <StatusChip kind="evidence" status={e.status} /> },
    { key: 'dup', header: 'Duplicate?', render: (e) => (e.duplicateKind ? <Badge tone="warning">{e.duplicateKind === 'exact' ? 'Same photo' : 'Look-alike'}</Badge> : '—') },
  ];

  return (
    <div>
      <PageHeader title="Evidence review" description="Check each photo, compare possible duplicates, and approve, reject or flag it. Every decision is written to the audit log." />
      <div className={styles.filters}>
        <Select label="Status" value={status} onChange={(e) => set('status', e.target.value)} options={STATUSES} />
        <Select label="Type" value={type} onChange={(e) => set('type', e.target.value)} options={[{ value: 'all', label: 'All types' }, ...TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.title }))]} />
        <Select label="Skill" value={skillId} onChange={(e) => set('skillId', e.target.value)} placeholder="All skills" options={skills.map((s) => ({ value: s.id, label: `${s.name} (${categoryLabel(s.category)})` }))} />
        <Switch label="Possible duplicates only" checked={duplicates} onChange={(on) => set('duplicates', on ? 'true' : '')} />
      </div>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>Try again</Button>}>{error}</Alert>}
      {!data && !error && <div aria-busy="true"><span className="visually-hidden" role="status">Loading…</span><Skeleton variant="block" height={240} /></div>}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{data.total} item{data.total === 1 ? '' : 's'}</p>
          <DataTable
            caption="Proof items"
            columns={columns}
            rows={data.evidence}
            rowKey={(e) => e._id}
            onRowClick={(e) => setSelected(e._id)}
            rowLabel={(e) => `Review proof from ${e.worker?.name ?? 'worker'} for ${e.skillName}`}
            empty={<EmptyState icon={Inbox} headingLevel={2} title="Nothing to review" description="No proof items match these filters." />}
          />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {selected && <ReviewDrawer key={selected} id={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </div>
  );
}

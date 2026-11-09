import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Inbox, Search } from 'lucide-react';
import API from '../../api';
import {
  Alert, Badge, Button, ConfirmDialog, DataTable, Drawer, EmptyState, PageHeader, Pagination, RadioCardGroup, Select, Skeleton, StatusChip, TextArea, TextField, useToast,
} from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiMessage } from '../../utils/apiErrors';
import { useApiQuery } from '../../hooks/useApiQuery';
import styles from './Admin.module.css';

const STATUSES = ['Pending', 'Unverified', 'Verified', 'Rejected', 'All'];
const PAGE_SIZE = 25;

// Decision panel for one worker: CNIC reveal through a ConfirmDialog (audited), and a decision
// that always needs a note (M1-9).
function DecisionDrawer({ worker, onClose, onDecided }) {
  const toast = useToast();
  const { categoryLabel } = useTaxonomy();
  const [status, setStatus] = useState(worker?.cnicOnFile ? 'Verified' : 'Rejected');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [cnic, setCnic] = useState('');

  const reveal = async () => {
    setRevealing(true);
    try {
      const { data } = await API.get(`/admin/workers/${worker._id}/cnic`);
      setCnic(data.cnic);
    } catch (err) {
      setError(apiMessage(err, 'Could not show the CNIC.'));
    } finally {
      setRevealing(false);
      setConfirmReveal(false);
    }
  };

  const decide = async () => {
    setError('');
    if (note.trim().length < 5) {
      setNoteError('Write a note of at least 5 characters: how did you check the CNIC?');
      return;
    }
    setNoteError('');
    setSaving(true);
    try {
      await API.patch(`/admin/workers/${worker._id}/identity`, { status, note: note.trim() });
      toast.show({ title: `Identity marked ${status}`, message: 'The decision was written to the audit log.' });
      onDecided();
    } catch (err) {
      setError(apiMessage(err, 'Could not save the decision.'));
      setSaving(false);
    }
  };

  return (
    <>
      <Drawer
        open={Boolean(worker)}
        onClose={onClose}
        title={worker ? `${worker.user?.name ?? 'Worker'} · ${worker.workerIdCode}` : ''}
        description="Check the original CNIC card in person or on a video call, then record your decision."
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={decide} loading={saving}>Save decision</Button>
          </>
        }
      >
        {worker && (
          <>
            {error && <Alert tone="danger">{error}</Alert>}
            <dl className={styles.details}>
              <div><dt>Current status</dt><dd><StatusChip kind="identity" status={worker.verificationStatus} /></dd></div>
              <div><dt>Phone</dt><dd className="tabular">{worker.user?.phone}</dd></div>
              <div><dt>Email</dt><dd>{worker.user?.email}</dd></div>
              <div><dt>Trade</dt><dd>{worker.occupation || '—'} · {categoryLabel(worker.category) || '—'}</dd></div>
              <div><dt>City</dt><dd>{worker.city || '—'}</dd></div>
              <div>
                <dt>CNIC</dt>
                <dd>
                  {!worker.cnicOnFile ? (
                    'Not saved by the worker'
                  ) : cnic ? (
                    <span className="tabular">{cnic}</span>
                  ) : (
                    <span className={styles.cnicRow}>
                      <span className="tabular" aria-label="CNIC hidden">•••••-•••••••-•</span>
                      <Button size="sm" variant="secondary" icon={Eye} onClick={() => setConfirmReveal(true)}>Reveal</Button>
                    </span>
                  )}
                </dd>
              </div>
              {worker.identityNote && <div><dt>Last note</dt><dd>{worker.identityNote}</dd></div>}
            </dl>
            <RadioCardGroup
              legend="Decision"
              name="identity-decision"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'Verified', title: 'Verified', description: worker.cnicOnFile ? 'The CNIC matches the person.' : 'Not possible: no CNIC saved.', disabled: !worker.cnicOnFile },
                { value: 'Rejected', title: 'Rejected', description: 'The CNIC could not be confirmed. The worker sees your note.' },
              ]}
            />
            <TextArea
              label="Note"
              required
              maxLength={500}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              error={noteError}
              hint="Required. Say how you checked, e.g. Original CNIC seen on a video call."
            />
          </>
        )}
      </Drawer>
      <ConfirmDialog
        open={confirmReveal}
        title="Show the full CNIC?"
        message="This will be recorded in the audit log."
        confirmLabel="Show CNIC"
        loading={revealing}
        onConfirm={reveal}
        onCancel={() => setConfirmReveal(false)}
      />
    </>
  );
}

export default function AdminIdentity() {
  const { categoryLabel } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : 'Pending';
  const [q, setQ] = useState(params.get('q') ?? '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const query = { status, page: String(page), limit: String(PAGE_SIZE) };
  if (params.get('q')) query.q = params.get('q');
  const { data, error, reload } = useApiQuery('/admin/workers', query);

  const columns = [
    { key: 'name', header: 'Worker', sortable: true, sortValue: (w) => w.user?.name ?? '', render: (w) => w.user?.name ?? '—' },
    { key: 'id', header: 'Worker ID', render: (w) => <span className="tabular">{w.workerIdCode}</span> },
    { key: 'trade', header: 'Trade', sortable: true, sortValue: (w) => w.occupation, render: (w) => (w.occupation ? `${w.occupation} · ${categoryLabel(w.category)}` : '—') },
    { key: 'city', header: 'City', sortable: true, sortValue: (w) => w.city, render: (w) => w.city || '—' },
    { key: 'cnic', header: 'CNIC', render: (w) => (w.cnicOnFile ? <Badge tone="primary">On file</Badge> : <Badge>Not saved</Badge>) },
    { key: 'status', header: 'Identity', render: (w) => <StatusChip kind="identity" status={w.verificationStatus} /> },
    { key: 'updated', header: 'Updated', sortable: true, sortValue: (w) => w.updatedAt, render: (w) => <span className="tabular">{new Date(w.updatedAt).toLocaleDateString('en-GB')}</span> },
  ];

  return (
    <div>
      <PageHeader title="Identity review" description="Open a worker to see the details, reveal the CNIC if needed, and record a decision with a note." />
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
        <Select label="Status" value={status} onChange={(e) => { setPage(1); const next = new URLSearchParams(params); next.set('status', e.target.value); setParams(next); }} options={STATUSES.map((s) => ({ value: s, label: s }))} />
        <TextField label="Search name, ID or trade" maxLength={50} value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" icon={Search}>Search</Button>
      </form>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>Try again</Button>}>{error}</Alert>}
      {!data && !error && <div aria-busy="true"><span className="visually-hidden" role="status">Loading…</span><Skeleton variant="block" height={240} /></div>}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{data.total} worker{data.total === 1 ? '' : 's'}</p>
          <DataTable
            caption="Workers for identity review"
            columns={columns}
            rows={data.workers}
            rowKey={(w) => w._id}
            onRowClick={setSelected}
            rowLabel={(w) => `Review ${w.user?.name ?? 'worker'}`}
            empty={<EmptyState icon={Inbox} headingLevel={2} title="Nothing here" description="No workers with this status." />}
          />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {selected && (
        <DecisionDrawer
          key={selected._id}
          worker={selected}
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

// Admin: the dispute queue (Module 4, the small dispute step), oldest first. The decision drawer shows
// what the opener wrote, the timeline, the decision cards that fit this kind of dispute and a REQUIRED
// note (saved reasons can be inserted). Every decision is audited, tells both people and rebuilds the
// worker's reputation (server side). J / K move to the next or previous dispute.
import { useMemo, useState } from 'react';
import { Gavel } from 'lucide-react';
import API from '../../api';
import { Alert, Button, DataTable, EmptyState, PageHeader, RadioCardGroup, Skeleton, TextArea, useToast } from '../../components/ui';
import BookingStatusChip from '../../features/booking/BookingStatusChip';
import TemplatePicker from '../../features/admin/TemplatePicker';
import WaitingBadge from '../../features/admin/WaitingBadge';
import ShortcutsHelp, { ShortcutsButton } from '../../features/admin/ShortcutsHelp';
import { useReviewShortcuts } from '../../features/admin/useReviewShortcuts';
import { BookingDrawer } from './AdminBookings';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiError } from '../../utils/apiErrors';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

function DecisionForm({ booking: b, onDone }) {
  const { t, te } = useT();
  const toast = useToast();
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!b.dispute || b.dispute.status !== 'open') return <Alert tone="info">{t('adminm4.disputes.alreadyDecided')}</Alert>;
  const send = async () => {
    if (!decision) return setError({ key: 'adminm4.disputes.chooseDecision' });
    if (note.trim().length < 5) return setError({ key: 'adminm4.disputes.needNote' });
    setBusy(true);
    setError(null);
    try {
      await API.patch(`/admin/bookings/${b._id}/dispute`, { decision, note: note.trim() });
      toast.show({ title: t('adminm4.disputes.saved'), message: t(`booking.dispute.decision.${decision}`) });
      onDone();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
    return null;
  };
  return (
    <section aria-labelledby="decide-title">
      <h3 id="decide-title" className={styles.sectionTitle}><Gavel size={18} aria-hidden="true" /> {t('adminm4.disputes.decide')}</h3>
      <RadioCardGroup legend={t('adminm4.disputes.decision')} name="decision" value={decision} onChange={setDecision}
        options={(b.allowedDecisions ?? []).map((d) => ({ value: d, title: t(`booking.dispute.decision.${d}`), description: t(`adminm4.disputes.effect.${d}`) }))} />
      <TemplatePicker kind="dispute_decision" onPick={(text) => setNote(text)} />
      <TextArea label={t('adminm4.disputes.note')} hint={t('adminm4.disputes.noteHint')} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} required urdu />
      {error && <Alert tone="danger">{te(error)}</Alert>}
      <div className={styles.actions}><Button loading={busy} onClick={send}>{t('adminm4.disputes.save')}</Button></div>
    </section>
  );
}

export default function AdminDisputes() {
  const { t, te } = useT();
  useDocumentTitle(t('adminm4.disputes.title'));
  const { skillName } = useTaxonomy();
  const [status, setStatus] = useState('open');
  const [selected, setSelected] = useState(null);
  const [help, setHelp] = useState(false);
  const { data, error, reload } = useApiQuery('/admin/disputes', { status });
  const list = useMemo(() => data?.disputes ?? [], [data]);
  const shortcuts = useMemo(() => ({
    next: () => { const i = list.findIndex((d) => d._id === selected); if (list[i + 1]) setSelected(list[i + 1]._id); },
    previous: () => { const i = list.findIndex((d) => d._id === selected); if (i > 0) setSelected(list[i - 1]._id); },
    help: () => setHelp(true),
  }), [list, selected]);
  useReviewShortcuts(shortcuts, Boolean(selected) && !help);
  const columns = [
    { key: 'code', header: t('booking.card.code'), render: (b) => <span className="tabular" dir="ltr">{b.code}</span>, sub: (b) => skillName({ skillId: b.skillId, name: b.skillName }) },
    { key: 'type', header: t('adminm4.disputes.type'), render: (b) => t(`booking.dispute.type.${b.dispute.type}`), sub: (b) => t('adminm4.disputes.openedBy', { who: t(`booking.who.${b.dispute.openedBy}`) }) },
    { key: 'people', header: t('adminm4.disputes.people'), render: (b) => b.worker?.name, sub: (b) => <span dir="auto">{b.customer?.name}</span> },
    { key: 'status', header: t('adminm4.bookings.state'), render: (b) => <BookingStatusChip booking={b} /> },
    { key: 'waiting', header: t('adminx.waiting.column'), sortable: true, sortValue: (b) => b.dispute.openedAt, render: (b) => (b.dispute.status === 'open' ? <WaitingBadge since={b.dispute.openedAt} /> : t(`booking.dispute.decision.${b.dispute.decision}`)) },
  ];
  return (
    <div>
      <PageHeader title={t('adminm4.disputes.title')} description={t('adminm4.disputes.lead')} actions={<ShortcutsButton onClick={() => setHelp(true)} />} />
      <div className={styles.filters}>
        <RadioCardGroup legend={t('adminm4.disputes.show')} name="dispute-status" value={status} onChange={setStatus} columns={2}
          options={['open', 'decided', 'all'].map((s) => ({ value: s, title: t(`adminm4.disputes.filter.${s}`) }))} />
      </div>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={200} />}
      {data && (
        <DataTable caption={t('adminm4.disputes.title')} columns={columns} rows={list} rowKey={(b) => b._id} onRowClick={(b) => setSelected(b._id)} rowLabel={(b) => t('adminm4.bookings.open', { code: b.code })}
          empty={<EmptyState art="all-done" headingLevel={2} title={t('adminm4.disputes.empty')} description={t('adminm4.disputes.emptyText')} />} />
      )}
      {selected && (
        <BookingDrawer key={selected} id={selected} onClose={() => setSelected(null)}>
          {(b) => <DecisionForm booking={b} onDone={() => { reload(); setSelected(null); }} />}
        </BookingDrawer>
      )}
      <ShortcutsHelp open={help} onClose={() => setHelp(false)} available={['next', 'previous', 'help']} />
    </div>
  );
}

// Admin: the price guide (Module 5, §4.5) — the FALLBACK price information, used only when the platform has no
// range of its own. Every entry needs a written source; the page says "Type only numbers you can show a source
// for. Never guess." Create, edit (new numbers need their source again), archive; the change history comes from
// the audit log. Production starts empty: no code or script creates entries there.
import { useState } from 'react';
import { Archive, History, PencilLine, Plus, Save } from 'lucide-react';
import API from '../../api';
import { Alert, Badge, Button, ConfirmDialog, DataTable, Dialog, EmptyState, MaskedField, PageHeader, Select, Skeleton, TextArea, useToast } from '../../components/ui';
import { formatRupees } from '../../utils/masks';
import { amountOf } from '../../features/wage/wageLogic';
import { regionName, rupees } from '../../features/wage/wageText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import styles from './Admin.module.css';
import wageStyles from '../../features/wage/Wage.module.css';

const UNITS = ['job', 'day', 'hour'];
const REGIONS = ['PK', 'ICT', 'PB', 'SD', 'KP', 'BA', 'GB', 'AJK'];

function GuideDialog({ entry, onClose, onSaved }) {
  const { t, te, lang } = useT();
  const { categories, skills, categoryLabel } = useTaxonomy();
  const names = useApiQuery('/meta/wage-references').data?.regions;
  const editing = Boolean(entry);
  const [form, setForm] = useState({
    category: entry?.category ?? '', skillId: entry?.skillId ?? '', unit: entry?.unit ?? 'job', region: entry?.region ?? 'PK',
    low: entry ? formatRupees(String(entry.low)) : '', high: entry ? formatRupees(String(entry.high)) : '', sourceNote: entry?.sourceNote ?? '', note: entry?.note ?? '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value, ...(k === 'category' ? { skillId: '' } : {}) }));
  const regionLabel = (code) => (code === 'PK' ? t('wage.admin.guide.allPakistan') : regionName(names?.find((r) => r.region === code)?.names, lang) || code);
  const save = async () => {
    const found = {};
    if (!editing && !form.category) found.category = 'wage.admin.guide.needCategory';
    if (!amountOf(form.low)) found.low = 'wage.pay.needAmount';
    if (!amountOf(form.high)) found.high = 'wage.pay.needAmount';
    if (form.sourceNote.trim().length < 10) found.sourceNote = 'errors.SOURCE_NOTE_REQUIRED';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError(null);
    const numbers = { low: amountOf(form.low), high: amountOf(form.high), sourceNote: form.sourceNote.trim(), ...(form.note.trim() ? { note: form.note.trim() } : {}) };
    try {
      const { data } = editing
        ? await API.patch(`/admin/price-guides/${entry._id}`, numbers)
        : await API.post('/admin/price-guides', { category: form.category, unit: form.unit, region: form.region, ...(form.skillId ? { skillId: form.skillId } : {}), ...numbers });
      onSaved(data.guide);
    } catch (err) {
      setErrors(apiFieldErrors(err));
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} title={t(editing ? 'wage.admin.guide.editTitle' : 'wage.admin.guide.newTitle')} footer={<><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button icon={Save} loading={busy} onClick={save}>{t('wage.admin.guide.save')}</Button></>}>
      <div className={wageStyles.dialogBody} data-testid="guide-form">
        <Alert tone="warning" title={t('wage.admin.guide.warningTitle')}>{t('wage.admin.guide.warning')}</Alert>
        {!editing && (
          <>
            <Select label={t('wage.admin.guide.category')} value={form.category} onChange={set('category')} error={errors.category} options={[{ value: '', label: t('wage.admin.guide.chooseCategory') }, ...categories.map((c) => ({ value: c.id, label: c.label }))]} />
            <Select label={t('wage.admin.guide.skill')} value={form.skillId} onChange={set('skillId')} error={errors.skillId} options={[{ value: '', label: t('wage.admin.guide.wholeCategory') }, ...skills.filter((s) => s.category === form.category).map((s) => ({ value: s.id, label: s.name }))]} />
            <Select label={t('wage.admin.guide.unit')} value={form.unit} onChange={set('unit')} options={UNITS.map((u) => ({ value: u, label: t(`wage.unit.${u}`) }))} />
            <Select label={t('wage.admin.guide.region')} value={form.region} onChange={set('region')} error={errors.region} options={REGIONS.map((r) => ({ value: r, label: regionLabel(r) }))} />
          </>
        )}
        {editing && <p className={styles.method}>{[entry.skillId ? skills.find((s) => s.id === entry.skillId)?.name ?? entry.skillId : t('wage.admin.guide.wholeCategory'), categoryLabel(entry.category), t(`wage.unit.${entry.unit}`), regionLabel(entry.region)].join(' · ')}</p>}
        <MaskedField mask="rupees" prefix="Rs" max={5000000} label={t('wage.admin.guide.low')} inputMode="numeric" value={form.low} onChange={set('low')} error={errors.low} />
        <MaskedField mask="rupees" prefix="Rs" max={5000000} label={t('wage.admin.guide.high')} inputMode="numeric" value={form.high} onChange={set('high')} error={errors.high} />
        <TextArea label={t('wage.admin.guide.source')} hint={t('wage.admin.guide.sourceHint')} maxLength={300} rows={2} value={form.sourceNote} onChange={set('sourceNote')} error={errors.sourceNote} required />
        <TextArea label={t('wage.admin.guide.note')} hint={t('wage.admin.guide.noteHint')} maxLength={200} rows={2} value={form.note} onChange={set('note')} error={errors.note} />
        {error && <Alert tone="danger">{te(error)}</Alert>}
      </div>
    </Dialog>
  );
}

export default function AdminPriceGuide() {
  const { t, te, lang, formatNumber, formatDate } = useT();
  const toast = useToast();
  useDocumentTitle(t('wage.admin.guide.title'));
  const { categoryLabel, skillName } = useTaxonomy();
  const names = useApiQuery('/meta/wage-references').data?.regions;
  const [status, setStatus] = useState('active');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(null); // 'new' | entry
  const [archiving, setArchiving] = useState(null);
  const [historyOf, setHistoryOf] = useState(null);
  const [busy, setBusy] = useState(false);
  const { categories } = useTaxonomy();
  const { data, error, reload } = useApiQuery('/admin/price-guides', { status, ...(category ? { category } : {}) });
  const money = (n) => rupees(t, formatNumber, n);
  const regionLabel = (code) => (code === 'PK' ? t('wage.admin.guide.allPakistan') : regionName(names?.find((r) => r.region === code)?.names, lang) || code);
  const archive = async () => {
    setBusy(true);
    try {
      await API.patch(`/admin/price-guides/${archiving._id}`, { status: 'archived' });
      toast.show({ tone: 'success', title: t('wage.admin.guide.archived') });
      setArchiving(null);
      reload();
    } catch (err) {
      toast.show({ tone: 'danger', title: te(apiError(err)) });
    } finally {
      setBusy(false);
    }
  };
  const columns = [
    { key: 'work', header: t('wage.admin.guide.work'), render: (g) => (g.skillId ? skillName({ skillId: g.skillId }) : t('wage.admin.guide.wholeCategory')), sub: (g) => categoryLabel(g.category) },
    { key: 'unit', header: t('wage.admin.guide.unit'), render: (g) => t(`wage.unit.${g.unit}`), sub: (g) => regionLabel(g.region) },
    { key: 'range', header: t('wage.admin.guide.range'), render: (g) => <span className="tabular">{money(g.low)} – {money(g.high)}</span> },
    { key: 'source', header: t('wage.admin.guide.source'), render: (g) => <span className={styles.wrapAnywhere} dir="auto">{g.sourceNote}</span>, sub: (g) => (g.synthetic ? t('wage.admin.guide.synthetic') : null) },
    { key: 'status', header: t('wage.admin.guide.status'), render: (g) => <Badge tone={g.status === 'active' ? 'success' : 'neutral'}>{t(`wage.admin.guide.statuses.${g.status}`)}</Badge>, sub: (g) => formatDate(g.updatedAt) },
    {
      key: 'actions', header: t('wage.admin.guide.actions'), render: (g) => (
        <span className={styles.statusRow}>
          {g.status === 'active' && <Button size="sm" variant="secondary" icon={PencilLine} onClick={() => setOpen(g)}>{t('wage.admin.guide.edit')}</Button>}
          {g.status === 'active' && <Button size="sm" variant="ghost" icon={Archive} onClick={() => setArchiving(g)}>{t('wage.admin.guide.archive')}</Button>}
          <Button size="sm" variant="ghost" icon={History} onClick={() => setHistoryOf(g)}>{t('wage.admin.guide.history')}</Button>
        </span>
      ),
    },
  ];
  const history = historyOf ? data?.history?.[historyOf._id] ?? [] : [];
  return (
    <div>
      <PageHeader title={t('wage.admin.guide.title')} description={t('wage.admin.guide.lead')} actions={<Button icon={Plus} onClick={() => setOpen('new')}>{t('wage.admin.guide.new')}</Button>} />
      <Alert tone="warning" title={t('wage.admin.guide.warningTitle')}>{t('wage.admin.guide.warning')}</Alert>
      <div className={styles.filters}>
        <Select label={t('wage.admin.guide.status')} value={status} onChange={(e) => setStatus(e.target.value)} options={['active', 'archived', 'all'].map((s) => ({ value: s, label: t(`wage.admin.guide.statuses.${s}`) }))} />
        <Select label={t('wage.admin.guide.category')} value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: '', label: t('wage.admin.guide.allCategories') }, ...categories.map((c) => ({ value: c.id, label: c.label }))]} />
      </div>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={200} />}
      {data && (
        <DataTable caption={t('wage.admin.guide.title')} columns={columns} rows={data.guides} rowKey={(g) => g._id}
          empty={<EmptyState art="all-done" headingLevel={2} title={t('wage.admin.guide.empty')} description={t('wage.admin.guide.emptyText')} />} />
      )}
      <p className={styles.method}>{t('wage.admin.guide.usedWhen')}</p>
      {open && <GuideDialog entry={open === 'new' ? null : open} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); toast.show({ tone: 'success', title: t('wage.admin.guide.saved') }); reload(); }} />}
      <ConfirmDialog open={Boolean(archiving)} tone="danger" title={t('wage.admin.guide.archiveTitle')} message={t('wage.admin.guide.archiveText')} confirmLabel={t('wage.admin.guide.archive')} loading={busy} onCancel={() => setArchiving(null)} onConfirm={archive} />
      <Dialog open={Boolean(historyOf)} onClose={() => setHistoryOf(null)} title={t('wage.admin.guide.historyTitle')}>
        {history.length === 0 ? <p>{t('wage.admin.guide.noHistory')}</p> : (
          <ol className={wageStyles.historyList} data-testid="guide-history">
            {history.map((h) => (
              <li key={`${h.action}-${h.at}`}>
                <strong>{t(`wage.admin.guide.events.${h.action.split('.')[1]}`)}</strong> · {formatDate(h.at, { dateStyle: 'medium', timeStyle: 'short' })} · {h.by}
                {h.before && h.after && (h.before.low !== h.after.low || h.before.high !== h.after.high) && <> · <span className="tabular">{money(h.before.low)}–{money(h.before.high)} → {money(h.after.low)}–{money(h.after.high)}</span></>}
                {!h.before && h.after && <> · <span className="tabular">{money(h.after.low)}–{money(h.after.high)}</span></>}
              </li>
            ))}
          </ol>
        )}
      </Dialog>
    </div>
  );
}

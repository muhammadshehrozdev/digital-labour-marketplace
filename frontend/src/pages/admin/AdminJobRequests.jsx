// Admin: Job requests (Module 6, Batch 8B, Part C). READ-ONLY, three tabs:
//   - the list (GET /api/admin/job-requests): state, trade and code search; the customer's name, the requests sent and
//     the method; NO budget in the list. A row opens the drawer (GET /api/admin/job-requests/:id): everything,
//     including the budget, the analysis (suggested vs chosen) and the bookings; the customer's name only.
//   - "How suggestions were used" (GET /api/admin/job-requests/stats?days=): kept / changed / not suggested per detail,
//     by method and by input mode, with the fixed note that this is use, not correctness (D-088).
//   - "Try the analyzer" (POST /api/job-requests/analyze): the suggestion and the words that led to it, as
//     `npm run jobs:try` prints it. Nothing is saved.
import { useState } from 'react';
import { BarChart3, ListChecks, ScanText, Search } from 'lucide-react';
import API from '../../api';
import { Alert, Badge, Button, DataTable, Drawer, EmptyState, PageHeader, Pagination, Select, Skeleton, Tabs, TextArea, TextField } from '../../components/ui';
import { BarList, SegmentBar } from '../../components/charts';
import BookingStatusChip from '../../features/booking/BookingStatusChip';
import { dayWords } from '../../features/booking/bookingText';
import JobStateChip from '../../features/jobs/JobStateChip';
import JobSummary from '../../features/jobs/JobSummary';
import UnderstoodTable from '../../features/jobs/UnderstoodTable';
import { JOB_STATES, tryRows } from '../../features/jobs/jobText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import styles from './Admin.module.css';
import jobStyles from '../../features/jobs/Jobs.module.css';

const PAGE_SIZE = 20;
const STATES = ['all', 'active', ...JOB_STATES];
const DAYS = [7, 30, 90];
const STAT_FIELDS = ['category', 'skills', 'taskType', 'city', 'preferredDate', 'timeSlot', 'urgent', 'budget'];

function JobDrawer({ id, onClose }) {
  const { t, te, formatDate } = useT();
  const { categoryLabel } = useTaxonomy();
  const { data, error, loading } = useApiQuery(`/admin/job-requests/${id}`);
  const job = data?.job;
  return (
    <Drawer open onClose={onClose} title={job ? `${job.code} · ${categoryLabel(job.category)}` : t('jobs.admin.title')} description={job ? t('jobs.admin.detail.customer', { name: job.customer?.name ?? '' }) : undefined}>
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {loading && <Skeleton variant="block" height={240} />}
      {job && (
        <div className={jobStyles.summary} data-testid="admin-job-drawer">
          <div className={styles.statusRow}>
            <JobStateChip state={job.state} />
            {job.synthetic && <Badge tone="neutral">{t('jobs.admin.detail.synthetic')}</Badge>}
          </div>
          <JobSummary job={job} showBudget showDescription listen={false} testId="admin-job-summary" />
          <h3 className={styles.sectionTitle}>{t('jobs.admin.detail.analysis')}</h3>
          {job.analysis ? <UnderstoodTable job={job} /> : <p className={styles.method}>{t('jobs.understood.none')}</p>}
          <h3 className={styles.sectionTitle}>{t('jobs.admin.detail.bookings')}</h3>
          {(job.bookings ?? []).length === 0 ? <p className={styles.method}>{t('jobs.admin.detail.noBookings')}</p> : (
            <ul className={jobStyles.bookings}>
              {job.bookings.map((b) => (
                <li key={b._id} className={jobStyles.booking}>
                  <span dir="ltr" className="tabular">{b.code}</span>
                  <span dir="auto">{t('jobs.detail.workerLine', { name: b.worker?.name ?? '', code: b.worker?.workerIdCode ?? '' })}</span>
                  <BookingStatusChip booking={b} />
                  <span>{dayWords(t, formatDate, b.preferredDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Drawer>
  );
}

function JobList() {
  const { t, te, formatDate, formatNumber } = useT();
  const { categories, categoryLabel } = useTaxonomy();
  const [state, setState] = useState('all');
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const query = { page: String(page), limit: String(PAGE_SIZE) };
  if (state !== 'all') query.state = state;
  if (category !== 'all') query.category = category;
  if (search) query.q = search;
  const { data, error, reload } = useApiQuery('/admin/job-requests', query);
  const columns = [
    { key: 'code', header: t('jobs.admin.columns.code'), render: (j) => <span className="tabular" dir="ltr">{j.code}</span>, sub: (j) => categoryLabel(j.category) },
    { key: 'customer', header: t('jobs.admin.columns.customer'), render: (j) => <span dir="auto">{j.customer?.name}</span>, sub: (j) => <span dir="auto">{j.city}</span> },
    { key: 'state', header: t('jobs.admin.columns.state'), render: (j) => <JobStateChip state={j.state} /> },
    { key: 'bookings', header: t('jobs.admin.columns.bookings'), render: (j) => formatNumber(j.bookingsCount ?? 0) },
    { key: 'method', header: t('jobs.admin.columns.method'), render: (j) => (j.analysisMethod ? t(`jobs.method.${j.analysisMethod}`) : '—'), sub: (j) => t(`jobs.admin.inputMode.${j.inputMode}`) },
    { key: 'created', header: t('jobs.admin.columns.created'), sortable: true, sortValue: (j) => j.createdAt, render: (j) => <span className="tabular">{formatDate(j.createdAt)}</span> },
  ];
  return (
    <>
      <form className={styles.filters} role="search" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(q.trim()); }}>
        <Select label={t('jobs.admin.columns.state')} value={state} onChange={(e) => { setPage(1); setState(e.target.value); }} options={STATES.map((s) => ({ value: s, label: s === 'all' ? t('jobs.admin.all') : t(`jobs.tabs.${s}`) }))} />
        <Select label={t('jobs.summary.trade')} value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }} options={[{ value: 'all', label: t('jobs.admin.allTrades') }, ...categories.map((c) => ({ value: c.id, label: c.label }))]} />
        <TextField label={t('jobs.admin.search')} maxLength={20} value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" variant="secondary" icon={Search}>{t('jobs.admin.find')}</Button>
      </form>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={240} />}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{t('jobs.admin.count', { count: data.total })}</p>
          <DataTable caption={t('jobs.admin.title')} columns={columns} rows={data.jobs} rowKey={(j) => j._id} onRowClick={(j) => setSelected(j._id)} rowLabel={(j) => t('jobs.admin.open', { code: j.code })}
            empty={<EmptyState art="all-done" headingLevel={2} title={t('jobs.admin.empty')} description={t('jobs.admin.emptyText')} />} />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {selected && <JobDrawer id={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function JobStats() {
  const { t, te, formatNumber } = useT();
  const [days, setDays] = useState(30);
  const { data, error } = useApiQuery('/admin/job-requests/stats', { days: String(days) });
  const segments = (f) => [
    { id: 'kept', label: t('jobs.admin.stats.kept'), value: f.kept },
    { id: 'changed', label: t('jobs.admin.stats.changed'), value: f.changed },
    { id: 'notSuggested', label: t('jobs.admin.stats.notSuggested'), value: f.notSuggested },
  ];
  return (
    <div className={jobStyles.summary} data-testid="job-stats">
      <div className={styles.filters}>
        <Select label={t('jobs.admin.stats.days')} value={String(days)} onChange={(e) => setDays(Number(e.target.value))} options={DAYS.map((d) => ({ value: String(d), label: t('jobs.admin.stats.lastDays', { days: d }) }))} />
      </div>
      <Alert tone="info" title={t('jobs.admin.stats.noteTitle')}>{t('jobs.admin.stats.note')}</Alert>
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={240} />}
      {data && data.jobs === 0 && <EmptyState art="all-done" headingLevel={2} title={t('jobs.admin.stats.empty')} description={t('jobs.admin.stats.emptyText')} />}
      {data && data.jobs > 0 && (
        <>
          <p className={styles.count} aria-live="polite">{t('jobs.admin.stats.jobs', { count: data.jobs, days: data.days })}</p>
          <div className={jobStyles.tableWrap}>
            <table className={jobStyles.table} data-testid="stats-table">
              <caption className="visually-hidden">{t('jobs.admin.tabs.stats')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('jobs.understood.field')}</th>
                  <th scope="col">{t('jobs.admin.stats.kept')}</th>
                  <th scope="col">{t('jobs.admin.stats.changed')}</th>
                  <th scope="col">{t('jobs.admin.stats.notSuggested')}</th>
                  <th scope="col">{t('jobs.admin.stats.split')}</th>
                </tr>
              </thead>
              <tbody>
                {STAT_FIELDS.map((f) => {
                  const row = data.fields[f];
                  return (
                    <tr key={f} data-field={f}>
                      <th scope="row">{t(`jobs.understood.fields.${f}`)}</th>
                      <td className="tabular">{formatNumber(row.kept)}</td>
                      <td className="tabular">{formatNumber(row.changed)}</td>
                      <td className="tabular">{formatNumber(row.notSuggested)}</td>
                      <td><SegmentBar label={t(`jobs.understood.fields.${f}`)} segments={segments(row)} formatNumber={formatNumber} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={styles.method}>{t('jobs.admin.stats.skills', { added: formatNumber(data.fields.skills.added), removed: formatNumber(data.fields.skills.removed) })}</p>
          <div className={styles.filters}>
            <BarList title={t('jobs.admin.stats.byMethod')} rows={Object.entries(data.byMethod).map(([m, n]) => ({ id: m, label: t(`jobs.method.${m}`) === `jobs.method.${m}` ? m : t(`jobs.method.${m}`), value: n }))} formatNumber={formatNumber} emptyText="—" />
            <BarList title={t('jobs.admin.stats.byInputMode')} rows={Object.entries(data.byInputMode).map(([m, n]) => ({ id: m, label: t(`jobs.admin.inputMode.${m}`), value: n }))} formatNumber={formatNumber} emptyText="—" />
          </div>
        </>
      )}
    </div>
  );
}

function TryAnalyzer() {
  const { t } = useT();
  const { categoryLabel, skillName } = useTaxonomy();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data } = await API.post('/job-requests/analyze', { text });
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(apiFieldErrors(err).text ?? apiError(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className={jobStyles.summary} onSubmit={run} noValidate data-testid="try-analyzer">
      <p className={styles.method}>{t('jobs.admin.try.lead')}</p>
      <TextArea label={t('jobs.admin.try.label')} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} error={error} urdu />
      <div className={jobStyles.actions}><Button type="submit" icon={ScanText} loading={busy} disabled={!text.trim()}>{t('jobs.admin.try.run')}</Button></div>
      {result && (
        <>
          <p className={styles.method}>{t('jobs.admin.try.method', { method: result.methodName, analyzer: result.versions.analyzer, phrases: result.versions.phrases })}</p>
          <div className={jobStyles.tableWrap}>
            <table className={jobStyles.table} data-testid="try-table">
              <thead><tr><th scope="col">{t('jobs.understood.field')}</th><th scope="col">{t('jobs.admin.try.suggestion')}</th><th scope="col">{t('jobs.admin.try.words')}</th></tr></thead>
              <tbody>
                {tryRows(t, result, { categoryLabel, skillName }).map(([field, value, words]) => (
                  <tr key={field} data-field={field}><th scope="row">{t(`jobs.admin.try.rows.${field}`)}</th><td dir="auto">{value}</td><td dir="auto">{words}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={jobStyles.notice}>{t('jobs.admin.try.nothingSaved')}</p>
        </>
      )}
    </form>
  );
}

export default function AdminJobRequests() {
  const { t } = useT();
  useDocumentTitle(t('jobs.admin.title'));
  const [tab, setTab] = useState('list');
  return (
    <div>
      <PageHeader title={t('jobs.admin.title')} description={t('jobs.admin.lead')} />
      <Tabs
        label={t('jobs.admin.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'list', label: t('jobs.admin.tabs.list'), icon: ListChecks, content: <JobList /> },
          { id: 'stats', label: t('jobs.admin.tabs.stats'), icon: BarChart3, content: <JobStats /> },
          { id: 'try', label: t('jobs.admin.tabs.try'), icon: ScanText, content: <TryAnalyzer /> },
        ]}
      />
    </div>
  );
}

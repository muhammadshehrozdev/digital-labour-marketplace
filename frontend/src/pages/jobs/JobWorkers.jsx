// /job-requests/:id/workers — "Workers for this job" (Module 6, Batch 8B): a FILTER, not a ranking (D-084). The
// server lists listed, not-suspended workers who offer a skill of the job's trade in the job's city, in the order the
// customer chooses (the directory's sorts), with the reasons each one is listed. Public fields only (WorkerCard): never
// a phone, WhatsApp, email, address or CNIC. "Send this job" opens the request page in job mode.
import { useSearchParams, useParams } from 'react-router-dom';
import { ArrowDownUp, ArrowLeft, BadgeCheck, LayoutGrid, MapPin, Search, Send, Pencil } from 'lucide-react';
import { Alert, Button, EmptyState, PageHeader, Pagination, RadioCardGroup, Select, Skeleton, Switch } from '../../components/ui';
import WorkerCard from '../../features/customer/WorkerCard';
import { AVAILABILITY, AVAILABILITY_ICONS } from '../../features/profile/availability';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/jobs/Jobs.module.css';

// the same sorts and labels as /find (FindWorkers.jsx)
const SORTS = ['updated', 'experience', 'evidence', 'track_record'];
const sortLabel = (s) => (s === 'track_record' ? 'reputation.sortTrack' : `customerx.sort.${s}`);
const PAGE_SIZE = 20;

// done, expired or closed: the server lists nobody (409 JOB_NOT_OPEN); the page says why
function NotOpen({ job }) {
  const { t, te } = useT();
  const state = ['done', 'expired', 'closed'].includes(job.state) ? job.state : 'closed';
  return (
    <EmptyState
      art="all-done"
      headingLevel={2}
      title={te({ code: 'JOB_NOT_OPEN' })}
      description={t(`jobs.workers.notOpen.${state}`)}
      action={<Button to={`/job-requests/${job._id}`} variant="secondary">{t('jobs.workers.back')}</Button>}
    />
  );
}

export default function JobWorkers() {
  const { id } = useParams();
  const { t, te } = useT();
  const { categoryLabel, skillName } = useTaxonomy();
  useDocumentTitle(t('jobs.titles.workers'));
  const [params, setParams] = useSearchParams();
  const jobQuery = useApiQuery(`/job-requests/${encodeURIComponent(id)}`);
  const value = {
    sort: SORTS.includes(params.get('sort')) ? params.get('sort') : 'updated',
    availability: AVAILABILITY.includes(params.get('availability')) ? params.get('availability') : 'All',
    identity: params.get('identity') === 'verified',
    skills: params.get('skills') === 'verified',
    page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
  };
  const set = (changes) => {
    const next = new URLSearchParams(params);
    if (!('page' in changes)) next.delete('page');
    for (const [key, v] of Object.entries(changes)) {
      if (v && v !== 'All' && !(key === 'sort' && v === 'updated') && !(key === 'page' && v === 1)) next.set(key, String(v)); else next.delete(key);
    }
    setParams(next, { replace: true });
  };
  const job = jobQuery.data?.job ?? null;
  const canList = Boolean(job && (job.actions ?? []).includes('find_workers'));
  const query = { sort: value.sort, page: String(value.page), limit: String(PAGE_SIZE) };
  if (value.availability !== 'All') query.availability = value.availability;
  if (value.identity) query.identity = 'verified';
  if (value.skills) query.skills = 'verified';
  const list = useApiQuery(canList ? `/job-requests/${encodeURIComponent(id)}/workers` : null, query, { keepPrevious: true });

  if (jobQuery.loading) return <PageLoading />;
  if (jobQuery.status === 404 || jobQuery.status === 400) {
    return <EmptyState art="not-found" headingLevel={1} title={t('jobs.detail.notFound')} description={t('jobs.detail.notFoundText')} action={<Button to="/job-requests">{t('jobs.detail.back')}</Button>} />;
  }
  if (jobQuery.error) return <Alert tone="danger">{te(jobQuery.error)}</Alert>;
  const notOpen = !canList || list.error?.code === 'JOB_NOT_OPEN';
  const data = list.data;
  const city = data?.filter?.city ?? job.city;

  return (
    <div className={styles.page}>
      <Button to={`/job-requests/${job._id}`} variant="ghost" size="sm" icon={ArrowLeft}>{t('jobs.workers.back')}</Button>
      <PageHeader
        eyebrow={<span dir="ltr" className="tabular">{job.code}</span>}
        title={t('jobs.titles.workers')}
        description={t('jobs.workers.jobLine', { trade: categoryLabel(job.category), city: job.city })}
      />
      {notOpen ? <NotOpen job={job} /> : (
        <>
          <p className={styles.notice} data-testid="not-ranked">{t('jobs.workers.lead')}</p>
          {data?.truncated && <Alert tone="info">{t('jobs.workers.truncated')}</Alert>}
          <div className={styles.workersLayout}>
            <section className={styles.section} aria-labelledby="worker-filters">
              <h2 id="worker-filters" className={styles.sectionTitle}>{t('jobs.workers.filters')}</h2>
              <div className={styles.filters}>
                <Select label={t('customerx.sort.label')} value={value.sort} onChange={(e) => set({ sort: e.target.value })} options={SORTS.map((s) => ({ value: s, label: t(sortLabel(s)) }))} assist="jobs.workersSort" icon={ArrowDownUp} />
                <RadioCardGroup
                  legend={t('find.availability')}
                  name="availability"
                  layout="tiles"
                  value={value.availability}
                  onChange={(availability) => set({ availability })}
                  assist="jobs.workersAvailability"
                  listen="availability"
                  options={[{ value: 'All', title: t('find.any'), icon: LayoutGrid }, ...AVAILABILITY.map((a) => ({ value: a, title: t(`status.availability.${a}`), icon: AVAILABILITY_ICONS[a] }))]}
                />
                <Switch label={t('find.verifiedOnly')} checked={value.identity} onChange={(on) => set({ identity: on ? 'verified' : '' })} />
                <Switch label={t('find.verifiedSkills')} hint={t('find.verifiedSkillsHint')} checked={value.skills} onChange={(on) => set({ skills: on ? 'verified' : '' })} />
              </div>
            </section>
            <section aria-labelledby="worker-results" className={styles.page} style={{ paddingBlockEnd: 0 }}>
              <h2 id="worker-results" className={styles.sectionTitle} aria-live="polite">{data ? t('jobs.workers.found', { count: data.total }) : t('find.searching')}</h2>
              {list.error && !notOpen && <Alert tone="danger">{te(list.error)}</Alert>}
              {!data && !list.error && <Skeleton variant="block" height={232} />}
              {data && data.workers.length === 0 && (
                <EmptyState
                  art="empty-search"
                  headingLevel={3}
                  title={t('jobs.workers.empty', { city })}
                  description={t('jobs.workers.emptyText')}
                  action={(
                    <div className={styles.actions}>
                      <Button to="/find" variant="secondary" icon={Search}>{t('jobs.workers.search')}</Button>
                      {(job.actions ?? []).includes('edit') && <Button to={`/job-requests/${job._id}/edit`} variant="secondary" icon={Pencil}>{t('jobs.workers.editCity')}</Button>}
                    </div>
                  )}
                />
              )}
              {data && data.workers.length > 0 && (
                <ul className={styles.list}>
                  {data.workers.map((w, i) => {
                    const name = w.user?.name ?? t('common.worker');
                    return (
                      <WorkerCard key={w.workerIdCode} worker={w} index={i}>
                        <ul className={styles.reasons} aria-label={t('jobs.workers.reasons', { name })}>
                          {(w.matchedSkills ?? []).length > 0 && <li><BadgeCheck size={16} aria-hidden="true" /> {t('jobs.workers.offers', { skills: w.matchedSkills.map((s) => skillName(s)).join(t('common.listSeparator')) })}</li>}
                          {w.sameCity && <li><MapPin size={16} aria-hidden="true" /> {t('jobs.workers.sameCity', { city })}</li>}
                        </ul>
                        <Button size="sm" icon={Send} to={`/workers/${encodeURIComponent(w.workerIdCode)}/request?job=${encodeURIComponent(job._id)}`}>
                          {t('jobs.workers.send')}<span className="visually-hidden">: {name}</span>
                        </Button>
                      </WorkerCard>
                    );
                  })}
                </ul>
              )}
              {data && <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={(p) => set({ page: p })} label={t('find.resultPages')} />}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

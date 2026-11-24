// /job-requests — "My job requests" (Module 6, Batch 8B): tabs by state with the counts from the server
// (GET /api/job-requests/mine), the job cards, an empty state with "Describe a job", and pages.
import { useCallback, useEffect, useState } from 'react';
import { Archive, CircleCheck, FolderOpen, Handshake, Hourglass, Layers, MessageSquarePlus, TimerOff } from 'lucide-react';
import { Alert, Badge, Button, EmptyState, PageHeader, Pagination, Skeleton, Tabs } from '../../components/ui';
import JobCard from '../../features/jobs/JobCard';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/jobs/Jobs.module.css';

const PAGE_SIZE = 20;
const JOB_TABS = Object.freeze([
  ['active', Layers], ['open', FolderOpen], ['requested', Hourglass], ['accepted', Handshake], ['done', CircleCheck], ['expired', TimerOff], ['closed', Archive],
]);

function JobList({ state, onCounts }) {
  const { t, te } = useT();
  const [page, setPage] = useState(1);
  const { data, error, reload } = useApiQuery('/job-requests/mine', { state, page: String(page), limit: String(PAGE_SIZE) });
  const counts = data?.counts ?? null;
  useEffect(() => {
    if (counts) onCounts(counts);
  }, [counts, onCounts]);
  if (error) return <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>;
  if (!data) return <Skeleton variant="block" height={200} />;
  if (data.jobs.length === 0) {
    return (
      <EmptyState
        art="empty-search"
        headingLevel={2}
        title={t(state === 'active' ? 'jobs.mine.emptyActive' : 'jobs.mine.empty')}
        description={t('jobs.mine.emptyText')}
        action={<Button to="/job-requests/new" icon={MessageSquarePlus}>{t('jobs.nav.describe')}</Button>}
      />
    );
  }
  return (
    <>
      <ul className={styles.list}>{data.jobs.map((job) => <JobCard key={job._id} job={job} />)}</ul>
      <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
    </>
  );
}

export default function MyJobRequests() {
  const { t, formatNumber } = useT();
  useDocumentTitle(t('jobs.titles.mine'));
  const [tab, setTab] = useState('active');
  const [counts, setCounts] = useState(null);
  const remember = useCallback((next) => setCounts((was) => (JSON.stringify(next) === JSON.stringify(was) ? was : next)), []);
  return (
    <div className={styles.page}>
      <PageHeader title={t('jobs.mine.title')} description={t('jobs.mine.lead')} actions={<Button to="/job-requests/new" icon={MessageSquarePlus}>{t('jobs.nav.describe')}</Button>} />
      <Tabs
        label={t('jobs.mine.title')}
        value={tab}
        onChange={setTab}
        tabs={JOB_TABS.map(([id, icon]) => ({
          id,
          icon,
          label: t(`jobs.tabs.${id}`),
          badge: counts ? <Badge tone={id === tab ? 'primary' : 'neutral'}>{formatNumber(counts[id] ?? 0)}</Badge> : null,
          content: <JobList key={id} state={id} onCounts={remember} />,
        }))}
      />
    </div>
  );
}

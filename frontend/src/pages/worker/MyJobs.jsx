// /worker/jobs — accepted jobs with the customer's phone number (from the booking itself, D-002),
// "Work done", Cancel (with a warning when it would count as late) and the no-show answer; then
// the past jobs (Batch 6, section 7).
import { useState } from 'react';
import { BriefcaseBusiness, History } from 'lucide-react';
import { Alert, EmptyState, PageHeader, Skeleton, Tabs } from '../../components/ui';
import BookingCard from '../../features/booking/BookingCard';
import BookingActions from '../../features/booking/BookingActions';
import ContactCard from '../../features/booking/ContactCard';
import { BookingList } from '../customer/MyBookings';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/booking/Booking.module.css';

// One accepted job, loaded in full so its contact card can be shown (only the detail has it).
function ActiveJob({ id, onChanged }) {
  const { t } = useT();
  const { data } = useApiQuery(`/bookings/${id}`);
  if (!data) return <Skeleton variant="block" height={180} />;
  const b = data.booking;
  return (
    <BookingCard booking={b} viewer="worker">
      {b.noShow?.reportedAt && !b.noShow?.workerResponse && <p className={styles.warning} role="note">{t('booking.jobs.noShowAsked')}</p>}
      <ContactCard contact={b.contact} viewer="worker" />
      <BookingActions booking={b} viewer="worker" compact onChanged={onChanged} />
    </BookingCard>
  );
}
function ActiveJobs() {
  const { t, te } = useT();
  const [refresh, setRefresh] = useState(0);
  const { data, error } = useApiQuery('/bookings/mine', { status: 'accepted', limit: '50' }, { refreshKey: refresh });
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  if (!data) return <Skeleton variant="block" height={200} />;
  if (data.bookings.length === 0) return <EmptyState icon={BriefcaseBusiness} headingLevel={2} title={t('booking.jobs.empty')} description={t('booking.jobs.emptyText')} />;
  return <ul className={styles.list}>{data.bookings.map((b) => <ActiveJob key={`${b._id}-${refresh}`} id={b._id} onChanged={() => setRefresh((n) => n + 1)} />)}</ul>;
}

export default function MyJobs() {
  const { t } = useT();
  useDocumentTitle(t('booking.titles.jobs'));
  const [tab, setTab] = useState('active');
  return (
    <div className={styles.page}>
      <PageHeader title={t('booking.jobs.title')} description={t('booking.jobs.lead')} />
      <Tabs
        label={t('booking.jobs.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'active', label: t('booking.jobs.active'), icon: BriefcaseBusiness, content: <ActiveJobs key="active" /> },
          { id: 'past', label: t('booking.jobs.past'), icon: History, content: <BookingList key="past" viewer="worker" status="past" emptyTitle={t('booking.jobs.emptyPast')} emptyText={t('booking.jobs.emptyPastText')} /> },
        ]}
      />
    </div>
  );
}

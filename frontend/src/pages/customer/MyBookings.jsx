// /bookings — the customer's bookings (Batch 6, section 7): tabs Active and Past. Each card shows the
// worker, the skill picture, day and time, a status chip (icon, word and colour) and the booking code.
// No phone number in this list: it is only in the booking itself, after the worker accepts (D-002).
import { useState } from 'react';
import { History, Hourglass, Search } from 'lucide-react';
import { Alert, Button, EmptyState, PageHeader, Pagination, Skeleton, Tabs } from '../../components/ui';
import BookingCard from '../../features/booking/BookingCard';
import BookingActions from '../../features/booking/BookingActions';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/booking/Booking.module.css';

const PAGE_SIZE = 20;

export function BookingList({ viewer, status, emptyTitle, emptyText, emptyAction }) {
  const { t, te } = useT();
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const { data, error, reload } = useApiQuery('/bookings/mine', { status, page: String(page), limit: String(PAGE_SIZE) }, { refreshKey: refresh });
  if (error) return <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>;
  if (!data) return <Skeleton variant="block" height={200} />;
  if (data.bookings.length === 0) return <EmptyState art="empty-search" headingLevel={2} title={emptyTitle} description={emptyText} action={emptyAction} />;
  return (
    <>
      <ul className={styles.list}>
        {data.bookings.map((b) => (
          <BookingCard key={b._id} booking={b} viewer={viewer}>
            <BookingActions booking={b} viewer={viewer} compact onChanged={() => setRefresh((n) => n + 1)} />
          </BookingCard>
        ))}
      </ul>
      <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
    </>
  );
}

export default function MyBookings() {
  const { t } = useT();
  useDocumentTitle(t('booking.titles.myBookings'));
  const [tab, setTab] = useState('active');
  return (
    <div className={styles.page}>
      <PageHeader title={t('booking.mine.title')} description={t('booking.mine.lead')} actions={<Button to="/find" icon={Search} variant="secondary">{t('booking.mine.find')}</Button>} />
      <Tabs
        label={t('booking.mine.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'active', label: t('booking.mine.active'), icon: Hourglass, content: <BookingList key="active" viewer="customer" status="active" emptyTitle={t('booking.mine.emptyActive')} emptyText={t('booking.mine.emptyActiveText')} emptyAction={<Button to="/find">{t('booking.mine.find')}</Button>} /> },
          { id: 'past', label: t('booking.mine.past'), icon: History, content: <BookingList key="past" viewer="customer" status="past" emptyTitle={t('booking.mine.emptyPast')} emptyText={t('booking.mine.emptyPastText')} /> },
        ]}
      />
    </div>
  );
}

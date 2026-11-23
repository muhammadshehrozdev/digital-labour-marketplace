// /worker/requests — new hire requests, newest first (Batch 6, section 7). Each card: the skill
// picture, day and time icons, the area and the customer's words, 🔊 "Hear this request", and big
// Accept (green, check) and Decline (cross) buttons. Declining never counts against a worker.
// Module 5: the card shows the customer's price offer, and 🔊 also reads it.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { Alert, EmptyState, PageHeader, Skeleton } from '../../components/ui';
import BookingCard from '../../features/booking/BookingCard';
import BookingActions from '../../features/booking/BookingActions';
import HearRequest from '../../features/booking/HearRequest';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/booking/Booking.module.css';

export default function Requests() {
  const { t, te } = useT();
  useDocumentTitle(t('booking.titles.requests'));
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();
  // Module 5: after accepting a request that came with a price offer, the price part opens (Agree, or Propose another price)
  const changed = (fresh) => (fresh?.status === 'accepted' && fresh.terms?.status === 'proposed' ? navigate(`/worker/jobs/${fresh._id}#terms`) : setRefresh((n) => n + 1));
  const { data, error } = useApiQuery('/bookings/mine', { status: 'requested', limit: '50' }, { refreshKey: refresh });
  return (
    <div className={styles.page}>
      <PageHeader title={t('booking.requests.title')} description={t('booking.requests.lead')} />
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={220} />}
      {data && data.bookings.length === 0 && <EmptyState icon={Inbox} headingLevel={2} title={t('booking.requests.empty')} description={t('booking.requests.emptyText')} />}
      {data && data.bookings.length > 0 && (
        <ul className={styles.list}>
          {data.bookings.map((b) => (
            <BookingCard key={b._id} booking={b} viewer="worker">
              {b.description && <p className={styles.description} dir="auto">{b.description}</p>}
              <HearRequest booking={b} />
              <BookingActions booking={b} viewer="worker" onChanged={changed} />
            </BookingCard>
          ))}
        </ul>
      )}
    </div>
  );
}

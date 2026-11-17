// What happened to a booking, oldest first, in words (statusHistory from the server).
import { useT } from '../../i18n';
import { eventKey } from './bookingText';
import styles from './Booking.module.css';

export default function BookingTimeline({ timeline = [] }) {
  const { t, formatDate } = useT();
  return (
    <section aria-labelledby="timeline-title" className={styles.section}>
      <h2 id="timeline-title" className={styles.sectionTitle}>{t('booking.detail.timeline')}</h2>
      <ol className={styles.timeline}>
        {timeline.map((e, i) => (
          <li key={`${e.at}-${i}`} className={styles.event}>
            <span className={styles.eventText}>{t(eventKey(e), { who: t(`booking.who.${e.by}`) })}</span>
            <time className={styles.muted} dateTime={e.at}>{formatDate(e.at, { dateStyle: 'medium', timeStyle: 'short' })}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}

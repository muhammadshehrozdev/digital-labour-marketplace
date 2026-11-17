// One booking in a list (My bookings, Requests, My jobs): the skill picture, day and time with icons,
// the other person, the state and the booking code. No phone number is ever in a list (D-002).
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { TradeArt } from '../../components/illustrations';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import BookingStatusChip from './BookingStatusChip';
import { DAY_ICON, SLOT_ICONS, bookingPath, dayWords } from './bookingText';
import styles from './Booking.module.css';

export function WhenWhere({ booking: b }) {
  const { t, formatDate } = useT();
  const SlotIcon = SLOT_ICONS[b.timeSlot] ?? SLOT_ICONS.any;
  return (
    <ul className={styles.when}>
      <li><DAY_ICON size={18} aria-hidden="true" /> {dayWords(t, formatDate, b.preferredDate)}</li>
      <li><SlotIcon size={18} aria-hidden="true" /> {t(`booking.slot.${b.timeSlot}`)}</li>
      <li><MapPin size={18} aria-hidden="true" /> <span dir="auto">{b.area}</span>, <span dir="auto">{b.city}</span></li>
    </ul>
  );
}

export default function BookingCard({ booking: b, viewer, children }) {
  const { t } = useT();
  const { skillName } = useTaxonomy();
  const other = viewer === 'worker' ? b.customer?.name : b.worker?.name;
  return (
    <li className={styles.card} data-testid="booking-card">
      <div className={styles.cardTop}>
        <TradeArt category={b.category} size={48} />
        <div className={styles.cardMain}>
          <h3 className={styles.cardTitle}>
            <Link to={bookingPath(viewer, b._id)} className={styles.cardLink}>{skillName({ skillId: b.skillId, name: b.skillName })}</Link>
          </h3>
          {other && <p className={styles.muted} dir="auto">{t(viewer === 'worker' ? 'booking.card.customer' : 'booking.card.worker', { name: other })}</p>}
        </div>
        <BookingStatusChip booking={b} />
      </div>
      <WhenWhere booking={b} />
      <p className={styles.code}>{t('booking.card.code')} <span dir="ltr" className="tabular">{b.code}</span></p>
      {children}
    </li>
  );
}

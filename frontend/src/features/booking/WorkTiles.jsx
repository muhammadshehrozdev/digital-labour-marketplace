// Worker dashboard tiles for Module 4: new requests and accepted jobs (real counts from the server),
// and the short reputation line with a link to "My reputation".
import { Award, BriefcaseBusiness, Inbox, Wallet } from 'lucide-react';
import { Button } from '../../components/ui';
import Reveal from '../../components/motion/Reveal';
import RatingBadge from '../reputation/RatingBadge';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import styles from './Booking.module.css';
import { monthWords, rupees } from '../wage/wageText';

export default function WorkTiles({ reputation, className }) {
  const { t, formatNumber, formatDate } = useT();
  const { data } = useApiQuery('/bookings/mine', { status: 'active', limit: '1' });
  const counts = data?.counts;
  // Module 5: this month's confirmed money (only shown when the earnings answer)
  const earnings = useApiQuery('/workers/me/earnings').data;
  return (
    <div className={[styles.tiles, className].filter(Boolean).join(' ')} data-testid="work-tiles">
      {counts && (
        <>
          <Reveal className={styles.tile}>
            <h2 className={styles.sectionTitle}><Inbox size={20} aria-hidden="true" /> {t('booking.nav.requests')}</h2>
            <p className={styles.count}>{formatNumber(counts.requested)}</p>
            <p className={styles.muted}>{t('booking.tiles.requests', { count: counts.requested })}</p>
            <Button to="/worker/requests" size="sm" variant={counts.requested ? 'primary' : 'secondary'}>{t('booking.tiles.openRequests')}</Button>
          </Reveal>
          <Reveal index={1} className={styles.tile}>
            <h2 className={styles.sectionTitle}><BriefcaseBusiness size={20} aria-hidden="true" /> {t('booking.nav.jobs')}</h2>
            <p className={styles.count}>{formatNumber(counts.accepted)}</p>
            <p className={styles.muted}>{t('booking.tiles.jobs', { count: counts.accepted })}</p>
            <Button to="/worker/jobs" size="sm" variant="secondary">{t('booking.tiles.openJobs')}</Button>
          </Reveal>
        </>
      )}
      <Reveal index={2} className={styles.tile}>
        <h2 className={styles.sectionTitle}><Award size={20} aria-hidden="true" /> {t('booking.nav.reputation')}</h2>
        <RatingBadge reputation={reputation} />
        <Button to="/worker/reputation" size="sm" variant="secondary">{t('booking.tiles.openReputation')}</Button>
      </Reveal>
      {earnings?.thisMonth && (
        <Reveal index={3} className={styles.tile} data-testid="earnings-tile">
          <h2 className={styles.sectionTitle}><Wallet size={20} aria-hidden="true" /> {t('wage.nav.earnings')}</h2>
          <p className={`${styles.count} tabular`} dir="ltr">{rupees(t, formatNumber, earnings.thisMonth.confirmed)}</p>
          <p className={styles.muted}>{t('wage.earnings.tile', { month: monthWords(formatDate, earnings.thisMonth.month) })}</p>
          <Button to="/worker/earnings" size="sm" variant="secondary">{t('wage.earnings.open')}</Button>
        </Reveal>
      )}
    </div>
  );
}

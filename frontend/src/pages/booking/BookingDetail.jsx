// One booking, for the customer (/bookings/:id) and the worker (/worker/jobs/:id) (Batch 6, section 7):
// a timeline of what happened, the contact card with Call and WhatsApp when the server allows it
// (D-002), the buttons that fit the state, and the dispute state when one is open.
// Module 5 (Batch 7): the price terms (agree / propose a change, with the checks and the history), the payment
// records (record, confirm, "This is not right"), a link to the printable payment record, and the work-protection
// tips for this person (the safety tip for the booking's trade).
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Gavel } from 'lucide-react';
import { TradeArt } from '../../components/illustrations';
import { Alert, Button, EmptyState, PageHeader } from '../../components/ui';
import BookingActions from '../../features/booking/BookingActions';
import BookingStatusChip from '../../features/booking/BookingStatusChip';
import BookingTimeline from '../../features/booking/BookingTimeline';
import ContactCard from '../../features/booking/ContactCard';
import HearRequest from '../../features/booking/HearRequest';
import { WhenWhere } from '../../features/booking/BookingCard';
import Stars from '../../features/reputation/Stars';
import { useAuth } from '../../context/auth';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/booking/Booking.module.css';
import TermsSummary from '../../features/wage/TermsSummary';
import PaymentsCard from '../../features/wage/PaymentsCard';
import ProtectionCard from '../../features/wage/ProtectionCard';

function DisputeBox({ dispute }) {
  const { t, formatDate } = useT();
  if (!dispute) return null;
  return (
    <section className={styles.section} aria-labelledby="dispute-title">
      <h2 id="dispute-title" className={styles.sectionTitle}><Gavel size={20} aria-hidden="true" /> {t(`booking.dispute.type.${dispute.type}`)}</h2>
      <p>{t(dispute.status === 'open' ? 'booking.dispute.open' : 'booking.dispute.decided', { date: formatDate(dispute.decidedAt ?? dispute.openedAt) })}</p>
      {dispute.reasonCode && <p className={styles.muted}>{t(`booking.reasons.dispute.${dispute.reasonCode}`)}</p>}
      {dispute.note && <p className={styles.description} dir="auto">{dispute.note}</p>}
      {dispute.decision && <p><strong>{t(`booking.dispute.decision.${dispute.decision}`)}</strong></p>}
      {dispute.decisionNote && <p className={styles.description} dir="auto">{dispute.decisionNote}</p>}
    </section>
  );
}

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const viewer = user?.role === 'worker' ? 'worker' : 'customer';
  const { t, te } = useT();
  const { skillName } = useTaxonomy();
  useDocumentTitle(t('booking.titles.detail'));
  const [fresh, setFresh] = useState(null);
  const { data, error, status, loading } = useApiQuery(`/bookings/${encodeURIComponent(id)}`);
  const back = viewer === 'worker' ? '/worker/jobs' : '/bookings';
  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) {
    return <EmptyState art="not-found" headingLevel={1} title={t('booking.detail.notFound')} description={t('booking.detail.notFoundText')} action={<Button to={back}>{t('booking.detail.back')}</Button>} />;
  }
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  const b = fresh ?? data.booking;
  const other = viewer === 'worker' ? b.customer?.name : b.worker?.name;

  return (
    <div className={styles.page}>
      <Button to={back} variant="ghost" size="sm" icon={ArrowLeft}>{t('booking.detail.back')}</Button>
      <PageHeader
        eyebrow={<span>{t('booking.card.code')} <span dir="ltr" className="tabular">{b.code}</span></span>}
        title={skillName({ skillId: b.skillId, name: b.skillName })}
        description={other ? t(viewer === 'worker' ? 'booking.card.customer' : 'booking.card.worker', { name: other }) : undefined}
        actions={<BookingStatusChip booking={b} />}
      />
      <div className={styles.detailGrid}>
        <div className={styles.page} style={{ paddingBlockEnd: 0 }}>
          <section className={styles.section} aria-labelledby="what-title">
            <h2 id="what-title" className={styles.sectionTitle}><TradeArt category={b.category} size={32} /> {t('booking.detail.what')}</h2>
            <WhenWhere booking={b} />
            {b.description && <p className={styles.description} dir="auto">{b.description}</p>}
            {viewer === 'worker' && b.status === 'requested' && <HearRequest booking={b} />}
            <BookingActions booking={b} viewer={viewer} onChanged={setFresh} />
            {b.status === 'accepted' && viewer === 'worker' && <p className={styles.muted}>{t('booking.detail.workerTip')}</p>}
          </section>
          {/* Module 5: the price and the payments (the server decides every button) */}
          <TermsSummary booking={b} viewer={viewer} onChanged={setFresh} />
          <PaymentsCard booking={b} viewer={viewer} onChanged={setFresh} recordPath={`${viewer === 'worker' ? '/worker/jobs' : '/bookings'}/${b._id}/payment-record`} />
          <DisputeBox dispute={b.dispute} />
          {b.review && (
            <section className={styles.section} aria-labelledby="review-title">
              <h2 id="review-title" className={styles.sectionTitle}>{t('booking.detail.reviewTitle')}</h2>
              <p><Stars value={b.review.rating} /> {t(b.review.status === 'hidden' ? 'booking.detail.reviewHidden' : 'booking.detail.reviewVisible')}</p>
            </section>
          )}
        </div>
        <div className={styles.page} style={{ paddingBlockEnd: 0 }}>
          <ContactCard contact={b.contact} viewer={viewer} />
          {viewer === 'worker' ? (
            <>
              <ProtectionCard audience="worker" tip="safety" category={b.category} />
              <ProtectionCard audience="worker" tip="record_payments" />
            </>
          ) : (
            <>
              <ProtectionCard audience="customer" tip="safe_workplace" category={b.category} />
              <ProtectionCard audience="customer" tip="pay_on_time" />
            </>
          )}
          <BookingTimeline timeline={b.timeline} />
        </div>
      </div>
    </div>
  );
}

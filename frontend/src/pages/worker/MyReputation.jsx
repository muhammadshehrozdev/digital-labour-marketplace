// /worker/reputation — "My reputation" (Batch 6, section 7). One summary sentence that can be heard,
// four rules in simple words (each can be heard), how every review was counted (perReview from the
// server), the reliability counts, tips, and the worker's own cancellations. The numbers are the
// worker's own (customers never see them), always with words next to them.
import { CalendarClock, History, Repeat2, UserRoundCheck, UsersRound } from 'lucide-react';
import { Alert, Badge, Button, PageHeader } from '../../components/ui';
import OptionListen from '../../features/assist/OptionListen';
import ReputationPanel from '../../features/reputation/ReputationPanel';
import Stars from '../../features/reputation/Stars';
import { depthOf, oneDecimal } from '../../features/reputation/reputationText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/booking/Booking.module.css';

const RULES = [
  ['onlyCustomers', UserRoundCheck],
  ['newerCount', CalendarClock],
  ['sameCustomer', Repeat2],
  ['hiredOthers', UsersRound],
];
const two = (n) => (Number.isFinite(n) ? n.toFixed(2) : '');

export default function MyReputation() {
  const { t, te, formatDate } = useT();
  const { skillName } = useTaxonomy();
  useDocumentTitle(t('booking.titles.reputation'));
  const { data, error } = useApiQuery('/workers/me/reputation');
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  if (!data) return <PageLoading />;
  const { snapshot, perReview, cancellations, rules } = data;
  const pub = snapshot.public;
  const depth = depthOf(pub);
  const summaryKey = depth === 'none' ? 'reputation.mine.summaryNone' : 'reputation.mine.summary';
  const summaryParams = { average: oneDecimal(pub.ratingAverage), count: pub.reviewCount, jobs: pub.completedJobs, depth: t(`reputation.depth.${depth}`) };

  return (
    <div className={styles.page}>
      <PageHeader title={t('reputation.mine.title')} description={t('reputation.mine.lead')} actions={<Button to="/worker/reviews" variant="secondary">{t('booking.nav.reviews')}</Button>} />
      <section className={styles.section} aria-labelledby="summary-title">
        <h2 id="summary-title" className="visually-hidden">{t('reputation.mine.summaryTitle')}</h2>
        <p className={styles.big}>{t(summaryKey, summaryParams)}</p>
        <OptionListen helpKey={summaryKey} name={t('reputation.mine.summaryTitle')} params={{ ...summaryParams, depth: (lang, spokenT) => spokenT(`reputation.depth.${depth}`) }} />
      </section>

      <section className={styles.section} aria-labelledby="rules-title">
        <h2 id="rules-title" className={styles.sectionTitle}>{t('reputation.mine.rulesTitle')}</h2>
        <ul className={styles.rules}>
          {RULES.map(([id, Icon]) => (
            <li key={id} className={styles.rule}>
              <span className={styles.ruleIcon} aria-hidden="true"><Icon size={22} /></span>
              <span className={styles.ruleText}>
                <h3>{t(`reputation.mine.rules.${id}.title`)}</h3>
                <p>{t(`reputation.mine.rules.${id}.text`)}</p>
                <OptionListen helpKey={`reputation.mine.rules.${id}.text`} name={t(`reputation.mine.rules.${id}.title`)} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="numbers-title">
        <h2 id="numbers-title" className={styles.sectionTitle}>{t('reputation.mine.numbersTitle')}</h2>
        <p>{t('reputation.mine.expected', { value: two(snapshot.score.expected) })}</p>
        <p>{t('reputation.mine.cautious', { value: two(snapshot.score.cautious) })}</p>
        <p>{t('reputation.mine.reliability', { value: two(snapshot.reliability.expected) })}</p>
        <p className={styles.muted}>{t('reputation.mine.numbersNote')}</p>
      </section>

      <section className={styles.section} aria-labelledby="per-review-title">
        <h2 id="per-review-title" className={styles.sectionTitle}>{t('reputation.mine.perReviewTitle')}</h2>
        {perReview.length === 0 && <p className={styles.muted}>{t('reputation.noReviews')}</p>}
        <ul className={styles.rules}>
          {perReview.map((p) => (
            <li key={p.id} className={styles.rule} data-testid="per-review">
              <Stars value={p.stars} />
              <span className={styles.ruleText}>
                <span className={styles.muted}>{formatDate(p.createdAt)}{p.skillId ? ` · ${skillName({ skillId: p.skillId })}` : ''}</span>
                <span>{p.reasons.map((r) => t(`reputation.reason.${r}`)).join(' ')}</span>
                <span className={styles.muted}>{t('reputation.mine.weight', { value: two(p.weight) })}</span>
              </span>
            </li>
          ))}
        </ul>
        {data.hiddenReviews > 0 && <p className={styles.muted}>{t('reputation.mine.hidden', { count: data.hiddenReviews })}</p>}
      </section>

      <ReputationPanel reputation={snapshot} headingLevel={2} />

      <section className={styles.section} aria-labelledby="tips-title">
        <h2 id="tips-title" className={styles.sectionTitle}>{t('reputation.mine.tipsTitle')}</h2>
        <ul>
          <li>{t('reputation.mine.tips.cancelEarly', { hours: rules.lateCancelHours })}</li>
          <li>{t('reputation.mine.tips.decline')}</li>
          <li>{t('reputation.mine.tips.workDone')}</li>
          <li>{t('reputation.mine.tips.dispute', { days: rules.disputeWindowDays })}</li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="cancel-title">
        <h2 id="cancel-title" className={styles.sectionTitle}><History size={20} aria-hidden="true" /> {t('reputation.mine.cancellationsTitle')}</h2>
        {cancellations.length === 0 ? <p className={styles.muted}>{t('reputation.mine.noCancellations')}</p> : (
          <ul className={styles.rules}>
            {cancellations.map((c) => (
              <li key={c._id} className={styles.rule}>
                <Badge tone={c.outcome === 'cancelled_by_worker_early' ? 'warning' : 'danger'}>{t(`booking.outcome.${c.outcome}`)}</Badge>
                <span className={styles.ruleText}>
                  <span>{skillName({ skillId: c.skillId, name: c.skillName })} · <span dir="ltr">{c.code}</span></span>
                  <span className={styles.muted}>{formatDate(c.closedAt)}</span>
                  {c.disputeStatus && <span className={styles.muted}>{t(c.disputeStatus === 'open' ? 'booking.disputeOpen' : `booking.dispute.decision.${c.disputeDecision}`)}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

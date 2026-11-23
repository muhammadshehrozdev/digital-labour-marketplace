// /worker/reputation — "My reputation" (Batch 6, section 7). One summary sentence that can be heard,
// the rules of the live engine in simple words (from the server's rule list, Batch 6B; each can be heard), how every review was counted (perReview from the
// server), the reliability counts, tips, and the worker's own cancellations. The numbers are the
// worker's own (customers never see them), always with words next to them.
import { AlarmClock, CalendarClock, CalendarRange, History, Repeat2, UserRoundCheck, UserRoundPlus, UsersRound } from 'lucide-react';
import { Alert, Badge, Button, PageHeader } from '../../components/ui';
import OptionListen from '../../features/assist/OptionListen';
import ReputationPanel from '../../features/reputation/ReputationPanel';
import Stars from '../../features/reputation/Stars';
import { depthOf, oneDecimal, reasonText, ruleText } from '../../features/reputation/reputationText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/booking/Booking.module.css';

// The rules come from the server (the live engine's parameters, Batch 6B); these four are the rep-1 ones,
// used only if an older server sends no list.
const RULE_ICONS = { onlyCustomers: UserRoundCheck, newerCount: CalendarClock, sameCustomer: Repeat2, hiredOthers: UsersRound, newAccounts: UserRoundPlus, burst: CalendarRange, lateCancel: AlarmClock };
const REP1_RULES = ['onlyCustomers', 'newerCount', 'sameCustomer', 'hiredOthers'].map((id) => ({ id, values: {} }));
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
          {(rules.items ?? REP1_RULES).map((item) => {
            const Icon = RULE_ICONS[item.id] ?? UserRoundCheck;
            const { titleKey, textKey, values } = ruleText(item);
            return (
              <li key={item.id} className={styles.rule} data-testid="reputation-rule">
                <span className={styles.ruleIcon} aria-hidden="true"><Icon size={22} /></span>
                <span className={styles.ruleText}>
                  <h3>{t(titleKey)}</h3>
                  <p>{t(textKey, values)}</p>
                  <OptionListen helpKey={textKey} params={Object.keys(values).length ? values : undefined} name={t(titleKey)} />
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="numbers-title">
        <h2 id="numbers-title" className={styles.sectionTitle}>{t('reputation.mine.numbersTitle')}</h2>
        {/* rep-2 orders "Best track record" by the reputation score; rep-1 ordered by the careful one */}
        <p>{t(rules.rankBy === 'expected' ? 'b6b.reputation.mine.expected' : 'reputation.mine.expected', { value: two(snapshot.score.expected) })}</p>
        <p>{t(rules.rankBy === 'expected' ? 'b6b.reputation.mine.cautious' : 'reputation.mine.cautious', { value: two(snapshot.score.cautious) })}</p>
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
                <span>{p.reasons.map((r) => reasonText(t, r, { budget: rules.newReviewerBudget ?? 1 })).join(' ')}</span>
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
          <ul className={`${styles.rules} ${styles.stackedRules}`}>
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

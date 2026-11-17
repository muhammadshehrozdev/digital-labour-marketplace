// The Reputation section of the public worker profile (Batch 6, section 4.9), also shown in the
// worker's "See what customers see". Only reputation.public from the server: stars with the count,
// depth in words, the star distribution, quick-answer counts, reliability counts. Never the numbers
// expected / uncertainty / cautious. A percentage only from 5 answers up.
import { BadgeCheck, CalendarX2, Repeat2, Sparkles, UserX } from 'lucide-react';
import { useT } from '../../i18n';
import { QUICK_QUESTIONS, depthOf, oneDecimal, shareText } from './reputationText';
import styles from './Reputation.module.css';

const DEPTH_ICON = { none: Sparkles, few: Sparkles, some: BadgeCheck, many: BadgeCheck };

export default function ReputationPanel({ reputation, headingLevel = 2 }) {
  const { t } = useT();
  const pub = reputation?.public ?? null;
  const depth = depthOf(pub);
  const DepthIcon = DEPTH_ICON[depth];
  const H = `h${headingLevel}`;
  const most = pub ? Math.max(1, ...Object.values(pub.distribution ?? {})) : 1;
  const cancelled = (pub?.workerCancelledEarly ?? 0) + (pub?.workerCancelledLate ?? 0);
  return (
    <section className={styles.panel} aria-labelledby="reputation-title" data-testid="reputation-panel">
      <H id="reputation-title" className={styles.panelTitle}>{t('reputation.title')}</H>
      <p className={styles.depth} data-depth={depth}><DepthIcon size={18} aria-hidden="true" /> {t(`reputation.depth.${depth}`)}</p>
      {depth !== 'none' && (
        <>
          <p className={styles.average}>
            <span aria-hidden="true" className={styles.star}>★</span>{' '}
            <strong className="tabular">{oneDecimal(pub.ratingAverage)}</strong>{' '}
            <span>{t('reputation.outOfFive')}</span>{' · '}
            <span>{t('reputation.reviews', { count: pub.reviewCount })}</span>
          </p>
          <ul className={styles.bars} aria-label={t('reputation.distribution')}>
            {[5, 4, 3, 2, 1].map((n) => (
              <li key={n} className={styles.barRow}>
                <span className={styles.barLabel}>{t('reputation.starsLabel', { count: n })}</span>
                <span className={styles.barTrack} aria-hidden="true"><span className={styles.barFill} style={{ inlineSize: `${(100 * (pub.distribution?.[n] ?? 0)) / most}%` }} /></span>
                <span className={`${styles.barCount} tabular`}>{t('reputation.reviews', { count: pub.distribution?.[n] ?? 0 })}</span>
              </li>
            ))}
          </ul>
          <ul className={styles.quick}>
            {QUICK_QUESTIONS.filter((q) => pub.quick?.[q]?.total > 0).map((q) => (
              <li key={q}>{t(`reputation.quick.${q}`)}: <strong>{shareText(t, pub.quick[q].yes, pub.quick[q].total)}</strong></li>
            ))}
            {pub.wouldHireAgain?.total > 0 && <li>{t('reputation.quick.wouldHireAgain')}: <strong>{shareText(t, pub.wouldHireAgain.yes, pub.wouldHireAgain.total)}</strong></li>}
          </ul>
        </>
      )}
      <ul className={styles.reliability} aria-label={t('reputation.reliabilityTitle')}>
        <li><BadgeCheck size={18} aria-hidden="true" /> {t('reputation.jobsDone', { count: pub?.completedJobs ?? 0 })}</li>
        <li><CalendarX2 size={18} aria-hidden="true" /> {t('reputation.cancelledByWorker', { count: cancelled })}</li>
        <li><UserX size={18} aria-hidden="true" /> {t('reputation.noShows', { count: pub?.noShows ?? 0 })}</li>
        {(pub?.repeatCustomers ?? 0) > 0 && <li><Repeat2 size={18} aria-hidden="true" /> {t('reputation.hiredAgainBy', { count: pub.repeatCustomers })}</li>}
      </ul>
    </section>
  );
}

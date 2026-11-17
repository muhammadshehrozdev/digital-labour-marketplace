// Visible reviews of one worker, newest first, with the worker's reply (Batch 6, section 4.9).
// The reviewer is shown as "Sara K." only. renderActions(review) lets the worker's own page add
// Listen / Reply / Report under each review.
import { useState } from 'react';
import { MessageSquareReply, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Alert, Badge, EmptyState, Pagination, Skeleton } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import Stars from './Stars';
import { QUICK_QUESTIONS } from './reputationText';
import styles from './Reputation.module.css';

const PAGE_SIZE = 10;

export function ReviewItem({ review: r, children }) {
  const { t, formatDate } = useT();
  const { skillName } = useTaxonomy();
  const answers = [...QUICK_QUESTIONS, 'wouldHireAgain'].filter((q) => r[q] === 'yes' || r[q] === 'no');
  return (
    <li className={styles.review} data-testid="review">
      <div className={styles.reviewHead}>
        <Stars value={r.rating} />
        <span className={styles.reviewer} dir="auto">{r.reviewer}</span>
        <time className={styles.muted} dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
      </div>
      <p className={styles.muted}>{skillName({ skillId: r.skillId })}</p>
      {answers.length > 0 && (
        <ul className={styles.answers}>
          {answers.map((q) => (
            <li key={q}><Badge tone={r[q] === 'yes' ? 'success' : 'neutral'} icon={r[q] === 'yes' ? ThumbsUp : ThumbsDown}>{t(`reputation.quick.${q}`)}: {t(`reputation.thumb.${r[q]}`)}</Badge></li>
          ))}
        </ul>
      )}
      {r.comment && <p className={styles.comment} dir="auto">{r.comment}</p>}
      {r.reply && (
        <div className={styles.reply}>
          <p className={styles.replyTitle}><MessageSquareReply size={16} aria-hidden="true" /> {t('reputation.workerReply')}</p>
          <p dir="auto">{r.reply.text}</p>
        </div>
      )}
      {children}
    </li>
  );
}

export default function ReviewList({ workerIdCode, headingLevel = 2, renderActions, refreshKey }) {
  const { t, te } = useT();
  const [page, setPage] = useState(1);
  const { data, error, status } = useApiQuery(workerIdCode ? `/workers/${encodeURIComponent(workerIdCode)}/reviews` : null, { page: String(page), limit: String(PAGE_SIZE) }, { refreshKey });
  const H = `h${headingLevel}`;
  if (status === 404) return null; // unknown worker: the page itself says so
  return (
    <section className={styles.panel} aria-labelledby="reviews-title">
      <H id="reviews-title" className={styles.panelTitle}>{t('reputation.reviewsTitle')}</H>
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={120} />}
      {data && data.reviews.length === 0 && <EmptyState art="empty-search" headingLevel={headingLevel + 1} title={t('reputation.noReviews')} description={t('reputation.noReviewsText')} />}
      {data && data.reviews.length > 0 && (
        <>
          <ul className={styles.reviewList}>
            {data.reviews.map((r) => <ReviewItem key={r._id} review={r}>{renderActions?.(r)}</ReviewItem>)}
          </ul>
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} label={t('reputation.reviewPages')} />
        </>
      )}
    </section>
  );
}

// Audit-chain status widget (Batch 4, feature 32): asks the server to run the same check as
// `npm run audit:verify` and says "Chain intact" or names the first broken entry.
import { Link2, Link2Off, RefreshCw } from 'lucide-react';
import { Button, Spinner } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import styles from './AdminFeatures.module.css';

export default function ChainStatus() {
  const { t, formatDate, formatNumber } = useT();
  const { data, error, loading, reload } = useApiQuery('/admin/audit/verify');
  const state = loading ? 'checking' : error ? 'failed' : data.ok ? 'intact' : 'broken';
  return (
    <section className={[styles.chain, styles[state]].join(' ')} aria-labelledby="chain-title" data-state={state}>
      <span className={styles.chainIcon} aria-hidden="true">
        {state === 'checking' ? <Spinner /> : state === 'intact' ? <Link2 size={24} strokeWidth={1.75} /> : <Link2Off size={24} strokeWidth={1.75} />}
      </span>
      <div className={styles.chainText}>
        <h2 id="chain-title" className={styles.cardTitle}>{t('adminx.chain.title')}</h2>
        <p role="status" className={styles.chainState}>
          {state === 'checking' && t('adminx.chain.checking')}
          {state === 'failed' && t('adminx.chain.failed')}
          {state === 'intact' && t('adminx.chain.intact')}
          {state === 'broken' && t('adminx.chain.broken', { seq: data.badSeq })}
        </p>
        {state === 'intact' && <p className={styles.muted}>{t('adminx.chain.intactText', { count: data.count, n: formatNumber(data.count) })}</p>}
        {state === 'broken' && <p className={styles.muted}>{t(`adminx.chain.problems.${data.problemCode}`)} {t('adminx.chain.brokenText')}</p>}
        {data?.checkedAt && <p className={styles.muted}>{t('adminx.chain.checkedAt', { time: formatDate(data.checkedAt, { timeStyle: 'short' }) })}</p>}
      </div>
      <Button size="sm" variant="secondary" icon={RefreshCw} onClick={reload} disabled={loading}>{t('adminx.chain.again')}</Button>
    </section>
  );
}

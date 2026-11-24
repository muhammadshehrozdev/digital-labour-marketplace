// The card at the top of /find (Module 6, Batch 8B): "Not sure whom to call? Describe the job in your own words",
// with the 🎤 hint and a button to /job-requests/new. The search below works exactly as before.
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '../../components/ui';
import { useT } from '../../i18n';
import styles from './Jobs.module.css';

export default function DescribeJobCard() {
  const { t } = useT();
  return (
    <section className={styles.callout} aria-labelledby="describe-job-card" data-testid="describe-job-card">
      <span className={styles.calloutIcon}><MessageSquarePlus size={26} aria-hidden="true" /></span>
      <div className={styles.calloutText}>
        <h2 id="describe-job-card">{t('jobs.findCard.title')}</h2>
        <p>{t('jobs.findCard.text')}</p>
      </div>
      <Button to="/job-requests/new" icon={MessageSquarePlus}>{t('jobs.nav.describe')}</Button>
    </section>
  );
}

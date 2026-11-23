// The government minimum wage as a REFERENCE (Module 5, D-068): the region, the status in words, the effective
// date, the daily (and hourly) value, the line about which workers these laws are written for, and a link to
// the sources in the Help Centre. Every number comes from the API (config/wageReferences.js on the server).
import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { useT } from '../../i18n';
import { dayDate, regionName, rupees } from './wageText';
import styles from './Wage.module.css';

export default function WageReferenceLine({ reference: r, region, city, showHourly = false }) {
  const { t, lang, formatNumber, formatDate } = useT();
  if (!r) {
    // GB and AJK have no figure; an unknown city has no region at all (the app never guesses)
    return (
      <p className={styles.muted} data-testid="wage-ref-none">
        {region ? t('wage.ref.noFigure') : city ? t('wage.ref.unknownCity', { city }) : t('wage.ref.noCity')}
      </p>
    );
  }
  const values = {
    region: regionName(r.names, lang),
    monthly: rupees(t, formatNumber, r.monthly),
    daily: rupees(t, formatNumber, r.daily),
    hours: r.hoursPerDay,
    date: r.effectiveFrom ? dayDate(formatDate, r.effectiveFrom) : '',
  };
  return (
    <div className={styles.reference} data-testid="wage-ref">
      <p className={styles.referenceMain}>
        <Landmark size={18} aria-hidden="true" /> {t(r.effectiveFrom ? 'wage.ref.line' : 'wage.ref.lineNoDate', values)}
        {r.status === 'announced' && <> {t('wage.ref.announced')}</>}
      </p>
      {showHourly && <p className={styles.muted}>{t('wage.ref.hourly', { hourly: rupees(t, formatNumber, r.hourly) })}</p>}
      <p className={styles.muted}>{t('wage.ref.laws')}</p>
      <Link to="/help#fair-pay" className={styles.link}>{t('wage.ref.sources')}</Link>
    </div>
  );
}

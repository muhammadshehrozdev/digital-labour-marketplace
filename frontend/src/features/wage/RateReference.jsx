// Next to the worker's daily rate in "Your work" (Module 5, §7): the minimum wage reference for the worker's city,
// a gentle note when the daily rate is below it (it stays the worker's choice; nothing is blocked), and a link to
// the prices of this work. Every number comes from GET /api/meta/wage-references (?city= finds the region).
import { Link } from 'react-router-dom';
import { ChartNoAxesColumn } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { plainNumber } from '../../utils/masks';
import { useT } from '../../i18n';
import { regionName, rupees } from './wageText';
import styles from './Wage.module.css';

export default function RateReference({ dailyRate, city }) {
  const { t, lang, formatNumber } = useT();
  const { data } = useApiQuery(city ? '/meta/wage-references' : null, city ? { city } : undefined);
  const region = data?.city?.region ?? null;
  const row = region ? data.regions.find((r) => r.region === region && r.daily) : null;
  const rate = Number(plainNumber(dailyRate));
  return (
    <div className={styles.reference} data-testid="rate-reference">
      {row && (
        <p className={styles.muted}>{t('wage.rate.reference', { region: regionName(row.names, lang), daily: rupees(t, formatNumber, row.daily), hours: data.hoursPerDay })}</p>
      )}
      {row && rate > 0 && rate < row.daily && <p className={styles.note} data-testid="rate-below">{t('wage.rate.below')}</p>}
      <Link to="/prices" className={styles.link}><ChartNoAxesColumn size={18} aria-hidden="true" /> {t('wage.rate.seePrices')}</Link>
    </div>
  );
}

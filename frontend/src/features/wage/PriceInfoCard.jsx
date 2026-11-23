// Price information for one kind of work (Module 5, §7): the typical price on this platform (the middle half of
// agreed prices, only with enough jobs), or else the admin team's price guide (always with its source and month),
// the government minimum wage reference for the region, and the worker's own stated rates. 🔊 reads it all,
// amounts in words. Every number comes from GET /api/prices/estimate (aggregates only).
import { useState } from 'react';
import { ChartNoAxesColumn, NotebookText, X } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import { Skeleton } from '../../components/ui';
import ListenButton from './ListenButton';
import WageReferenceLine from './WageReferenceLine';
import { spokenReference } from './wageLogic';
import { monthWords, regionName, rupees } from './wageText';
import styles from './Wage.module.css';

function placeOf(t, lang, level, query, reference) {
  if (level === 'city') return query.city;
  if (level === 'region') return reference?.names ? regionName(reference.names, lang) : query.city;
  return t('wage.place.country');
}

export default function PriceInfoCard({ skillId, category, unit = 'job', city, workerIdCode, title, onClose, testId = 'price-info' }) {
  const { t, lang, formatNumber, formatDate } = useT();
  const params = Object.fromEntries(Object.entries({ skillId, category: skillId ? undefined : category, unit, city: city?.trim() || undefined, workerIdCode }).filter(([, v]) => v));
  const ask = skillId || category ? '/prices/estimate' : null;
  const { data, error, loading } = useApiQuery(ask, params);
  const [hidden, setHidden] = useState(false);
  if (!ask || hidden) return null;
  if (loading) return <Skeleton variant="block" height={120} />;
  if (error || !data) return null; // price information is help, never a blocker

  const { platform: p, guide: g, wageReference: ref, workerRates: rates, query, rules } = data;
  const unitWords = t(`wage.unitWords.${unit}`);
  const money = (n) => rupees(t, formatNumber, n);
  const rateParts = [
    rates?.hourlyRate ? t('wage.price.hour', { amount: money(rates.hourlyRate) }) : null,
    rates?.dailyRate ? t('wage.price.day', { amount: money(rates.dailyRate) }) : null,
  ].filter(Boolean);

  const build = (spokenT, spokenLang) => {
    const parts = [];
    const sUnit = spokenT(`wage.unitWords.${unit}`);
    if (p) parts.push(spokenT('wage.spoken.platform', { place: placeOf(spokenT, spokenLang, p.level, query, ref), low: p.low, high: p.high, unit: sUnit, jobs: p.jobs, workers: p.workers }));
    else if (g) parts.push(spokenT('wage.spoken.guide', { low: g.low, high: g.high, unit: sUnit, source: g.sourceNote }));
    else parts.push(spokenT('wage.spoken.none'));
    if (ref) parts.push(spokenReference(spokenT, spokenLang, ref));
    return parts.join(' ');
  };

  return (
    <section className={styles.card} aria-labelledby={`${testId}-title`} data-testid={testId}>
      <div className={styles.cardHead}>
        <h3 id={`${testId}-title`} className={styles.cardTitle}><ChartNoAxesColumn size={20} aria-hidden="true" /> {title ?? t('wage.info.title')}</h3>
        {onClose && <button type="button" className={styles.close} aria-label={t('common.close')} onClick={() => { setHidden(true); onClose?.(); }}><X size={18} aria-hidden="true" /></button>}
      </div>
      {p && (
        <div data-testid="price-platform">
          <p className={styles.big}>{t('wage.info.platform', { place: placeOf(t, lang, p.level, query, ref), low: money(p.low), high: money(p.high), unit: unitWords })}</p>
          <p className={styles.muted}>{t('wage.info.platformFrom', { median: money(p.median), jobs: p.jobs, workers: p.workers })}</p>
          {p.scope === 'category' && <p className={styles.muted}>{t('wage.info.categoryScope')}</p>}
        </div>
      )}
      {!p && g && (
        <div data-testid="price-guide">
          <p className={styles.big}><NotebookText size={18} aria-hidden="true" /> {t('wage.info.guide', { low: money(g.low), high: money(g.high), unit: unitWords })}</p>
          <p className={styles.muted} dir="auto">{t('wage.info.guideSource', { source: g.sourceNote, month: monthWords(formatDate, String(g.updatedAt).slice(0, 7)) })}</p>
          {g.note && <p className={styles.muted} dir="auto">{g.note}</p>}
        </div>
      )}
      {!p && !g && (
        <p data-testid="price-none">{query.city ? t('wage.info.none', { place: query.city }) : t('wage.info.noneAnywhere')}</p>
      )}
      {!p && rules && <p className={styles.muted}>{t('wage.info.rules', { jobs: rules.minJobs, workers: rules.minWorkers, customers: rules.minCustomers })}</p>}
      {rateParts.length > 0 && <p data-testid="worker-rates">{t('wage.info.workerRates', { rates: rateParts.join(' · ') })}</p>}
      <WageReferenceLine reference={ref} region={query.region} city={query.city} showHourly={unit === 'hour'} />
      <ListenButton build={build} />
    </section>
  );
}

// The Help Centre guide "Fair pay and safe work" (Module 5, §4.8): the tips for workers and for customers (two
// tabs), the minimum wage table for every region with its status, effective date and sources (read from
// GET /api/meta/wage-references, never typed into the page), the date the figures were checked, and the
// helpline numbers with their sources. Every part can be heard.
import { useState } from 'react';
import { ExternalLink, Landmark, Phone } from 'lucide-react';
import { Skeleton, Tabs } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import ListenButton from './ListenButton';
import { CUSTOMER_TIPS, WORKER_TIPS, tipText } from './wageLogic';
import { dayDate, regionName, rupees, spokenRupees } from './wageText';
import styles from './Wage.module.css';

// helpline numbers of §4.8 and where each comes from (the team checks them: docs/MODULE-5-MANUAL-TEST.md)
const HELPLINES = [
  { id: 'rescue', number: '1122', source: { key: 'wage.guide.sources.rescue', url: 'https://en.wikipedia.org/wiki/Rescue_1122' } },
  { id: 'police', number: '15', source: { key: 'wage.guide.sources.police', url: 'https://islamabadpolice.gov.pk/r15.php' } },
  { id: 'labour', number: '1314', source: { key: 'wage.guide.sources.labour', url: 'https://tribune.com.pk/story/2639368/punjabs-labour-law-extends-legal-coverage' } },
];

function WageTable() {
  const { t, lang, formatNumber, formatDate } = useT();
  const { data, error } = useApiQuery('/meta/wage-references');
  if (error) return <p className={styles.muted}>{t('wage.guide.tableFailed')}</p>;
  if (!data) return <Skeleton variant="block" height={200} />;
  const money = (n) => rupees(t, formatNumber, n);
  const status = (r) => (r.status === 'none' ? t('wage.guide.status.none') : t(`wage.guide.status.${r.status}`, { date: r.statusDate ? dayDate(formatDate, r.statusDate) : t('wage.guide.noDate') }));
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} data-testid="wage-table">
        <caption className={styles.caption}>{t('wage.guide.tableCaption')}</caption>
        <thead>
          <tr><th scope="col">{t('wage.guide.region')}</th><th scope="col">{t('wage.guide.monthly')}</th><th scope="col">{t('wage.guide.daily', { days: data.workingDaysPerMonth })}</th><th scope="col">{t('wage.guide.hourly', { hours: data.hoursPerDay })}</th><th scope="col">{t('wage.guide.statusHeader')}</th><th scope="col">{t('wage.guide.sourcesHeader')}</th></tr>
        </thead>
        <tbody>
          {data.regions.map((r) => (
            <tr key={r.region} data-region={r.region}>
              <th scope="row">{regionName(r.names, lang)}</th>
              <td className="tabular">{r.monthly ? money(r.monthly) : '—'}</td>
              <td className="tabular">{r.daily ? money(r.daily) : '—'}</td>
              <td className="tabular">{r.hourly ? money(r.hourly) : '—'}</td>
              <td>
                {status(r)}
                {r.effectiveFrom && <><br /><span className={styles.muted}>{t('wage.guide.from', { date: dayDate(formatDate, r.effectiveFrom) })}</span></>}
                {!r.effectiveFrom && r.monthly && <><br /><span className={styles.muted}>{t('wage.guide.fromUnknown')}</span></>}
                {r.notifiedFound && <><br /><span className={styles.muted}>{t('wage.guide.notifiedFound', { amount: money(r.notifiedFound.monthly), date: dayDate(formatDate, r.notifiedFound.effectiveFrom) })}</span></>}
              </td>
              <td>
                {r.sources.length === 0 ? '—' : (
                  <ul className={styles.sourceList}>
                    {r.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer noopener" className={styles.link}>{s.title} <ExternalLink size={14} aria-hidden="true" /></a></li>)}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.muted} data-testid="wage-checked">{t('wage.guide.checkedOn', { date: dayDate(formatDate, data.checkedOn) })}</p>
      <p className={styles.muted}>
        {t('wage.guide.convention', { days: data.workingDaysPerMonth, hours: data.hoursPerDay })}{' '}
        <a href={data.generalSource.url} target="_blank" rel="noreferrer noopener" className={styles.link}>{data.generalSource.title} <ExternalLink size={14} aria-hidden="true" /></a>
      </p>
      <p className={styles.muted}>{t('wage.ref.laws')}</p>
      <ListenButton build={(spokenT, spokenLang) => [spokenT('wage.guide.tableCaption'), ...data.regions.filter((r) => r.daily).map((r) => spokenT('wage.spoken.tableRow', { region: regionName(r.names, spokenLang), monthly: spokenRupees(spokenT)(r.monthly), daily: spokenRupees(spokenT)(r.daily) }))].join('. ')} />
    </div>
  );
}

export default function FairPayGuide({ role }) {
  const { t } = useT();
  const [tab, setTab] = useState(role === 'customer' ? 'customer' : 'worker');
  const list = (audience, tips) => (
    <ol className={styles.tipList}>
      {tips.map((tip) => (
        <li key={tip} className={styles.tip}>
          <strong>{t(`wage.protect.title.${tip}`)}</strong>
          <span>{tipText(t, audience, tip)}</span>
          {tip === 'minimum_wage' && <a href="#wage-table" className={styles.link}>{t('wage.guide.seeTable')}</a>}
          <ListenButton small label={t('wage.listenShort')} build={(spokenT) => `${spokenT(`wage.protect.title.${tip}`)}. ${tipText(spokenT, audience, tip)}`} />
        </li>
      ))}
    </ol>
  );
  return (
    <section id="fair-pay" className={styles.guide} aria-labelledby="fair-pay-title" data-testid="fair-pay-guide">
      <h2 id="fair-pay-title" className={styles.guideTitle}>{t('wage.guide.title')}</h2>
      <p>{t('wage.guide.lead')}</p>
      <Tabs
        label={t('wage.guide.tabsLabel')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'worker', label: t('wage.guide.forWorkers'), content: list('worker', WORKER_TIPS) },
          { id: 'customer', label: t('wage.guide.forCustomers'), content: list('customer', CUSTOMER_TIPS) },
        ]}
      />
      <h3 id="wage-table" className={styles.subHeading}><Landmark size={20} aria-hidden="true" /> {t('wage.guide.tableTitle')}</h3>
      <WageTable />
      <h3 className={styles.subHeading}><Phone size={20} aria-hidden="true" /> {t('wage.guide.helplinesTitle')}</h3>
      <ul className={styles.helplines} data-testid="helplines">
        {HELPLINES.map((h) => (
          <li key={h.id}>
            <a href={`tel:${h.number}`} className={styles.helplineNumber} dir="ltr">{h.number}</a>
            <span>{t(`wage.guide.helpline.${h.id}`)}</span>
            <a href={h.source.url} target="_blank" rel="noreferrer noopener" className={styles.link}>{t(h.source.key)} <ExternalLink size={14} aria-hidden="true" /></a>
          </li>
        ))}
      </ul>
      <p className={styles.muted}>{t('wage.guide.helplinesCheck')}</p>
      <p className={styles.muted}>{t('wage.guide.notAdvice')}</p>
    </section>
  );
}

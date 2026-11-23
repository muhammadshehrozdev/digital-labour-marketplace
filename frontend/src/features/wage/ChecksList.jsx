// The rule-based checks of a price proposal (Module 5, §4.3), shown to BOTH people on the terms form and in the
// summary. Each can be heard. They only warn: nobody is ever stopped from sending or agreeing. The rules run on
// the server (services/wage/termsChecks.js); this file only words them.
import { useT } from '../../i18n';
import ListenButton from './ListenButton';
import { checkText } from './wageLogic';
import { CHECK_ICONS, rupees, spokenRupees } from './wageText';
import styles from './Wage.module.css';

export default function ChecksList({ checks, names, viewer, busy = false }) {
  const { t, lang, formatNumber } = useT();
  if (!checks) return null;
  const money = (n) => rupees(t, formatNumber, n);
  return (
    <div className={styles.checks} aria-live="polite" data-testid="terms-checks" aria-busy={busy || undefined}>
      <h4 className={styles.subTitle}>{t('wage.check.title')}</h4>
      {checks.length === 0 ? (
        <p className={styles.muted}>{t('wage.check.none')}</p>
      ) : (
        <ul className={styles.checkList}>
          {checks.map((c, i) => {
            const Icon = CHECK_ICONS[c.severity] ?? CHECK_ICONS.info;
            return (
              <li key={`${c.id}-${c.params?.condition ?? i}`} className={[styles.check, styles[c.severity]].join(' ')} data-check={c.id}>
                <Icon size={18} aria-hidden="true" />
                <span className={styles.checkText}>{checkText(t, money, c, { names, lang, viewer })}</span>
                <ListenButton small label={t('wage.listenShort')} build={(spokenT, spokenLang) => checkText(spokenT, spokenRupees(spokenT), c, { names, lang: spokenLang, viewer })} />
              </li>
            );
          })}
        </ul>
      )}
      <p className={styles.muted}>{t('wage.check.neverBlocks')}</p>
    </div>
  );
}

// "What the app understood from your words" (Module 6): for each detail, what the analyzer suggested for the saved
// words and what the customer chose, marked "kept", "changed" or "nothing suggested" (the server's analysis.changed).
// Never a score. The customer's own page shows the budget; admins see the same table in their drawer.
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { dayWords } from '../booking/bookingText';
import { rupees } from '../wage/wageText';
import { budgetLine } from './jobText';
import styles from './Jobs.module.css';

const FIELDS = ['category', 'skills', 'taskType', 'city', 'preferredDate', 'timeSlot', 'urgent', 'budget'];

export default function UnderstoodTable({ job, showBudget = true }) {
  const { t, formatDate, formatNumber } = useT();
  const { categoryLabel, skillName, skills: allSkills } = useTaxonomy();
  const a = job.analysis;
  if (!a) return null;
  const s = a.suggested ?? {};
  const money = (n) => rupees(t, formatNumber, n);
  const none = t('jobs.understood.nothing');
  const names = (ids) => (ids.length ? ids.map((id) => skillName({ skillId: id })).join(t('common.listSeparator')) : none);
  // the analyzer lists every skill it found (any trade); like analysis.changed.skills, only those of the job's trade
  const tradeSkills = (s.skills ?? []).filter((id) => allSkills.find((x) => x.id === id)?.category === job.category);
  const shown = (field, v) => {
    if (field === 'category') return v ? categoryLabel(v) : none;
    if (field === 'skills') return names(v);
    if (field === 'taskType') return v ? t(`jobs.task.${v}`) : none;
    if (field === 'city') return v || none;
    if (field === 'preferredDate') return v ? dayWords(t, formatDate, v) : none;
    if (field === 'timeSlot') return v ? t(`booking.slot.${v}`) : none;
    if (field === 'urgent') return v ? t('jobs.summary.urgent') : none;
    if (field === 'budget') return v ? budgetLine(t, money, v) : none;
    return none;
  };
  const suggested = {
    ...s,
    category: s.category ?? null,
    skills: tradeSkills,
    urgent: s.urgent === true,
  };
  const chosen = { ...job, skills: (job.skills ?? []).map((x) => x.skillId) };
  const result = (field) => {
    const v = a.changed?.[field];
    if (v === true) return t('jobs.understood.changed');
    if (v === false) return t('jobs.understood.kept');
    return t('jobs.understood.none');
  };
  const rows = FIELDS.filter((f) => showBudget || f !== 'budget');
  return (
    <div className={styles.summary} data-testid="understood">
      <p className={styles.muted}>{t('jobs.understood.lead')}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th scope="col">{t('jobs.understood.field')}</th><th scope="col">{t('jobs.understood.suggested')}</th><th scope="col">{t('jobs.understood.chosen')}</th><th scope="col">{t('jobs.understood.result')}</th></tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f} data-field={f}>
                <th scope="row">{t(`jobs.understood.fields.${f}`)}</th>
                <td dir="auto">{f === 'category' && !s.category && s.categoryTie?.length ? t('jobs.understood.tie', { trades: s.categoryTie.map(categoryLabel).join(t('common.listSeparator')) }) : shown(f, suggested[f])}</td>
                <td dir="auto">{shown(f, chosen[f])}</td>
                <td>{result(f)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {s.notes?.length > 0 && (
        <ul className={styles.reasons}>{s.notes.map((n) => <li key={n}>{t(`jobs.understood.notes.${n}`)}</li>)}</ul>
      )}
      <p className={styles.muted}>{t('jobs.understood.method', { method: t(`jobs.method.${a.method}`) })}</p>
    </div>
  );
}

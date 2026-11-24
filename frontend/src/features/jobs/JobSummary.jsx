// The job details with pictures and words (Module 6): the trade, the skills, the kind of work, the place, the day and
// time, "urgent", and the budget ONLY on the customer's own pages (showBudget) — never on a page a worker can open.
// 🔊 reads it all in the spoken language (Roman Urdu users hear Urdu; amounts are said as numbers).
import { Banknote, CalendarDays, ListChecks, Lock, MapPin, Siren } from 'lucide-react';
import { TradeArt } from '../../components/illustrations';
import { categoryLabelIn, skillNameIn, useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { SLOT_ICONS, dayKey, dayWords } from '../booking/bookingText';
import ListenButton from '../wage/ListenButton';
import { rupees } from '../wage/wageText';
import { TASK_ICONS, budgetLine } from './jobText';
import styles from './Jobs.module.css';

// job: { category, skills [{ skillId, name }] or [skillId], taskType, city, area, preferredDate, timeSlot, urgent, budget }

export default function JobSummary({ job, showBudget = false, showDescription = false, listen = true, testId = 'job-summary' }) {
  const { t, formatDate, formatNumber } = useT();
  const { categoryLabel, skillName } = useTaxonomy();
  const skills = (job.skills ?? []).map((s) => (typeof s === 'string' ? { skillId: s } : s));
  const task = job.taskType ?? 'none';
  const TaskIcon = TASK_ICONS[task];
  const SlotIcon = SLOT_ICONS[job.timeSlot] ?? SLOT_ICONS.any;
  const money = (n) => rupees(t, formatNumber, n);

  const build = (spokenT, lang) => {
    const day = job.preferredDate ? dayKey(job.preferredDate) : null;
    const parts = [
      spokenT('jobs.spoken.trade', { trade: categoryLabelIn(job.category, lang) }),
      skills.length ? spokenT('jobs.spoken.skills', { skills: skills.map((s) => skillNameIn(s, lang)).join(spokenT('common.listSeparator')) }) : null,
      spokenT('jobs.spoken.kind', { kind: spokenT(`jobs.task.${task}`) }),
      spokenT('jobs.spoken.place', { area: job.area, city: job.city }),
      spokenT('jobs.spoken.when', {
        day: !job.preferredDate ? spokenT('jobs.day.none') : day ? spokenT(day) : formatDate(`${job.preferredDate}T12:00:00Z`, { weekday: 'long', day: 'numeric', month: 'long' }),
        time: job.timeSlot ? spokenT(`booking.slot.${job.timeSlot}`) : spokenT('jobs.time.none'),
      }),
      job.urgent ? spokenT('jobs.spoken.urgent') : null,
      showBudget && job.budget ? spokenT(`jobs.budget.spoken.${job.budget.unit}`, { amount: job.budget.amount }) : null,
    ];
    return parts.filter(Boolean).join(' ');
  };

  return (
    <div className={styles.summary} data-testid={testId}>
      <ul className={styles.facts}>
        <li><TradeArt category={job.category} size={40} /> <span><span className={styles.factLabel}>{t('jobs.summary.trade')}</span> {categoryLabel(job.category)}</span></li>
        {skills.length > 0 && <li><ListChecks size={22} aria-hidden="true" /> <span><span className={styles.factLabel}>{t('jobs.summary.skills')}</span> {skills.map((s) => skillName(s)).join(t('common.listSeparator'))}</span></li>}
        <li><TaskIcon size={22} aria-hidden="true" /> <span><span className={styles.factLabel}>{t('jobs.summary.kind')}</span> {t(`jobs.task.${task}`)}</span></li>
        <li><MapPin size={22} aria-hidden="true" /> <span><span dir="auto">{job.area}</span>, <span dir="auto">{job.city}</span></span></li>
        <li><CalendarDays size={22} aria-hidden="true" /> <span>{job.preferredDate ? dayWords(t, formatDate, job.preferredDate) : t('jobs.day.none')}</span></li>
        <li><SlotIcon size={22} aria-hidden="true" /> <span>{job.timeSlot ? t(`booking.slot.${job.timeSlot}`) : t('jobs.time.none')}</span></li>
        {job.urgent && <li><Siren size={22} aria-hidden="true" /> <strong>{t('jobs.summary.urgent')}</strong></li>}
        {showBudget && (
          <li data-testid="job-budget">
            <Banknote size={22} aria-hidden="true" />
            <span>
              {budgetLine(t, money, job.budget)}
              <span className={styles.private}><Lock size={14} aria-hidden="true" /> {t('jobs.budget.private')}</span>
            </span>
          </li>
        )}
      </ul>
      {showDescription && job.description && <p className={styles.description} dir="auto">{job.description}</p>}
      {listen && <ListenButton build={build} label={t('jobs.summary.listen')} />}
    </div>
  );
}

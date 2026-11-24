// One job request in "My job requests": the trade picture, the code, the kind of work, the city, the day and time,
// the state with its one-line meaning, and the main action for that state. Never a budget in a list.
import { Link } from 'react-router-dom';
import { CalendarDays, Eye, MapPin, Users } from 'lucide-react';
import { TradeArt } from '../../components/illustrations';
import { Button } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { SLOT_ICONS, dayWords } from '../booking/bookingText';
import JobStateChip from './JobStateChip';
import { TASK_ICONS } from './jobText';
import styles from './Jobs.module.css';

export default function JobCard({ job }) {
  const { t, formatDate } = useT();
  const { categoryLabel } = useTaxonomy();
  const task = job.taskType ?? 'none';
  const TaskIcon = TASK_ICONS[task];
  const SlotIcon = SLOT_ICONS[job.timeSlot] ?? SLOT_ICONS.any;
  const path = `/job-requests/${job._id}`;
  return (
    <li className={styles.card} data-testid="job-card">
      <div className={styles.cardTop}>
        <TradeArt category={job.category} size={48} />
        <div className={styles.cardMain}>
          <h3 className={styles.cardTitle}><Link to={path} className={styles.cardLink}>{categoryLabel(job.category)}</Link></h3>
          <span className={styles.code}><span dir="ltr" className="tabular">{job.code}</span></span>
        </div>
        <JobStateChip state={job.state} />
      </div>
      <p className={styles.meaning}>{t(`jobs.meaning.${job.state}`)}</p>
      <ul className={styles.when}>
        <li><TaskIcon size={18} aria-hidden="true" /> {t(`jobs.task.${task}`)}</li>
        <li><MapPin size={18} aria-hidden="true" /> <span dir="auto">{job.city}</span></li>
        <li><CalendarDays size={18} aria-hidden="true" /> {job.preferredDate ? dayWords(t, formatDate, job.preferredDate) : t('jobs.day.none')}</li>
        <li><SlotIcon size={18} aria-hidden="true" /> {job.timeSlot ? t(`booking.slot.${job.timeSlot}`) : t('jobs.time.none')}</li>
      </ul>
      <div className={styles.actions}>
        {job.state === 'open' && (job.actions ?? []).includes('find_workers')
          ? <Button size="sm" icon={Users} to={`${path}/workers`}>{t('jobs.card.chooseWorker')}<span className="visually-hidden">: {job.code}</span></Button>
          : <Button size="sm" variant="secondary" icon={Eye} to={path}>{t('jobs.card.open')}<span className="visually-hidden">: {job.code}</span></Button>}
      </div>
    </li>
  );
}

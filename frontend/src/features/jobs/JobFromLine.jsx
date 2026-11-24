// On a booking that was sent from a job request (Module 6): "From job request JR-…" and "Kind of work: Repair".
// The customer's line links to the job request; a worker's (and an admin's) is text only. The server sends `job` only
// on such a booking, and never a budget or an analysis in it; a booking without `job` shows nothing here.
import { Link } from 'react-router-dom';
import { ClipboardPen } from 'lucide-react';
import { useT } from '../../i18n';
import { TASK_ICONS } from './jobText';
import styles from './Jobs.module.css';

export default function JobFromLine({ job, viewer }) {
  const { t } = useT();
  if (!job?.code) return null;
  const text = t('jobs.fromJob.line', { code: job.code });
  const TaskIcon = job.taskType ? TASK_ICONS[job.taskType] : null;
  return (
    <p className={styles.fromJob} data-testid="from-job">
      <ClipboardPen size={16} aria-hidden="true" />
      {viewer === 'customer' && job._id ? <Link to={`/job-requests/${job._id}`}>{text}</Link> : <span>{text}</span>}
      {TaskIcon && <span className={styles.fromJob}><TaskIcon size={16} aria-hidden="true" /> {t('jobs.fromJob.kind', { kind: t(`jobs.task.${job.taskType}`) })}</span>}
    </p>
  );
}

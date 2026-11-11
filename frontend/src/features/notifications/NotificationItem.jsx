// One notification, written from its type and parameters in the website language.
import { BadgeCheck, CircleAlert } from 'lucide-react';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { notificationTone } from './notificationText';
import styles from './Notifications.module.css';

export default function NotificationItem({ n }) {
  const { t, formatDate } = useT();
  const { skillName } = useTaxonomy();
  const skill = n.params?.skillId ? skillName({ skillId: n.params.skillId, name: n.params.skillName }) : n.params?.skillName ?? '';
  const tone = notificationTone(n.type);
  const Icon = tone === 'success' ? BadgeCheck : CircleAlert;
  return (
    <span className={styles.item} data-read={n.read}>
      <span className={[styles.icon, styles[tone]].join(' ')} aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <span className={styles.body}>
        <span className={styles.title}>
          {!n.read && <span className={styles.newBadge}>{t('workerx.notifications.newOne')}</span>}
          {t(`workerx.notifications.types.${n.type}.title`, { skill })}
        </span>
        <span className={styles.text}>{t(`workerx.notifications.types.${n.type}.text`)}</span>
        {n.params?.note && n.type !== 'evidence_approved' && <span className={styles.text} dir="auto">{t('workerx.notifications.reason', { note: n.params.note })}</span>}
        <time className={styles.time} dateTime={n.createdAt}>{formatDate(n.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</time>
      </span>
    </span>
  );
}

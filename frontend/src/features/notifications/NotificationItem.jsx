// One notification, written from its type and parameters in the website language.
import { BadgeCheck, CircleAlert, HandCoins, Handshake, Info, Wallet } from 'lucide-react';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { notificationTextKey, notificationTone } from './notificationText';
import { rupees } from '../wage/wageText';

// Module 5: each new type has its own picture
const WAGE_ICONS = { terms_proposed: Handshake, terms_agreed: Handshake, payment_recorded: Wallet, payment_confirmed: HandCoins, payment_disputed: CircleAlert };
import styles from './Notifications.module.css';

export default function NotificationItem({ n }) {
  const { t, formatDate, formatNumber } = useT();
  const { skillName } = useTaxonomy();
  const skill = n.params?.skillId ? skillName({ skillId: n.params.skillId, name: n.params.skillName }) : n.params?.skillName ?? '';
  const tone = notificationTone(n.type);
  const Icon = WAGE_ICONS[n.type] ?? (tone === 'success' ? BadgeCheck : tone === 'info' ? Info : CircleAlert);
  const base = notificationTextKey(n.type);
  // Module 4 params: the booking code, the stars, a reason code (words from booking.reasons)
  const extra = { code: n.params?.bookingCode ?? '', count: Number(n.params?.rating) || 0 };
  // Module 5 params: the amount and the unit (words from wage.unitWords)
  if (n.params?.amount) extra.amount = rupees(t, formatNumber, Number(n.params.amount));
  if (n.params?.unit) extra.unit = t(`wage.unitWords.${n.params.unit}`);
  if (n.type === 'payment_disputed' && n.params?.reasonCode) extra.reason = t(`wage.pay.reasons.${n.params.reasonCode}`);
  return (
    <span className={styles.item} data-read={n.read}>
      <span className={[styles.icon, styles[tone]].join(' ')} aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <span className={styles.body}>
        <span className={styles.title}>
          {!n.read && <span className={styles.newBadge}>{t('workerx.notifications.newOne')}</span>}
          {t(`${base}.title`, { skill, ...extra })}
        </span>
        <span className={styles.text}>{t(`${base}.text`, { skill, ...extra })}</span>
        {n.params?.note && n.type !== 'evidence_approved' && <span className={styles.text} dir="auto">{t('workerx.notifications.reason', { note: n.params.note })}</span>}
        <time className={styles.time} dateTime={n.createdAt}>{formatDate(n.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</time>
      </span>
    </span>
  );
}

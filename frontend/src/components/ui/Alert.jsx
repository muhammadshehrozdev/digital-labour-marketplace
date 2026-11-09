import { CircleCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import styles from './Alert.module.css';

const ICONS = { success: CircleCheck, danger: CircleAlert, warning: TriangleAlert, info: Info };

// Inline, page-level message. Errors use role="alert" (read out at once); others role="status".
export default function Alert({ tone = 'info', title, children, action }) {
  const Icon = ICONS[tone] ?? Info;
  return (
    <div className={[styles.alert, styles[tone]].join(' ')} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
      <div className={styles.text}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

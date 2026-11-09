import styles from './EmptyState.module.css';

export default function EmptyState({ icon: Icon, title, description, action, headingLevel = 2 }) {
  const H = `h${headingLevel}`;
  return (
    <div className={styles.empty}>
      {Icon && <span className={styles.icon}><Icon size={28} strokeWidth={1.75} aria-hidden="true" /></span>}
      <H className={styles.title}>{title}</H>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

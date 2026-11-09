import styles from './PageHeader.module.css';

// The page's single h1, with an optional eyebrow line, description and actions.
export default function PageHeader({ title, description, eyebrow, actions }) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

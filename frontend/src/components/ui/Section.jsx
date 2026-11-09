import styles from './Section.module.css';

// A titled block inside a page (h2), with an optional description and actions.
export default function Section({ title, description, actions, children, headingLevel = 2, id }) {
  const H = `h${headingLevel}`;
  return (
    <section className={styles.section} aria-labelledby={id ? `${id}-title` : undefined}>
      {(title || actions) && (
        <div className={styles.head}>
          <div className={styles.titles}>
            {title && <H id={id ? `${id}-title` : undefined} className={styles.title}>{title}</H>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

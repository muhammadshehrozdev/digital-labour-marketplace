import SceneArt from '../illustrations/SceneArt';
import styles from './EmptyState.module.css';

// An empty or "nothing here" block. art: the name of a scene illustration (preferred);
// icon: a small icon tile (older screens). The drawing is decorative: the title says it in words.
export default function EmptyState({ icon: Icon, art, title, description, action, headingLevel = 2, compact = false }) {
  const H = `h${headingLevel}`;
  return (
    <div className={[styles.empty, compact && styles.compact].filter(Boolean).join(' ')} data-art-hover>
      {art && <SceneArt name={art} size={compact ? 120 : 176} float={!compact} />}
      {!art && Icon && <span className={styles.icon}><Icon size={28} strokeWidth={1.75} aria-hidden="true" /></span>}
      <H className={styles.title}>{title}</H>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

import { avatarColor, initials } from '../../utils/avatarColor';
import styles from './Avatar.module.css';

// Initials on a colour chosen from the name (AA contrast checked). No photos.
// transitionName: a view-transition name, so the same avatar can travel from a worker card to the
// profile header when the page changes (Batch 4, feature 38).
export default function Avatar({ name = '', size = 'md', transitionName }) {
  const color = avatarColor(name);
  return (
    <span className={[styles.avatar, styles[size]].join(' ')} style={{ background: color.bg, color: color.fg, viewTransitionName: transitionName }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

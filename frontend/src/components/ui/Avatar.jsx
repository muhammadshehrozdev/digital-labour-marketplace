import { avatarColor, initials } from '../../utils/avatarColor';
import styles from './Avatar.module.css';

// Initials on a colour chosen from the name (AA contrast checked). No photos.
export default function Avatar({ name = '', size = 'md' }) {
  const color = avatarColor(name);
  return (
    <span className={[styles.avatar, styles[size]].join(' ')} style={{ background: color.bg, color: color.fg }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

import styles from './Badge.module.css';

// tone: neutral | primary | success | warning | danger | info | accent
export default function Badge({ tone = 'neutral', icon: Icon, children, className }) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')}>
      {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
      {children}
    </span>
  );
}

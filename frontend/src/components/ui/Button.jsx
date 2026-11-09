import { Link } from 'react-router-dom';
import Spinner from './Spinner';
import styles from './Button.module.css';

const cx = (...c) => c.filter(Boolean).join(' ');

// variant: primary | secondary | ghost | danger; size: sm | md | lg.
// `to` renders a router link that looks like a button. `loading` keeps the width and shows a spinner.
export default function Button({
  variant = 'primary', size = 'md', loading = false, fullWidth = false, icon: Icon, iconRight: IconRight,
  to, type = 'button', className, children, disabled, ...rest
}) {
  const classes = cx(styles.button, styles[variant], styles[size], fullWidth && styles.full, loading && styles.loading, className);
  const content = (
    <>
      {loading && <span className={styles.spinnerWrap}><Spinner size={size === 'sm' ? 14 : 18} /></span>}
      <span className={styles.label}>
        {Icon && <Icon size={size === 'sm' ? 16 : 20} strokeWidth={1.75} aria-hidden="true" />}
        {children}
        {IconRight && <IconRight size={size === 'sm' ? 16 : 20} strokeWidth={1.75} aria-hidden="true" />}
      </span>
    </>
  );
  if (to) {
    return <Link to={to} className={classes} {...rest}>{content}</Link>;
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}

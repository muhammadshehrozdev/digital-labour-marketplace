import styles from './IconButton.module.css';

// An icon-only button. `label` is required: it becomes the accessible name.
export default function IconButton({ label, icon: Icon, size = 'md', className, type = 'button', ...rest }) {
  if (!label && import.meta.env.DEV) console.error('IconButton needs a label (aria-label).');
  return (
    <button type={type} aria-label={label} title={label} className={[styles.iconButton, styles[size], className].filter(Boolean).join(' ')} {...rest}>
      <Icon size={size === 'sm' ? 18 : 20} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

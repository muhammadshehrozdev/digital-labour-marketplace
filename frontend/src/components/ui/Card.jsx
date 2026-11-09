import styles from './Card.module.css';

export default function Card({ as: Tag = 'div', padding = 'md', className, children, ...rest }) {
  return <Tag className={[styles.card, styles[padding], className].filter(Boolean).join(' ')} {...rest}>{children}</Tag>;
}

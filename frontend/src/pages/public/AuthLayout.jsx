// Log in / Create account frame: the form card, and on wide screens a dark brand panel with
// three real product facts (no invented numbers or reviews).
import { BadgeCheck, Lock, ShieldCheck } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import { useT } from '../../i18n';
import styles from './AuthCard.module.css';

export default function AuthLayout({ children }) {
  const { t } = useT();
  const facts = [
    { icon: ShieldCheck, text: t('landing.trust.identity.title') },
    { icon: BadgeCheck, text: t('landing.trust.proof.title') },
    { icon: Lock, text: t('landing.trust.privacy.title') },
  ];
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>{children}</div>
      <aside className={`${styles.side} dark-section`} aria-hidden="true">
        <Logo size={40} tone="dark" />
        <p className={styles.sideTitle}>{t('auth.login.side')}</p>
        <ul className={styles.facts}>
          {facts.map(({ icon: Icon, text }) => (
            <li key={text}><span className={styles.factIcon}><Icon size={18} strokeWidth={2} /></span>{text}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

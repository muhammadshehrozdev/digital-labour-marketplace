// Work-protection information (Module 5, §4.8): short tips written for the ear, for workers and customers. One
// card shows one tip, can be heard and closed. Safety tips are GENERAL ADVICE from the team, not training. No
// legal advice and no promises. Helpline numbers only those of §4.8, each with its source in the Help Centre.
import { useState } from 'react';
import { HardHat, ShieldCheck, Siren, X } from 'lucide-react';
import { useT } from '../../i18n';
import ListenButton from './ListenButton';
import { tipText } from './wageLogic';
import styles from './Wage.module.css';

const ICON = { safety: HardHat, emergency: Siren };

export default function ProtectionCard({ audience, tip, category, children }) {
  const { t } = useT();
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  const Icon = ICON[tip] ?? ShieldCheck;
  const title = t(`wage.protect.title.${tip}`);
  return (
    <aside className={styles.protect} aria-label={title} data-testid={`protect-${audience}-${tip}`}>
      <div className={styles.cardHead}>
        <p className={styles.protectTitle}><Icon size={20} aria-hidden="true" /> {title}</p>
        <button type="button" className={styles.close} aria-label={t('wage.protect.close', { title })} onClick={() => setClosed(true)}><X size={18} aria-hidden="true" /></button>
      </div>
      <p>{tipText(t, audience, tip, category)}</p>
      {children}
      <ListenButton small build={(spokenT) => `${spokenT(`wage.protect.title.${tip}`)}. ${tipText(spokenT, audience, tip, category)}`} />
    </aside>
  );
}

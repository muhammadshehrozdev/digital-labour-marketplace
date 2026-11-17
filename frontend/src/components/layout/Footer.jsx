import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';
import { OPEN_WHATS_NEW } from '../../features/app/AppCommands';
import { useT } from '../../i18n';
import LanguageSwitcher from './LanguageSwitcher';
import TextSizeControl from './TextSizeControl';
import ThemeToggle from './ThemeToggle';
import InstallButton from '../../features/app/install/InstallButton';
import styles from './Footer.module.css';

// People's names are written as the team writes them (Latin letters) in every language.
const TEAM = 'Muhammad Shehroz, Shahzaib Khan, Usama Asif';
const SUPERVISOR = 'Ms. Tooba Abdul Qudoos Khan';

export default function Footer() {
  const { t } = useT();
  return (
    <footer className={`${styles.footer} dark-section`}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Logo size={36} tone="dark" />
          <p className={styles.description}>{t('footer.description')}</p>
          <p className={styles.links}>
            <Link to="/help">{t('nav.help')}</Link>
            <button type="button" className={styles.linkButton} onClick={() => window.dispatchEvent(new Event(OPEN_WHATS_NEW))}>{t('appx.whatsNew.title')}</button>
          </p>
          {/* Batch 6B: on every page, for everyone (hidden only inside the installed app) */}
          <InstallButton />
        </div>
        <div className={styles.langCol}>
          <p className={styles.colTitle}>{t('footer.languageTitle')}</p>
          <LanguageSwitcher tone="dark" placement="above" />
        </div>
        <div className={styles.langCol}>
          <p className={styles.colTitle}>{t('theme.footerTitle')}</p>
          <div className={styles.appearance}>
            <ThemeToggle tone="dark" placement="above" />
            <TextSizeControl tone="dark" />
          </div>
        </div>
        <div className={styles.credit}>
          <p>{t('footer.project')}</p>
          <p>
            {t('footer.team')}: <span lang="en" dir="ltr">{TEAM}</span>.{' '}
            {t('footer.supervisor')}: <span lang="en" dir="ltr">{SUPERVISOR}</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

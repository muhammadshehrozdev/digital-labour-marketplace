import Logo from '../brand/Logo';
import { useT } from '../../i18n';
import LanguageSwitcher from './LanguageSwitcher';
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
        </div>
        <div className={styles.langCol}>
          <p className={styles.colTitle}>{t('footer.languageTitle')}</p>
          <LanguageSwitcher tone="dark" placement="above" />
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

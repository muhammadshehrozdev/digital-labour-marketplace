import { LogoMark } from '../brand/Logo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <LogoMark size={24} />
          <span><strong>Digital Labour Marketplace</strong></span>
        </div>
        <p>Final Year Project, BS Software Engineering, SZABIST Islamabad.</p>
        <p>Team: Muhammad Shehroz, Shahzaib Khan, Usama Asif. Supervisor: Ms. Tooba Abdul Qudoos Khan.</p>
      </div>
    </footer>
  );
}

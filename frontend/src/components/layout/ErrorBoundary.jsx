import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '../ui';
import { useT } from '../../i18n/context';
import styles from './ErrorBoundary.module.css';

// The crash screen. A function component, so it can use the current language. Also the router's
// errorElement (a crash inside a page).
export function CrashScreen() {
  const { t } = useT();
  return (
    <main id="main" className={styles.page}>
      <div className={styles.card} role="alert">
        <TriangleAlert size={32} aria-hidden="true" className={styles.icon} />
        <h1>{t('crash.title')}</h1>
        <p>{t('crash.text')}</p>
        <Button onClick={() => window.location.reload()}>{t('crash.reload')}</Button>
      </div>
    </main>
  );
}

// Catches crashes in a page and shows a calm message instead of a blank screen.
// No error details are shown to the user.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('Page crashed:', error); // dev only
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <CrashScreen />;
  }
}

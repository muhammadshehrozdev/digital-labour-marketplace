import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '../ui';
import styles from './ErrorBoundary.module.css';

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
    return (
      <main id="main" className={styles.page}>
        <div className={styles.card} role="alert">
          <TriangleAlert size={32} aria-hidden="true" className={styles.icon} />
          <h1>Something went wrong</h1>
          <p>The page could not be shown. Your saved data is safe. Please reload the page.</p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      </main>
    );
  }
}

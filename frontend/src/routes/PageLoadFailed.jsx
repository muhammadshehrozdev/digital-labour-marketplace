// Shown inside the normal page frame when the code of an on-demand page could not be downloaded
// (offline, a weak mobile connection, or a new version of the website replaced the old files).
// It loads again by itself when the connection is back (the offline banner's retry), or on a tap.
import { Component, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, EmptyState } from '../components/ui';
import { onRetry } from '../features/app/connectivity';
import { useT } from '../i18n';

// A failed download is marked by lazyPage, so other crashes still reach the crash screen.
const isPageLoadError = (error) => Boolean(error?.pageLoadFailed);

function PageLoadFailed({ onRetryPage, tries }) {
  const { t } = useT();
  useEffect(() => onRetry(onRetryPage), [onRetryPage]);
  return (
    <div role="alert" data-testid="page-load-failed">
      <EmptyState
        art="offline"
        headingLevel={1}
        title={t('appx.pageLoad.title')}
        description={t('appx.pageLoad.text')}
        action={
          <>
            <Button icon={RefreshCw} onClick={onRetryPage}>{t('appx.pageLoad.retry')}</Button>
            {/* a browser that keeps the failed download needs a full reload */}
            {tries > 0 && <Button variant="secondary" onClick={() => window.location.reload()}>{t('crash.reload')}</Button>}
          </>
        }
      />
    </div>
  );
}

export class PageLoadBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (!isPageLoadError(error)) throw error; // not a download problem: the crash screen handles it
    return <PageLoadFailed onRetryPage={this.props.onRetry} tries={this.props.tries} />;
  }
}

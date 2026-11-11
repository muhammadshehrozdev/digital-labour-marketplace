// Pages most visitors never open are loaded on demand (Batch 4): the first download stays small.
// While one loads, the usual page placeholder is shown. If the download fails (offline, weak
// connection, a new version replaced the files), a calm message with "Try again" is shown inside
// the page frame instead of the crash screen, and the page loads again when the connection is back.
import { lazy, Suspense, useCallback, useState } from 'react';
import { PageLoading } from './guards';
import { PageLoadBoundary } from './PageLoadFailed';

export function lazyPage(load) {
  const loadMarked = () => load().catch((cause) => {
    throw Object.assign(new Error('Page download failed'), { pageLoadFailed: true, cause });
  });
  // React keeps a failed lazy() for ever, so a retry needs a new one.
  let Page = lazy(loadMarked);
  return function LazyPage() {
    const [tries, setTries] = useState(0);
    const retry = useCallback(() => {
      Page = lazy(loadMarked);
      setTries((n) => n + 1);
    }, []);
    return (
      <PageLoadBoundary key={tries} onRetry={retry} tries={tries}>
        <Suspense fallback={<PageLoading />}><Page /></Suspense>
      </PageLoadBoundary>
    );
  };
}

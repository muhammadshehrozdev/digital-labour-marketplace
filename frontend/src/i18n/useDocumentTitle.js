// The browser tab title in the current language: "<page> · <app name>".
import { useEffect } from 'react';
import { useT } from './context';

export function useDocumentTitle(pageTitle) {
  const { t } = useT();
  const appName = t('app.name');
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${appName}` : appName;
  }, [pageTitle, appName]);
}

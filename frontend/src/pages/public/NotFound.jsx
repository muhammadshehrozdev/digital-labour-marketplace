import { MapPinOff } from 'lucide-react';
import { Button, EmptyState } from '../../components/ui';
import { useDocumentTitle, useT } from '../../i18n';

export default function NotFound() {
  const { t } = useT();
  useDocumentTitle(t('titles.notFound'));
  return (
    <EmptyState
      icon={MapPinOff}
      headingLevel={1}
      title={t('notFound.title')}
      description={t('notFound.text')}
      action={<Button to="/">{t('notFound.home')}</Button>}
    />
  );
}

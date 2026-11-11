// The logo mark alone with a name for screen readers (used where the wordmark does not fit).
import { LogoMark } from './Logo';
import { useT } from '../../i18n/context';

export function Logo({ size = 32 }) {
  const { t } = useT();
  return <LogoMark size={size} title={t('app.name')} />;
}

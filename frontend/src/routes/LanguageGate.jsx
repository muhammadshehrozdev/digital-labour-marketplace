// First visit: show the language chooser before any page. A logged-in user whose account has a
// saved language skips it (LanguageSync applies that language).
import { useAuth } from '../context/auth';
import { useLanguage } from '../i18n';
import LanguageChooser from '../pages/language/LanguageChooser';
import { PageLoading } from './guards';

export default function LanguageGate({ children }) {
  const { chosen } = useLanguage();
  const { user, loading } = useAuth();
  if (chosen) return children;
  if (loading || user?.preferredLanguage) return <PageLoading />;
  return <LanguageChooser />;
}

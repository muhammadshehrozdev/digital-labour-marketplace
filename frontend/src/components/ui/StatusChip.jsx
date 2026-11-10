import { CircleDashed } from 'lucide-react';
import Badge from './Badge';
import { STATUS } from './status';
import { useT } from '../../i18n/context';

// Tone + icon + words for a status (never colour alone). Words come from status.<kind>.<status>.
export default function StatusChip({ kind = 'identity', status }) {
  const { t } = useT();
  const s = STATUS[kind]?.[status];
  if (!s) return <Badge tone="neutral" icon={CircleDashed}>{status ? String(status) : t('status.unknown')}</Badge>;
  return <Badge tone={s.tone} icon={s.icon}>{t(kind === 'account' ? `status_account.${status}` : `status.${kind}.${status}`)}</Badge>;
}

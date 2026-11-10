// "Waiting 3 days" for a queue row (Batch 4, feature 28). The words carry the number; the colour
// only adds urgency.
import { Hourglass } from 'lucide-react';
import { Badge } from '../../components/ui';
import { useT } from '../../i18n';
import { waitingDays, waitingTone } from './adminHelpers';

export default function WaitingBadge({ since }) {
  const { t, formatDate } = useT();
  const days = waitingDays(since);
  if (days === null) return t('common.empty');
  return (
    <span title={formatDate(since, { dateStyle: 'medium', timeStyle: 'short' })}>
      <Badge tone={waitingTone(days)} icon={Hourglass}>{days === 0 ? t('adminx.waiting.today') : t('adminx.waiting.days', { count: days })}</Badge>
    </span>
  );
}

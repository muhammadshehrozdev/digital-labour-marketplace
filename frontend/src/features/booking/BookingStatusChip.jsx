// The state of a booking as icon + word + colour (never colour alone), plus "Dispute open".
import { Gavel } from 'lucide-react';
import { Badge } from '../../components/ui';
import { useT } from '../../i18n';
import { STATUS_LOOK } from './bookingText';

export default function BookingStatusChip({ booking }) {
  const { t } = useT();
  const look = STATUS_LOOK[booking.status] ?? STATUS_LOOK.requested;
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25rem' }}>
      <Badge tone={look.tone} icon={look.icon}>{t(`booking.status.${booking.status}`)}</Badge>
      {booking.disputeStatus === 'open' && <Badge tone="warning" icon={Gavel}>{t('booking.disputeOpen')}</Badge>}
    </span>
  );
}

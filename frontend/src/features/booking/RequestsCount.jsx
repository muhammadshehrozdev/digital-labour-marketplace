// The number of new requests next to "Requests" in the worker's navigation (Module 4). Asked again on
// every page change; shown as a number AND in words for screen readers ("2 new").
import { useLocation } from 'react-router-dom';
import { Badge } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';

export default function RequestsCount() {
  const { t } = useT();
  const { pathname } = useLocation();
  const { data } = useApiQuery('/bookings/mine', { status: 'requested', limit: '1' }, { refreshKey: pathname, keepPrevious: true });
  const count = data?.counts?.requested ?? 0;
  if (!count) return null;
  return (
    <span data-testid="requests-count" style={{ marginInlineStart: '0.35rem' }}>
      <Badge tone="danger"><span aria-hidden="true">{count}</span><span className="visually-hidden">{t('booking.nav.newCount', { count })}</span></Badge>
    </span>
  );
}

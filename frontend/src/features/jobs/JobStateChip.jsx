// The state of a job request as icon + word + colour (never colour alone).
import { Badge } from '../../components/ui';
import { useT } from '../../i18n';
import { STATE_LOOK } from './jobText';

export default function JobStateChip({ state }) {
  const { t } = useT();
  const look = STATE_LOOK[state] ?? STATE_LOOK.open;
  return <Badge tone={look.tone} icon={look.icon}>{t(`jobs.state.${state}`)}</Badge>;
}

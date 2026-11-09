import { CircleDashed } from 'lucide-react';
import Badge from './Badge';
import { STATUS } from './status';

export default function StatusChip({ kind = 'identity', status }) {
  const s = STATUS[kind]?.[status] ?? { tone: 'neutral', icon: CircleDashed, text: String(status ?? 'Unknown') };
  return <Badge tone={s.tone} icon={s.icon}>{s.text}</Badge>;
}

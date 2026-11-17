// One quick question ("On time?") as a real radio group: thumbs up, thumbs down, or skip. Each choice
// has a picture AND a word, and its own 🔊; the question has its Listen row (Batch 5 rules).
import { ThumbsDown, ThumbsUp, SkipForward } from 'lucide-react';
import { RadioCardGroup } from '../../components/ui';
import { useT } from '../../i18n';

export default function ThumbsInput({ legend, name, value, onChange, assist }) {
  const { t } = useT();
  return (
    <RadioCardGroup
      legend={legend}
      name={name}
      layout="tiles"
      value={value ?? 'skip'}
      onChange={(v) => onChange(v === 'skip' ? null : v)}
      assist={assist}
      listen="thumb"
      options={[
        { value: 'yes', title: t('reputation.thumb.yes'), icon: ThumbsUp },
        { value: 'no', title: t('reputation.thumb.no'), icon: ThumbsDown },
        { value: 'skip', title: t('reputation.thumb.skip'), icon: SkipForward },
      ]}
    />
  );
}

// The "Describe your work" box with the matched words marked inside the typed text (Batch 4,
// feature 12). A copy of the text lies exactly under the transparent text box, with the same
// font, size, padding and wrapping; only the marks are visible in it. It scrolls with the box.
// The marks are decorative (aria-hidden): screen readers get the matched words in the list of
// suggestions, and a short legend under the box says what the marks mean.
import { useRef } from 'react';
import Field from '../../components/ui/Field';
import fieldStyles from '../../components/ui/Field.module.css';
import { useT } from '../../i18n';
import { markMatches } from './skillsText';
import styles from './SkillsEditor.module.css';

export default function HighlightedTextArea({ label, hint, maxLength, value, onChange, words = [], rows = 5 }) {
  const { t } = useT();
  const mirror = useRef(null);
  const parts = markMatches(value, words);
  const marked = parts.some((p) => p.match);
  const length = [...String(value)].length;
  const counter = (
    <span className={fieldStyles.counter} aria-live="polite">{length.toLocaleString('en')}/{maxLength.toLocaleString('en')}</span>
  );
  const shared = [fieldStyles.control, fieldStyles.textarea, fieldStyles.urdu].join(' ');
  return (
    <Field label={label} hint={marked ? `${hint} ${t('workerx.highlight.legend')}` : hint} counter={counter}>
      {(fieldProps) => (
        <div className={styles.highlightWrap} data-marked={marked || undefined}>
          {marked && (
            <div ref={mirror} className={`${shared} ${styles.mirror}`} dir="auto" aria-hidden="true" data-testid="highlight-mirror">
              {parts.map((p, i) => (p.match ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
              {'\n'}
            </div>
          )}
          <textarea
            {...fieldProps}
            rows={rows}
            value={value}
            maxLength={maxLength}
            dir="auto"
            className={`${shared} ${styles.overMirror}`}
            onChange={onChange}
            onScroll={(e) => { if (mirror.current) mirror.current.scrollTop = e.currentTarget.scrollTop; }}
          />
        </div>
      )}
    </Field>
  );
}

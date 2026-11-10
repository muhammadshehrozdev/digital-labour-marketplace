// Logo v2 (Batch 3, D-018). <Logo /> = mark + wordmark; <LogoMark /> = the mark only.
// tone: 'light' (on light backgrounds) or 'dark' (hero, footer). mono: one colour (currentColor).
// animated: the mark draws itself and the wordmark fades in (landing, language chooser);
// with reduced motion the CSS shows the finished logo at once.
import { useId } from 'react';
import { useT } from '../../i18n/context';
import { LOGO_CONCEPTS } from './logoMarks';
import styles from './Logo.module.css';

// The chosen concept (D-018): "Stitched Nut". The other two stay in docs/design/logo-concepts/ and
// in the theme lab (/dev/themes).
export const LOGO_CONCEPT = 'nut';

export function LogoMark({ size = 32, title, concept = LOGO_CONCEPT, tone = 'light', mono = false, animated = false }) {
  const mark = LOGO_CONCEPTS[concept] ?? LOGO_CONCEPTS[LOGO_CONCEPT];
  const gradientId = `lg${useId().replace(/:/g, '')}`;
  const fill = mono ? 'currentColor' : `url(#${gradientId})`;
  return (
    <svg
      className={[styles.mark, styles[tone], mono && styles.mono, animated && styles.animated].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {!mono && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--logo-fill-start)" />
            <stop offset="1" stopColor="var(--logo-fill-end)" />
          </linearGradient>
        </defs>
      )}
      <path className={styles.shape} d={mark.shape} fill={fill} />
      {animated && <path className={styles.outline} d={mark.shape} pathLength="1" fill="none" />}
      <g className={styles.details}>{size <= 20 && mark.smallDetails ? mark.smallDetails : mark.details}</g>
    </svg>
  );
}

// variant "full": mark + wordmark (the second word hides on very small screens).
// variant "mark": the mark only (needs a title for screen readers).
// compact: on very small screens only the mark is shown (the header).
export default function Logo({ size = 32, variant = 'full', tone = 'light', animated = false, concept, compact = false }) {
  const { t } = useT();
  if (variant === 'mark') return <LogoMark size={size} title={t('app.name')} tone={tone} concept={concept} animated={animated} />;
  return (
    <span className={[styles.logo, styles[tone], animated && styles.animatedLogo, compact && styles.compact].filter(Boolean).join(' ')}>
      <LogoMark size={size} tone={tone} concept={concept} animated={animated} />
      <span className={styles.wordmark}>
        <span className={styles.primary}>{t('app.nameFirst')}</span>
        <span className={styles.secondary}> {t('app.nameSecond')}</span>
      </span>
    </span>
  );
}

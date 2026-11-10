// Logo v3 (Batch 4, D-021): the Batch 1 shield + wrench + check, refined.
// <Logo /> = mark + wordmark; <LogoMark /> = the mark only.
//   tone      'light' (default: follows the page theme) or 'dark' (on the dark hero and footer)
//   mono      one colour (currentColor), the check-wrench cut out
//   animated  the shield outline draws, the wrench rotates into place, the check draws last, the
//             wordmark slides in (landing hero, language chooser). Reduced motion: finished logo.
//   Small sizes (20 px and below) use a bolder drawing and stay flat; only the large hero size
//   (96 px and above, or hero) gets a soft highlight.
import { useId } from 'react';
import { useT } from '../../i18n/context';
import { CheckWrench } from './logoMarks';
import { LOGO_REFINEMENT, SHIELD, geometryFor } from './logoGeometry';
import styles from './Logo.module.css';

export function LogoMark({ size = 32, title, refinement = LOGO_REFINEMENT, tone = 'light', mono = false, animated = false, hero = false }) {
  const uid = useId().replace(/:/g, '');
  const g = geometryFor(mono ? 'balanced' : refinement, size);
  const depth = !mono && (hero || size >= 96);
  const classes = animated ? { wrench: styles.wrench, check: styles.check } : {};
  const shieldFill = depth ? `url(#g${uid})` : 'var(--logo-flat)';

  let art;
  if (mono) {
    art = (
      <>
        <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <CheckWrench g={g} ink="#000" />
        </mask>
        <path d={SHIELD} fill="currentColor" mask={`url(#m${uid})`} />
      </>
    );
  } else if (refinement === 'outline') {
    art = (
      <>
        <path className={styles.shield} d={SHIELD} fill="var(--logo-soft)" stroke="var(--logo-line)" strokeWidth={size <= 20 ? 2.8 : 2.3} strokeLinejoin="round" />
        <CheckWrench g={g} ink="var(--logo-line)" classes={classes} />
      </>
    );
  } else if (refinement === 'twotone') {
    art = (
      <>
        <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <circle cx={g.cut.cx} cy={g.cut.cy} r={g.cut.r} fill="#000" />
        </mask>
        <clipPath id={`c${uid}`}><circle cx={g.cut.cx} cy={g.cut.cy} r={g.cut.r} /></clipPath>
        <path className={styles.shield} d={SHIELD} fill={shieldFill} mask={`url(#m${uid})`} />
        {depth && <path className={styles.shield} d={SHIELD} fill={`url(#h${uid})`} mask={`url(#m${uid})`} />}
        <CheckWrench g={g} ink="var(--logo-ink)" headInk="var(--logo-accent)" classes={classes} />
        {/* the handle turns saffron where it leaves the shield, so handle end + head read as one tool */}
        <g clipPath={`url(#c${uid})`} className={classes.wrench} style={{ transformOrigin: g.elbow }}>
          <path d={g.long} stroke="var(--logo-accent)" fill="none" strokeWidth={g.stroke} strokeLinecap="round" />
        </g>
      </>
    );
  } else {
    art = (
      <>
        <path className={styles.shield} d={SHIELD} fill={shieldFill} />
        {depth && <path className={styles.shield} d={SHIELD} fill={`url(#h${uid})`} />}
        <CheckWrench g={g} ink="var(--logo-ink)" classes={classes} />
      </>
    );
  }

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
      {depth && (
        <defs>
          <linearGradient id={`g${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="var(--logo-shield-a)" />
            <stop offset="1" stopColor="var(--logo-shield-b)" />
          </linearGradient>
          <linearGradient id={`h${uid}`} x1="0" y1="0" x2="0.6" y2="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {animated && <path className={styles.outline} d={SHIELD} pathLength="1" fill="none" />}
      {art}
    </svg>
  );
}

// variant "full": mark + wordmark (the second word hides on very small screens).
// variant "mark": the mark only (needs a title for screen readers).
// compact: on very small screens only the mark is shown (the header).
export default function Logo({ size = 32, variant = 'full', tone = 'light', animated = false, refinement, compact = false, hero = false }) {
  const { t } = useT();
  if (variant === 'mark') return <LogoMark size={size} title={t('app.name')} tone={tone} refinement={refinement} animated={animated} hero={hero} />;
  return (
    <span className={[styles.logo, styles[tone], animated && styles.animatedLogo, compact && styles.compact].filter(Boolean).join(' ')}>
      <LogoMark size={size} tone={tone} refinement={refinement} animated={animated} hero={hero} />
      <span className={styles.wordmark}>
        <span className={styles.primary}>{t('app.nameFirst')}</span>
        <span className={styles.secondary}> {t('app.nameSecond')}</span>
      </span>
    </span>
  );
}

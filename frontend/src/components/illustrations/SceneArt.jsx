// Scene illustrations for empty states, errors, onboarding steps and feature moments (design v3).
// Same style as TradeArt (Art.module.css): 160 x 120 grid, one line weight, five theme colours.
// Decorative by default (the text next to a scene says the same thing).
import styles from './Art.module.css';

const BLOB = 'M80 8c34 0 62 10 66 40s-12 56-50 62-74-2-84-30S40 8 80 8Z';

const SCENES = {
  // two result cards and a magnifier: "nothing found"
  'empty-search': (
    <>
      <rect className="paper" x="26" y="26" width="76" height="30" rx="8" />
      <circle className="soft" cx="42" cy="41" r="8" />
      <path className="faint" d="M58 36h32M58 46h20" />
      <rect className="paper" x="34" y="64" width="76" height="30" rx="8" />
      <circle className="soft" cx="50" cy="79" r="8" />
      <path className="faint" d="M66 74h32M66 84h20" />
      <g className="a-bob">
        <circle className="paper" cx="108" cy="52" r="20" />
        <circle className="accent" cx="108" cy="52" r="11" />
        <path className="ink" d="M123 67l14 14" />
      </g>
    </>
  ),
  // a photo frame with a plus: "add proof"
  'empty-proof': (
    <>
      <rect className="paper" x="30" y="24" width="84" height="64" rx="10" transform="rotate(-4 72 56)" />
      <rect className="soft" x="38" y="32" width="68" height="40" rx="6" transform="rotate(-4 72 56)" />
      <path className="ink" d="M42 68l16-16 12 10 10-8 18 14" transform="rotate(-4 72 56)" />
      <circle className="accent a-spark" cx="92" cy="42" r="5" />
      <g className="a-bob">
        <circle className="primary" cx="118" cy="84" r="16" />
        <path d="M118 76v16M110 84h16" fill="none" stroke="var(--ill-paper)" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </>
  ),
  // a checklist with chips and a pencil: "no skills yet"
  'empty-skills': (
    <>
      <rect className="paper" x="34" y="18" width="78" height="88" rx="10" />
      <rect className="soft" x="46" y="32" width="12" height="12" rx="4" />
      <path className="ink" d="M49 38l3 3 5-6" />
      <path className="faint" d="M66 38h32" />
      <rect className="soft" x="46" y="54" width="12" height="12" rx="4" />
      <path className="faint" d="M66 60h24" />
      <rect className="accent" x="46" y="78" width="26" height="12" rx="6" />
      <rect className="soft" x="78" y="78" width="22" height="12" rx="6" />
      <g className="a-swing">
        <path className="primary" d="M120 30l12 6-22 42-12-6Z" />
        <path className="paper" d="M98 72l12 6-10 8Z" />
      </g>
    </>
  ),
  // a tray with a check: "all caught up"
  'all-done': (
    <>
      <path className="paper" d="M30 62l12-30h76l12 30v26a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8Z" />
      <path className="soft" d="M30 62h28a6 6 0 0 1 6 6 6 6 0 0 0 6 6h20a6 6 0 0 0 6-6 6 6 0 0 1 6-6h28v26a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8Z" />
      <g className="a-bob">
        <circle className="primary" cx="80" cy="34" r="17" />
        <path d="M72 34l6 6 11-12" fill="none" stroke="var(--ill-paper)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="a-spark accent-line"><path d="M116 18v8M112 22h8M44 20v6M41 23h6" /></g>
    </>
  ),
  // a sleeping bell: "no notifications"
  'no-notifications': (
    <>
      <g className="a-swing">
        <path className="paper" d="M80 28c-15 0-25 11-25 26v14l-8 12h66l-8-12V54c0-15-10-26-25-26Z" />
        <path className="soft" d="M47 80h66l-4-6H51Z" />
        <path className="ink" d="M80 28v-7" />
      </g>
      <path className="accent" d="M71 86a9 9 0 0 0 18 0Z" />
      <g className="a-spark accent-line"><path d="M112 30h10l-10 12h10M126 16h7l-7 8h7" /></g>
    </>
  ),
  // an unplugged cable: "page not found"
  'not-found': (
    <>
      <path className="faint" d="M10 84c18 0 22-22 40-22" />
      <g className="a-slide">
        <rect className="primary" x="48" y="50" width="24" height="24" rx="6" />
        <path className="ink" d="M72 57h9M72 67h9" />
      </g>
      <rect className="paper" x="98" y="44" width="26" height="36" rx="7" />
      <circle className="dot" cx="111" cy="56" r="2.5" />
      <circle className="dot" cx="111" cy="68" r="2.5" />
      <path className="faint" d="M124 62c14 0 12 22 28 22" />
      <g className="a-spark accent-line"><path d="M86 40l-3-8M92 38l1-9M80 44l-7-5" /></g>
    </>
  ),
  // a cone and a warning sign: "something went wrong"
  crash: (
    <>
      <path className="accent" d="M52 34l22 56H30Z" />
      <path className="paper" d="M44 54h16l5 13H39Z" />
      <rect className="soft" x="22" y="90" width="60" height="9" rx="4.5" />
      <g className="a-bob">
        <path className="paper" d="M112 30l26 44H86Z" />
        <path className="ink" d="M112 46v14" />
        <circle className="dot" cx="112" cy="66" r="2.5" />
      </g>
    </>
  ),
  // a cloud with a slash: "you are offline"
  offline: (
    <>
      <path className="paper" d="M54 88a20 20 0 0 1-3-39.8A28 28 0 0 1 105 44a22 22 0 0 1 3 44Z" />
      <path className="faint" d="M62 70a26 26 0 0 1 36 0M70 79a14 14 0 0 1 20 0" />
      <path className="accent-line" d="M44 100l76-76" strokeWidth="5" />
      <circle className="dot" cx="80" cy="88" r="3" />
    </>
  ),
  // onboarding 1: an identity card with a lock (private details stay private)
  'step-about': (
    <>
      <rect className="paper" x="24" y="28" width="92" height="62" rx="10" />
      <circle className="soft" cx="50" cy="54" r="12" />
      <path className="ink" d="M45 56a5 5 0 0 1 10 0M50 49.5v.1" />
      <path className="faint" d="M72 46h32M72 56h22M36 76h60" />
      <g className="a-bob">
        <rect className="primary" x="104" y="68" width="32" height="26" rx="7" />
        <path className="ink" d="M112 68v-6a8 8 0 0 1 16 0v6" />
        <circle cx="120" cy="81" r="3" fill="var(--ill-paper)" />
      </g>
    </>
  ),
  // onboarding 2: a tool bag with a rate tag
  'step-work': (
    <>
      <path className="ink" d="M62 44v-8a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v8" />
      <rect className="primary" x="32" y="44" width="96" height="50" rx="10" />
      <path className="ink" d="M32 62h96" />
      <rect className="paper" x="72" y="55" width="16" height="14" rx="4" />
      <g className="a-swing">
        <path className="accent" d="M112 20h22a4 4 0 0 1 4 4v18l-15 10-15-10V24a4 4 0 0 1 4-4Z" />
        <path className="ink" d="M117 30h12M117 37h8" />
      </g>
    </>
  ),
  // onboarding 3: a sentence becomes skill chips
  'step-skills': (
    <>
      <path className="paper" d="M22 24h74a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H50l-14 12V66h-14a8 8 0 0 1-8-8V32a8 8 0 0 1 8-8Z" />
      <path className="faint" d="M26 38h40M26 50h58" />
      <path className="accent-line" d="M70 38h22" strokeWidth="5" />
      <path className="ink a-slide" d="M100 78h14M108 72l6 6-6 6" />
      <g className="a-bob">
        <rect className="primary" x="60" y="88" width="34" height="14" rx="7" />
        <rect className="soft" x="100" y="88" width="42" height="14" rx="7" />
        <rect className="accent" x="118" y="66" width="30" height="14" rx="7" />
      </g>
    </>
  ),
  // onboarding 4: a camera and a certificate
  'step-proof': (
    <>
      <rect className="paper" x="76" y="20" width="60" height="76" rx="8" transform="rotate(6 106 58)" />
      <path className="faint" d="M88 40h36M88 52h36M88 64h20" transform="rotate(6 106 58)" />
      <circle className="accent a-spark" cx="118" cy="80" r="8" transform="rotate(6 106 58)" />
      <g className="a-bob">
        <path className="primary" d="M24 54a8 8 0 0 1 8-8h8l5-8h20l5 8h8a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8Z" />
        <circle className="paper" cx="55" cy="70" r="13" />
        <circle className="soft" cx="55" cy="70" r="6" />
      </g>
    </>
  ),
  // onboarding 5: a rosette with a check and confetti
  'step-done': (
    <>
      <path className="soft" d="M66 74l-10 34 16-8 8 14 8-14 16 8-10-34Z" />
      <g className="a-spin">
        <path className="primary" d="M80 14l9 7 11-2 4 11 10 5-3 11 6 10-9 7-1 11-11 1-8 9-8-9-11-1-1-11-9-7 6-10-3-11 10-5 4-11 11 2Z" />
      </g>
      <circle className="paper" cx="80" cy="50" r="19" />
      <path className="ink" d="M71 50l6 6 12-13" strokeWidth="3.5" />
      <g className="a-spark accent-line"><path d="M28 30l6 4M24 60h8M132 30l-6 4M136 60h-8M34 90l5-5M126 90l-5-5" /></g>
    </>
  ),
  // saved workers: a card with a heart
  saved: (
    <>
      <rect className="paper" x="30" y="30" width="84" height="64" rx="10" />
      <circle className="soft" cx="52" cy="54" r="11" />
      <path className="faint" d="M70 48h32M70 60h20M42 80h56" />
      <g className="a-bob">
        <path className="accent" d="M118 34c-6-8-19-4-19 6 0 9 10 15 19 22 9-7 19-13 19-22 0-10-13-14-19-6Z" />
      </g>
    </>
  ),
  // compare: two cards and a balance of ticks
  compare: (
    <>
      <rect className="paper" x="20" y="26" width="54" height="72" rx="9" />
      <circle className="soft" cx="47" cy="46" r="9" />
      <path className="faint" d="M32 66h30M32 78h20" />
      <rect className="paper a-bob" x="86" y="22" width="54" height="72" rx="9" />
      <circle className="accent" cx="113" cy="42" r="9" />
      <path className="faint" d="M98 62h30M98 74h20" />
      <path className="primary-line" d="M36 88l5 5 9-10M102 84l5 5 9-10" strokeWidth="3.5" />
    </>
  ),
};

export default function SceneArt({ name, size = 160, tone = 'light', float = false, play = false, title, className }) {
  const scene = SCENES[name];
  if (!scene) return null;
  return (
    <svg
      className={[styles.art, tone === 'dark' && styles.dark, float && styles.float, play && styles.play, className].filter(Boolean).join(' ')}
      data-scene={name}
      width={size}
      height={(size * 3) / 4}
      viewBox="0 0 160 120"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path className="blob" d={BLOB} />
      <ellipse className="ground" cx="80" cy="110" rx="46" ry="4" />
      {scene}
    </svg>
  );
}

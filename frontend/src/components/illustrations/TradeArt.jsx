// One spot illustration per trade category (design v3, Batch 4). Same grid (96 x 96), line weight
// and five theme colours for all of them (see Art.module.css). Decorative by default: the trade's
// name is always written next to the drawing, so the SVG is hidden from screen readers.
import styles from './Art.module.css';

const BLOB = 'M48 7c20 0 37 10 39 31s-5 42-27 48-45 0-52-22S28 7 48 7Z';

const DRAWINGS = {
  // bulb with a bolt, rays around
  electrical_solar: (
    <>
      <g className="a-spark accent-line"><path d="M19 31l-6-3M16 46h-7M77 31l6-3M80 46h7M48 12V6" /></g>
      <g className="a-bob">
        <path className="paper" d="M48 19a19 19 0 0 0-11.5 34.1c2.5 1.9 3.5 4 3.5 6.4V62h16v-2.5c0-2.4 1-4.5 3.5-6.4A19 19 0 0 0 48 19Z" />
        <path className="soft" d="M40 62h16v9a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4Z" />
        <path className="ink" d="M40 68h16" />
        <path className="accent" d="M50.5 28l-9 14h7.5l-2.5 11 9.5-15h-7.5Z" />
      </g>
    </>
  ),
  // tap with a falling drop
  plumbing_sanitary: (
    <>
      <rect className="soft" x="11" y="25" width="8" height="24" rx="3" />
      <path className="primary" d="M19 31h31a17 17 0 0 1 17 17v6H57v-6a7 7 0 0 0-7-7H19Z" />
      <rect className="paper" x="54" y="54" width="16" height="6" rx="2.5" />
      <path className="ink" d="M36 31v-9" />
      <rect className="accent a-swing" x="26" y="16" width="20" height="7" rx="3.5" />
      <path className="soft a-drop" d="M62 66c3 3.8 5 6.4 5 9a5 5 0 0 1-10 0c0-2.6 2-5.2 5-9Z" />
    </>
  ),
  // brick wall and a trowel
  construction_masonry: (
    <>
      <g className="paper">
        <rect x="18" y="50" width="20" height="10" rx="2" />
        <rect x="62" y="50" width="16" height="10" rx="2" />
        <rect x="18" y="60" width="12" height="10" rx="2" />
        <rect x="52" y="60" width="26" height="10" rx="2" />
        <rect x="18" y="70" width="20" height="10" rx="2" />
        <rect x="62" y="70" width="16" height="10" rx="2" />
      </g>
      <rect className="accent" x="38" y="50" width="24" height="10" rx="2" />
      <rect className="soft" x="30" y="60" width="22" height="10" rx="2" />
      <rect className="soft" x="38" y="70" width="24" height="10" rx="2" />
      <g className="a-swing">
        <path className="paper" d="M44 22l24 6-13 16Z" />
        <path className="ink" d="M44 22l-7-5" />
        <path className="primary" d="M38.5 18.5l-8-6.5a3.5 3.5 0 0 0-4.5 5.4l8 6.5Z" />
      </g>
    </>
  ),
  // hand saw over a plank
  carpentry_woodwork: (
    <>
      <rect className="accent" x="14" y="62" width="68" height="14" rx="4" />
      <path className="ink" d="M24 69h12M44 69h7M60 69h13" />
      <g className="a-slide">
        <path className="paper" d="M38 30h44v7l-2.2 3.2-3.8-1.5-2.2 3.2-3.8-1.5-2.2 3.2-3.8-1.5-2.2 3.2-3.8-1.5-2.2 3.2-3.8-1.5-2.2 3.2-3.8-1.5-2.2 3.2L38 50Z" />
        <path className="primary" d="M38 27c-11-4-23 3-23 14.5S27 60 38 55Z" />
        <circle className="paper" cx="28" cy="41" r="4.5" />
      </g>
    </>
  ),
  // paint roller with a fresh stripe and a drip
  painting_renovation: (
    <>
      <path className="accent" d="M12 24h30v18H18a6 6 0 0 1-6-6Z" />
      <path className="accent a-drop" d="M22 46c2.2 3 3.5 5 3.5 7a3.5 3.5 0 0 1-7 0c0-2 1.3-4 3.5-7Z" />
      <g className="a-slide">
        <rect className="primary" x="30" y="22" width="46" height="18" rx="7" />
        <path className="ink" d="M76 31h8v17H52v8" />
        <rect className="paper" x="46" y="56" width="12" height="26" rx="5" />
      </g>
    </>
  ),
  // split AC unit with cool air
  ac_appliance_repair: (
    <>
      <rect className="paper" x="14" y="22" width="68" height="28" rx="8" />
      <path className="soft" d="M22 40h52v4a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3Z" />
      <path className="ink" d="M24 31h22" />
      <circle className="accent" cx="71" cy="31" r="3" />
      <g className="a-wave primary-line">
        <path d="M30 58c0 4-4 4-4 8s4 4 4 8" />
        <path d="M48 58c0 4-4 4-4 8s4 4 4 8" />
        <path d="M66 58c0 4-4 4-4 8s4 4 4 8" />
      </g>
      <path className="accent-line a-spark" d="M80 62v10M75 67h10M76.5 63.5l7 7M83.5 63.5l-7 7" />
    </>
  ),
  // toolbox with a screwdriver and a wrench
  home_maintenance: (
    <>
      <g className="a-bob">
        <path className="ink" d="M30 46V27" />
        <path className="paper" d="M25.5 27a4.5 4.5 0 1 1 9 0v3h-9Z" />
        <path className="ink" d="M66 46V30" />
        <rect className="accent" x="61" y="14" width="10" height="17" rx="4" />
      </g>
      <path className="ink" d="M37 46v-5a6 6 0 0 1 6-6h10a6 6 0 0 1 6 6v5" />
      <rect className="primary" x="16" y="46" width="64" height="32" rx="6" />
      <path className="ink" d="M16 58h64" />
      <rect className="paper" x="42" y="53" width="12" height="10" rx="3" />
    </>
  ),
  // bucket, broom and sparkles
  domestic_work: (
    <>
      <g className="a-swing">
        <path className="ink" d="M72 14l-7 44" />
        <path className="accent" d="M56 58h19l5 21H52Z" />
        <path className="ink" d="M60 66l-1.5 12M67 66v12M73.5 66l2 12" />
      </g>
      <path className="ink" d="M18 50a15 13 0 0 1 30 0" />
      <path className="primary" d="M16 50h34l-4 28a3 3 0 0 1-3 2.5H23a3 3 0 0 1-3-2.5Z" />
      <path className="ink" d="M19 58h28" />
      <g className="a-spark accent-line"><path d="M30 22v10M25 27h10M44 30v6M41 33h6" /></g>
    </>
  ),
  // small truck with a parcel
  moving_loading: (
    <>
      <path className="faint a-slide" d="M3 44h8M1 54h10" />
      <g className="a-slide">
        <rect className="paper" x="14" y="30" width="40" height="36" rx="5" />
        <rect className="accent" x="24" y="42" width="20" height="16" rx="3" />
        <path className="ink" d="M34 42v6" />
        <path className="primary" d="M54 40h13l13 12v14H54Z" />
        <path className="paper" d="M59 45h6.5l7.5 7H59Z" />
        <circle className="soft" cx="30" cy="68" r="7.5" />
        <circle className="dot" cx="30" cy="68" r="2.5" />
        <circle className="soft" cx="66" cy="68" r="7.5" />
        <circle className="dot" cx="66" cy="68" r="2.5" />
      </g>
    </>
  ),
};

// category: a taxonomy category id. Unknown ids (a future category) get the toolbox.
export default function TradeArt({ category, size = 72, tone = 'light', title, className }) {
  const drawing = DRAWINGS[category] ?? DRAWINGS.home_maintenance;
  return (
    <svg
      className={[styles.art, tone === 'dark' && styles.dark, className].filter(Boolean).join(' ')}
      data-art={DRAWINGS[category] ? category : 'home_maintenance'}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path className="blob" d={BLOB} />
      <ellipse className="ground" cx="48" cy="86" rx="27" ry="3.5" />
      {drawing}
    </svg>
  );
}

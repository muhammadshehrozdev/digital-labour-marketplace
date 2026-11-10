// The check-wrench strokes of the logo (see logoGeometry.js for the numbers).
// `classes` lets the animated logo address the parts.
export function CheckWrench({ g, ink, headInk, classes = {} }) {
  const common = { fill: 'none', strokeWidth: g.stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <>
      <g className={classes.wrench} style={{ transformOrigin: g.elbow }}>
        <path d={g.long} stroke={ink} {...common} />
        <path d={g.head} stroke={headInk ?? ink} {...common} />
      </g>
      <path className={classes.check} d={g.short} stroke={ink} pathLength="1" {...common} />
    </>
  );
}

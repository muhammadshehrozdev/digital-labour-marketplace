// Small pure helpers for the charts (unit tested).

// A "nice" top of the y axis and its tick values for whole-number counts: 0..4 ticks.
export function niceScale(maxValue) {
  if (!(maxValue > 0)) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const steps = [1, 2, 5];
  let magnitude = 1;
  for (;;) {
    for (const step of steps) {
      const size = step * magnitude;
      if (size * 4 >= maxValue) {
        const count = Math.max(1, Math.ceil(maxValue / size));
        return { max: size * count, ticks: Array.from({ length: count + 1 }, (_, i) => i * size) };
      }
    }
    magnitude *= 10;
  }
}

// Which x labels to print so they never collide: at most `maxLabels`, always the first and last.
export function labelIndexes(length, maxLabels = 6) {
  if (length <= maxLabels) return Array.from({ length }, (_, i) => i);
  const every = Math.ceil((length - 1) / (maxLabels - 1));
  const picked = [];
  for (let i = 0; i < length - 1; i += every) picked.push(i);
  if (length - 1 - picked[picked.length - 1] < every / 2) picked.pop(); // too close to the last one
  picked.push(length - 1);
  return picked;
}

// A column segment: rounded on its data end (the top), square at the bottom.
export function columnPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height);
  if (height <= 0) return '';
  return `M${x} ${y + height}V${y + r}a${r} ${r} 0 0 1 ${r}-${r}h${width - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}V${y + height}Z`;
}

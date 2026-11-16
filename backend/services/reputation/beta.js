// The Beta numbers shared by the reputation and reliability engines (Module 4). PURE: no database,
// no clock, no randomness.
//
// From positive evidence r and negative evidence s, with prior weight W and base rate a
// (Josang & Ismail 2002, "The Beta Reputation System", written in subjective-logic form):
//   belief = r / (r + s + W)   disbelief = s / (r + s + W)   uncertainty = W / (r + s + W)
//   expected = belief + a * uncertainty   (= (r + 1) / (r + s + 2) when W = 2 and a = 0.5)
// sd is the standard deviation of Beta(alpha = r + W*a, beta = s + W*(1 - a)).
// cautious = max(0, expected - z * sd): a normal approximation of the lower 10% point when z = 1.2816.

export const DAY_MS = 24 * 60 * 60 * 1000;

export function betaNumbers(r, s, { priorWeight: W, baseRate: a, cautiousZ: z }) {
  if (!(r >= 0) || !(s >= 0) || !(W > 0)) throw new Error('r and s must be >= 0 and the prior weight > 0');
  const total = r + s + W;
  const belief = r / total;
  const disbelief = s / total;
  const uncertainty = W / total;
  const expected = belief + a * uncertainty;
  const alpha = r + W * a;
  const beta = s + W * (1 - a);
  const sd = Math.sqrt((alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1)));
  const cautious = Math.max(0, expected - z * sd);
  return { r, s, belief, disbelief, uncertainty, expected, sd, cautious };
}

// none (no items at all) / few / some / many, from the uncertainty.
export function depthFrom(uncertainty, hasItems, { few, many }) {
  if (!hasItems) return 'none';
  if (uncertainty > few) return 'few';
  if (uncertainty <= many) return 'many';
  return 'some';
}

// The forgetting factor: 1 today, 0.5 after one half-life, 0.25 after two.
export function recencyWeight(ageDays, halfLifeDays) {
  return 0.5 ** (Math.max(0, ageDays) / halfLifeDays);
}

// Age in days of a date at the moment `now` (never negative: a date in the future counts as today).
export function ageInDays(date, now) {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) throw new Error('a date is missing or not valid');
  return Math.max(0, (now.getTime() - t) / DAY_MS);
}

export function requireNow(now) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new Error('pass `now` as a valid Date (the engines never read the clock)');
  return now;
}

// Metrics of the Module 5 simulation (Batch 7, §8.4). PURE, unit-tested with small hand-worked lists.
//   availability  the share of markets where a method gives a number
//   error         the MEDIAN, over markets with a number, of |value - m| / m
//   coverage      the share of the held-aside genuine prices inside [low, high] (mean over markets with a
//                 number); about 0.5 by design for the middle half: a sanity check, not a target
//   attackShift   for attacked markets with a number both with and without the attack, the mean of
//                 |value with attack - value without attack| / m (same seed, same genuine jobs)
// Across seeds: mean, sd, 2.5th and 97.5th percentiles, and a seed-by-seed paired comparison. These two are
// IMPORTED from the Module 4 harness (evaluation/reputation/metrics.js), not copied.
import { mean, pairedComparison, percentile, summarize } from '../reputation/metrics.js';

export { pairedComparison, summarize };

export function availability(results) {
  if (results.length === 0) return null;
  return results.filter((r) => r !== null).length / results.length;
}

// results[i] and truths[i] belong to the same market
export function medianError(results, truths) {
  const errors = results.map((r, i) => (r === null ? null : Math.abs(r.value - truths[i]) / truths[i])).filter((e) => e !== null);
  return errors.length ? percentile(errors, 0.5) : null;
}

export function coverageOf(holdout, low, high) {
  if (holdout.length === 0) return null;
  return holdout.filter((x) => x >= low && x <= high).length / holdout.length;
}

export function coverage(results, holdouts) {
  const shares = results.map((r, i) => (r === null ? null : coverageOf(holdouts[i], r.low, r.high))).filter((s) => s !== null);
  return shares.length ? mean(shares) : null;
}

// withAttack[i], withoutAttack[i], truths[i] for the ATTACKED markets only
export function attackShift(withAttack, withoutAttack, truths) {
  const shifts = withAttack
    .map((r, i) => (r === null || withoutAttack[i] === null ? null : Math.abs(r.value - withoutAttack[i].value) / truths[i]))
    .filter((s) => s !== null);
  return shifts.length ? mean(shifts) : null;
}

// attacked markets where the attack made a number appear (none without it) or disappear
export function availabilityFlips(withAttack, withoutAttack) {
  let appeared = 0;
  let vanished = 0;
  withAttack.forEach((r, i) => {
    if (r !== null && withoutAttack[i] === null) appeared += 1;
    if (r === null && withoutAttack[i] !== null) vanished += 1;
  });
  return { appeared, vanished };
}

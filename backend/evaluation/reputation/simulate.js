// The Module 4 simulator: a synthetic world of workers, their hidden true quality and their reviews.
// Deterministic: the same seed and scenario always give the same world. Separate random streams are
// used for the genuine data, the attacks, the quality change and the tie-breaks, so that a scenario
// with an attack has EXACTLY the same genuine reviews as the base world of the same seed
// (that is what makes the paired comparison and the attack lift fair).
import { createRng } from './rng.js';
import { SIMULATION as S, SIM_NOW, DAY_MS } from './config.js';

const clip = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const starsFrom = (quality, leniency, noise) => clip(Math.round(1 + 4 * clip(quality + leniency + noise, 0, 1)), 1, 5);
const dateDaysAgo = (days) => new Date(SIM_NOW.getTime() - days * DAY_MS);

// Choose `count` distinct items from `list` with the given generator.
const choose = (rng, list, count) => rng.shuffle(list).slice(0, Math.max(0, Math.min(list.length, count)));

/**
 * Returns { workers, tieBreak } where each worker is
 *   { id, quality (the ground truth now), oldQuality, changed, reviews: [...], attacked, hadGenuineReviews }
 * and each review is the engine's input plus { kind: 'genuine' | 'sybil' | 'collusion' }.
 */
export function simulateWorld({ seed, scenario = {}, workers: count = S.workers, settings = S }) {
  const genuine = createRng(seed);
  const attack = createRng((seed * 2654435761) >>> 0);
  const change = createRng((seed ^ 0x5bd1e995) >>> 0);
  const ties = createRng((seed + 0x9e3779b9) >>> 0);
  const leniency = scenario.leniency ?? 0;

  // 1. workers and their true quality (same draws in every scenario)
  const workers = Array.from({ length: count }, (_, i) => {
    const quality = genuine.beta(settings.qualityAlpha, settings.qualityBeta);
    const hasReviews = genuine.next() >= settings.shareWithoutReviews;
    const n = hasReviews ? Math.min(settings.reviewsCap, 1 + genuine.geometric(settings.reviewsMean - 1)) : 0;
    // per review: age, noise, reviewer history, completion method (drawn in this fixed order)
    const draws = Array.from({ length: n }, () => ({
      ageDays: genuine.next() * settings.maxAgeDays,
      noise: genuine.normal(0, settings.noiseSd),
      otherWorkers: genuine.geometric(settings.reviewerOtherWorkersMean),
      auto: genuine.next() < settings.shareAuto,
    }));
    return { id: `w${i}`, oldQuality: quality, quality, changed: false, draws, reviews: [], attacked: false };
  });

  // 2. quality change: some workers got worse `daysAgo` days ago (their own stream)
  if (scenario.qualityChange) {
    const { share, drop } = scenario.qualityChange;
    for (const w of choose(change, workers, Math.round(share * count))) {
      w.changed = true;
      w.quality = Math.max(0, w.oldQuality - drop);
    }
  }

  // 3. genuine reviews: an older review reflects the quality at that time
  const changeDay = scenario.qualityChange?.daysAgo ?? Infinity;
  for (const w of workers) {
    w.reviews = w.draws.map((d, j) => ({
      id: `${w.id}-g${j}`,
      customerId: `${w.id}-c${j}`, // every genuine review comes from a different customer
      stars: starsFrom(d.ageDays > changeDay ? w.oldQuality : w.quality, leniency, d.noise),
      createdAt: dateDaysAgo(d.ageDays),
      completionMethod: d.auto ? 'auto' : 'both',
      reviewerOtherWorkers: d.otherWorkers,
      hidden: false,
      kind: 'genuine',
    }));
    w.hadGenuineReviews = w.reviews.length > 0;
    delete w.draws;
  }

  // 4. Sybil attack: fake 5 star reviews for some workers from the lower half of quality
  if (scenario.sybil) {
    const { share, fromLowerHalf, k, smart } = scenario.sybil;
    const sorted = [...workers].sort((a, b) => a.quality - b.quality);
    const pool = fromLowerHalf ? sorted.slice(0, Math.floor(count / 2)) : workers;
    for (const w of choose(attack, pool, Math.round(share * count))) {
      w.attacked = true;
      for (let j = 0; j < k; j += 1) {
        w.reviews.push({
          id: `${w.id}-s${j}`,
          customerId: `${w.id}-fake${j}`, // a fresh account for every fake review
          stars: 5,
          createdAt: dateDaysAgo(attack.next() * settings.fakeMaxAgeDays),
          completionMethod: 'both', // the attacker confirms both sides himself
          reviewerOtherWorkers: smart ? attack.int(1, 3) : 0,
          hidden: false,
          kind: 'sybil',
        });
      }
    }
  }

  // 5. pair collusion: one repeat customer gives several extra 5 star reviews
  if (scenario.collusion) {
    const { share, extra } = scenario.collusion;
    for (const w of choose(attack, workers, Math.round(share * count))) {
      w.attacked = true;
      const friendHistory = attack.geometric(settings.reviewerOtherWorkersMean); // a real account with real jobs
      for (let j = 0; j < extra; j += 1) {
        w.reviews.push({
          id: `${w.id}-p${j}`,
          customerId: `${w.id}-friend`,
          stars: 5,
          createdAt: dateDaysAgo(attack.next() * settings.collusionMaxAgeDays),
          completionMethod: 'both',
          reviewerOtherWorkers: friendHistory,
          hidden: false,
          kind: 'collusion',
        });
      }
    }
  }

  // one random tie-break key per worker, the same for every method of this run
  const tieBreak = new Map(workers.map((w) => [w.id, ties.next()]));
  return { workers, tieBreak };
}

// The same world without the attack reviews (for the attack lift).
export const withoutAttacks = (workers) => workers.map((w) => ({ ...w, reviews: w.reviews.filter((r) => r.kind === 'genuine') }));

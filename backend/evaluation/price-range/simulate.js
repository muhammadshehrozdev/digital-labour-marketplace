// The simulated markets of the Module 5 price-range evaluation (Batch 7, §8.1). Seeded: the same seed always
// gives the same markets (rng.js from the Module 4 harness; no Math.random).
//
// Each market is one skill in one city, unit `job`, with a hidden true typical price m ~ Uniform(1000, 6000).
// A genuine price is round(m x exp(e)), e ~ Normal(0, sigma). Jobs per market ~ geometric(mean); workers
// 2..10, each job's worker chosen at random; customers mostly new, `repeatPairShare` of jobs repeat an earlier
// pair. `autoShare` of jobs are completed `auto`, `proposedOnlyShare` have only a proposed price (agreed = null,
// `price` = the proposed amount, which only the naive baselines read). The attack jobs of a scenario are
// generated from a SEPARATE random stream and kept apart (`attackJobs`), so "with attack" and "without
// attack" share exactly the same genuine jobs.
import { createRng } from '../reputation/rng.js';
import { DAY_MS, SIM_NOW, SIMULATION } from './config.js';

// a stable sub-seed for market k (and for its attack stream)
const subSeed = (seed, k, salt = 0) => ((seed * 1000003) ^ (k * 7919) ^ (salt * 104729)) >>> 0;

const genuinePrice = (rng, m, sigma) => Math.max(1, Math.round(m * Math.exp(rng.normal(0, sigma))));
const ago = (rng, maxDays) => new Date(SIM_NOW.getTime() - rng.next() * maxDays * DAY_MS);

function genuineJobs(rng, k, m, meanJobs, settings) {
  const workers = Array.from({ length: rng.int(settings.workersMin, settings.workersMax) }, (_, i) => `m${k}-w${i}`);
  const count = rng.geometric(meanJobs);
  const jobs = [];
  let customers = 0;
  for (let i = 0; i < count; i += 1) {
    let workerId;
    let customerId;
    if (jobs.length > 0 && rng.next() < settings.repeatPairShare) {
      const earlier = rng.pick(jobs);
      ({ workerId, customerId } = earlier);
    } else {
      workerId = rng.pick(workers);
      customers += 1;
      customerId = `m${k}-c${customers}`;
    }
    const price = genuinePrice(rng, m, settings.sigma);
    const auto = rng.next() < settings.autoShare;
    const proposedOnly = rng.next() < settings.proposedOnlyShare;
    jobs.push({
      bookingId: `m${k}-b${i}`, workerId, customerId, skillId: 'sim_skill', category: 'sim', region: null, city: `market-${k}`,
      status: 'completed', completedAt: ago(rng, settings.maxAgeDays), completionMethod: auto ? 'auto' : 'both',
      agreed: proposedOnly ? null : { unit: 'job', amount: price },
      price, // what a naive system would read (it ignores who confirmed what)
    });
  }
  return { jobs, workers };
}

function attackJobs(rng, k, m, workers, attack) {
  const out = [];
  const amount = Math.round(attack.factor * m);
  const workerId = rng.pick(workers);
  for (let i = 0; i < attack.jobs; i += 1) {
    const customerId = attack.type === 'inflator' ? `m${k}-fake${i % attack.fakeCustomers}` : `m${k}-flood`;
    out.push({
      bookingId: `m${k}-a${i}`, workerId, customerId, skillId: 'sim_skill', category: 'sim', region: null, city: `market-${k}`,
      status: 'completed', completedAt: ago(rng, attack.maxAgeDays), completionMethod: 'both', agreed: { unit: 'job', amount }, price: amount, attack: true,
    });
  }
  return out;
}

/** markets: [{ id, city, m, jobs, attackJobs, attacked, holdout }] */
export function simulateMarkets({ seed, scenario, settings = SIMULATION }) {
  const pickAttacked = createRng(subSeed(seed, 0, 99));
  return Array.from({ length: settings.markets }, (_, k) => {
    const rng = createRng(subSeed(seed, k + 1));
    const m = settings.trueMin + rng.next() * (settings.trueMax - settings.trueMin);
    const { jobs, workers } = genuineJobs(rng, k, m, scenario.meanJobs ?? settings.meanJobs, settings);
    const holdout = Array.from({ length: settings.holdout }, () => genuinePrice(rng, m, settings.sigma));
    const attacked = Boolean(scenario.attack) && pickAttacked.next() < scenario.attack.share;
    const extra = attacked ? attackJobs(createRng(subSeed(seed, k + 1, 7)), k, m, workers, scenario.attack) : [];
    return { id: k, city: `market-${k}`, m, jobs, attackJobs: extra, attacked, holdout };
  });
}

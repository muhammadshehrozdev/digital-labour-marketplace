// Seeded random numbers for the Module 4 simulation and the property tests. The same seed always
// gives the same sequence (no Math.random anywhere in the evaluation).
//   mulberry32: a small 32-bit generator (public domain), good enough for simulation, not for security.
//   Box-Muller: two uniform numbers -> one normal number.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A small toolbox around one generator.
export function createRng(seed) {
  const next = mulberry32(seed);
  const rng = {
    next,
    // whole number from min to max (both included)
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    // normal(mean, sd) by Box-Muller (1 - u keeps log away from 0)
    normal: (mean = 0, sd = 1) => {
      const u1 = 1 - next();
      const u2 = next();
      return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
    // Gamma(shape, 1) by Marsaglia and Tsang (shape >= 1), used for Beta draws
    gamma: (shape) => {
      if (shape < 1) return rng.gamma(shape + 1) * next() ** (1 / shape);
      const d = shape - 1 / 3;
      const c = 1 / Math.sqrt(9 * d);
      for (;;) {
        let x;
        let v;
        do {
          x = rng.normal();
          v = 1 + c * x;
        } while (v <= 0);
        v = v * v * v;
        const u = next();
        if (u < 1 - 0.0331 * x ** 4) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
      }
    },
    beta: (a, b) => {
      const x = rng.gamma(a);
      const y = rng.gamma(b);
      return x / (x + y);
    },
    // number of failures before the first success, with the given mean (geometric on 0, 1, 2, ...)
    geometric: (mean) => {
      if (mean <= 0) return 0;
      const p = 1 / (1 + mean);
      return Math.floor(Math.log(1 - next()) / Math.log(1 - p));
    },
    pick: (list) => list[Math.floor(next() * list.length)],
    shuffle: (list) => {
      const out = [...list];
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
  return rng;
}

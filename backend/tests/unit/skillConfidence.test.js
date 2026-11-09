// Module 3 skill confidence (D-014): hand-worked examples, property tests and the status invariant.
import { describe, test, expect } from 'vitest';
import { skillConfidence, opinion, strengthLabel, DEFAULT_WEIGHTS } from '../../services/trust/skillConfidence.js';

const ev = (status, type = 'work_photo') => ({ status, type });
const close = (actual, expected) => expect(actual).toBeCloseTo(expected, 10);

describe('hand-worked examples (W = 2, a = 0.5)', () => {
  test('no evidence -> b 0, d 0, u 1, E 0.5, Self-declared, strength none', () => {
    const c = skillConfidence([]);
    expect([c.r, c.s]).toEqual([0, 0]);
    close(c.belief, 0); close(c.disbelief, 0); close(c.uncertainty, 1); close(c.expected, 0.5);
    expect(c.status).toBe('self_declared');
    expect(c.strength).toBe('none');
  });

  test('one approved certificate (r = 2) -> b 0.5, u 0.5, E 0.75', () => {
    const c = skillConfidence([ev('approved', 'certificate')]);
    close(c.belief, 2 / 4); close(c.uncertainty, 2 / 4); close(c.expected, 0.75);
    expect(c.status).toBe('verified');
    expect(c.strength).toBe('moderate');
  });

  test('one suspected fake (s = 1) -> d 1/3, u 2/3, E 1/3 (0.333...), Disputed', () => {
    const c = skillConfidence([ev('suspected_fake', 'certificate')]);
    close(c.disbelief, 1 / 3); close(c.uncertainty, 2 / 3); close(c.expected, 1 / 3);
    expect(c.status).toBe('disputed');
    expect(c.strength).toBe('weak');
  });

  test('one approved work photo (r = 1) -> E 2/3 (0.667)', () => {
    close(skillConfidence([ev('approved', 'work_photo')]).expected, 2 / 3);
  });

  test('one approved reference letter counts like a work photo (r = 1)', () => {
    close(skillConfidence([ev('approved', 'reference_letter')]).expected, 2 / 3);
  });

  test('one certificate + one suspected fake (r = 2, s = 1) -> E 0.60, Disputed wins over Verified', () => {
    const c = skillConfidence([ev('approved', 'certificate'), ev('suspected_fake')]);
    close(c.belief, 0.4); close(c.disbelief, 0.2); close(c.uncertainty, 0.4); close(c.expected, 0.6);
    expect(c.status).toBe('disputed');
  });

  test('five approved work photos (r = 5) -> E 6/7 (0.857)', () => {
    close(skillConfidence(Array.from({ length: 5 }, () => ev('approved'))).expected, 6 / 7);
  });

  test('pending, rejected and revoked items count nothing; pending gives "Evidence pending"', () => {
    const c = skillConfidence([ev('pending', 'certificate'), ev('rejected', 'certificate'), ev('revoked', 'certificate')]);
    expect([c.r, c.s]).toEqual([0, 0]);
    close(c.expected, 0.5);
    expect(c.status).toBe('evidence_pending');
    expect(c.counts).toMatchObject({ pending: 1, rejected: 1, revoked: 1, approved: 0 });
  });

  test('E with W = 2, a = 0.5 equals the Beta expectation (r+1)/(r+s+2)', () => {
    for (const [r, s] of [[0, 0], [1, 0], [2, 1], [5, 3], [0.5, 2]]) close(opinion(r, s).expected, (r + 1) / (r + s + 2));
  });

  test('b + d + u = 1 always', () => {
    for (const [r, s] of [[0, 0], [3, 1], [10, 7]]) {
      const o = opinion(r, s);
      close(o.belief + o.disbelief + o.uncertainty, 1);
    }
  });

  test('strength thresholds: certificate + work photo (0.8) strong; 2 work photos (0.75) moderate; cert + fake (0.6) weak', () => {
    expect(skillConfidence([ev('approved', 'certificate'), ev('approved', 'work_photo')]).strength).toBe('strong');
    expect(skillConfidence([ev('approved'), ev('approved')]).strength).toBe('moderate');
    expect(strengthLabel({ r: 2, s: 1, expected: 0.6 })).toBe('weak');
  });

  test('sensitivity options: fake cost by type, and a cap on work photos', () => {
    // A fake certificate costs 2 instead of 1: r = 2, s = 2 -> E = 3/6 = 0.5
    close(skillConfidence([ev('approved', 'certificate'), ev('suspected_fake', 'certificate')], { fakeCostByType: true }).expected, 0.5);
    // At most 2 work photos counted: 5 photos -> r = 2 -> E = 0.75 (same as one certificate)
    close(skillConfidence(Array.from({ length: 5 }, () => ev('approved')), { maxWorkPhotos: 2 }).expected, 0.75);
    close(skillConfidence([ev('approved', 'certificate')], { weights: { certificate: 3 } }).expected, 4 / 5);
  });
});

// ---- property tests (fixed seed, many random evidence lists) ----
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const STATUSES = ['pending', 'approved', 'rejected', 'suspected_fake', 'revoked'];
const TYPES = ['certificate', 'work_photo', 'reference_letter'];
function randomEvidence(rand, max = 8) {
  const n = Math.floor(rand() * (max + 1));
  return Array.from({ length: n }, () => ev(STATUSES[Math.floor(rand() * 5)], TYPES[Math.floor(rand() * 3)]));
}

describe('properties (500 random evidence lists each, seed 2026)', () => {
  test('adding approved evidence never lowers E', () => {
    const rand = rng(2026);
    for (let i = 0; i < 500; i += 1) {
      const list = randomEvidence(rand);
      const before = skillConfidence(list).expected;
      const after = skillConfidence([...list, ev('approved', TYPES[Math.floor(rand() * 3)])]).expected;
      expect(after).toBeGreaterThanOrEqual(before - 1e-12);
    }
  });

  test('uncertainty always falls as counted evidence grows (approved or suspected fake)', () => {
    const rand = rng(7);
    for (let i = 0; i < 500; i += 1) {
      const list = randomEvidence(rand);
      const before = skillConfidence(list).uncertainty;
      const added = rand() < 0.5 ? ev('approved', TYPES[Math.floor(rand() * 3)]) : ev('suspected_fake');
      expect(skillConfidence([...list, added]).uncertainty).toBeLessThan(before);
    }
  });

  test('self-claims alone never change the score (no evidence -> always E 0.5, u 1)', () => {
    // A skill typed by hand and a skill confirmed from the extractor are both just claims: no evidence items.
    for (const claim of [[], [], []]) {
      const c = skillConfidence(claim);
      expect([c.expected, c.uncertainty, c.status]).toEqual([0.5, 1, 'self_declared']);
    }
  });

  test('invariant: "verified" only with >= 1 approved item and no suspected fake; "disputed" whenever a fake exists', () => {
    const rand = rng(99);
    for (let i = 0; i < 2000; i += 1) {
      const list = randomEvidence(rand, 10);
      const c = skillConfidence(list);
      const approved = list.filter((x) => x.status === 'approved').length;
      const fakes = list.filter((x) => x.status === 'suspected_fake').length;
      if (c.status === 'verified') {
        expect(approved).toBeGreaterThan(0);
        expect(fakes).toBe(0);
      }
      if (fakes > 0) expect(c.status).toBe('disputed');
    }
  });

  test('weights are the documented provisional values', () => {
    expect(DEFAULT_WEIGHTS).toEqual({ certificate: 2, work_photo: 1, reference_letter: 1, suspectedFake: 1 });
  });
});

describe('npm run confidence:sensitivity', () => {
  test('the table covers every mix and variant, and shows the two documented weak points', async () => {
    const { sensitivityTable, MIXES, VARIANTS } = await import('../../scripts/confidenceSensitivity.js');
    const table = sensitivityTable();
    expect(table).toHaveLength(MIXES.length);
    for (const row of table) expect(Object.keys(row)).toHaveLength(VARIANTS.length + 1);
    const byMix = Object.fromEntries(table.map((r) => [r.mix, r]));
    const def = VARIANTS[0][0];
    expect(byMix['1 certificate + 1 fake certificate'][def]).toBe('0.600 D'); // still above 0.5, but Disputed
    expect(byMix['5 work photos'][def]).toBe('0.857 V'); // beats one certificate (0.750)
    expect(byMix['5 work photos']['at most 2 work photos count']).toBe('0.750 V');
  });
});

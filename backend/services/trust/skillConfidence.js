// Skill confidence from evidence (Module 3, decision D-014). PURE FUNCTION: no database.
//
// Method: Beta-style evidence counting written in subjective-logic form
// (Jøsang & Ismail 2002, "The Beta Reputation System",
// https://mn.uio.no/ifi/english/people/aca/josang/publications/ji2002-bled.pdf — the reference
// used in docs/audit/audit-2026-11-06.md; check the formulas against the paper before quoting).
//   r = positive evidence, s = negative evidence, W = prior weight, a = base rate
//   belief b = r/(r+s+W), disbelief d = s/(r+s+W), uncertainty u = W/(r+s+W), expected E = b + a*u
// With W = 2 and a = 0.5, E equals the Beta expectation (r+1)/(r+s+2).
//
// PROVISIONAL weights (design parameters, not facts; see `npm run confidence:sensitivity`):
//   approved certificate r += 2; approved work photo or reference letter r += 1;
//   suspected fake s += 1; pending, rejected and revoked items count 0; the worker's own claim 0.

export const PRIOR_WEIGHT = 2;
export const BASE_RATE = 0.5;
export const DEFAULT_WEIGHTS = Object.freeze({
  certificate: 2,
  work_photo: 1,
  reference_letter: 1,
  suspectedFake: 1, // cost of one suspected fake, whatever its type
});

// Plain-language strength label from E (thresholds are provisional, D-014).
//   no evidence counted (r = 0 and s = 0)  -> "none"     ("No evidence yet")
//   E >= 0.80                              -> "strong"   (e.g. certificate + work photo)
//   0.65 <= E < 0.80                       -> "moderate" (e.g. one certificate, one work photo)
//   E < 0.65                               -> "weak"     (e.g. certificate + suspected fake)
export const STRENGTH_THRESHOLDS = Object.freeze({ strong: 0.8, moderate: 0.65 });

export function strengthLabel({ r, s, expected }) {
  if (r === 0 && s === 0) return 'none';
  if (expected >= STRENGTH_THRESHOLDS.strong) return 'strong';
  if (expected >= STRENGTH_THRESHOLDS.moderate) return 'moderate';
  return 'weak';
}

// The four numbers from r and s.
export function opinion(r, s, { W = PRIOR_WEIGHT, a = BASE_RATE } = {}) {
  if (!(r >= 0) || !(s >= 0) || !(W > 0)) throw new Error('r and s must be >= 0 and W > 0');
  const total = r + s + W;
  const belief = r / total;
  const disbelief = s / total;
  const uncertainty = W / total;
  return { belief, disbelief, uncertainty, expected: belief + a * uncertainty };
}

/**
 * evidence: [{ status, type }] for ONE skill of one worker.
 * options.weights: override DEFAULT_WEIGHTS (sensitivity analysis);
 * options.fakeCostByType: a suspected fake costs its type's weight instead of weights.suspectedFake;
 * options.maxWorkPhotos: count at most this many approved work photos (null = no cap).
 */
export function skillConfidence(evidence = [], options = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };
  const counts = { approved: 0, pending: 0, rejected: 0, suspectedFake: 0, revoked: 0 };
  const approvedByType = { certificate: 0, work_photo: 0, reference_letter: 0 };
  let r = 0;
  let s = 0;
  let workPhotosCounted = 0;

  for (const item of evidence) {
    switch (item.status) {
      case 'approved': {
        counts.approved += 1;
        approvedByType[item.type] = (approvedByType[item.type] ?? 0) + 1;
        if (item.type === 'work_photo' && options.maxWorkPhotos != null) {
          if (workPhotosCounted >= options.maxWorkPhotos) break;
          workPhotosCounted += 1;
        }
        r += weights[item.type] ?? 0;
        break;
      }
      case 'suspected_fake':
        counts.suspectedFake += 1;
        s += options.fakeCostByType ? (weights[item.type] ?? weights.suspectedFake) : weights.suspectedFake;
        break;
      case 'pending':
        counts.pending += 1;
        break;
      case 'rejected':
        counts.rejected += 1;
        break;
      case 'revoked':
        counts.revoked += 1;
        break;
      default:
        break;
    }
  }

  const numbers = opinion(r, s, options);
  // Status rule (Batch 2 Part 1): "Disputed" wins over everything; "Verified by evidence" needs at
  // least one approved item; otherwise "Evidence pending" if something waits; else "Self-declared".
  let status = 'self_declared';
  if (counts.suspectedFake > 0) status = 'disputed';
  else if (counts.approved > 0) status = 'verified';
  else if (counts.pending > 0) status = 'evidence_pending';

  return { r, s, ...numbers, status, strength: strengthLabel({ r, s, ...numbers }), counts, approvedByType };
}

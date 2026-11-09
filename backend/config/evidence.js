// Module 3 settings in one place (decisions D-013, D-014). Values marked "provisional" are design
// parameters to be checked with real data, not facts.

export const EVIDENCE_TYPES = Object.freeze(['certificate', 'work_photo', 'reference_letter']);
export const EVIDENCE_TYPE_LABELS = Object.freeze({
  certificate: 'Certificate photo',
  work_photo: 'Work photo',
  reference_letter: 'Reference letter photo',
});

// Review states (D-015). A worker uploads -> pending. Only an admin changes the state.
export const EVIDENCE_STATUSES = Object.freeze(['pending', 'approved', 'rejected', 'suspected_fake', 'revoked']);
// Reason codes for "reject". Suspected fake and revoke need a written reason instead.
export const REJECT_REASONS = Object.freeze(['unclear', 'not_relevant', 'wrong_skill', 'other']);

// Upload limits (D-013). 4 MB stays below Vercel's 4.5 MB request-body limit.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_INPUT_PIXELS = 50_000_000; // decompression-bomb guard (about 8,660 x 5,770)
export const MAX_SIDE_PX = 2000; // longest side after processing
export const WEBP_QUALITY = 80;
export const MAX_EVIDENCE_PER_SKILL = 5;
export const MAX_EVIDENCE_PER_WORKER = 30;
export const ALLOWED_IMAGE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

// Perceptual hash (dHash, 64 bits): images of another worker within this Hamming distance are
// flagged for the admin (never auto-rejected). PROVISIONAL — to be measured on our own photos;
// perceptual hashes can be fooled on purpose (docs/SECURITY.md).
export const DHASH_SIMILAR_MAX_DISTANCE = 10;

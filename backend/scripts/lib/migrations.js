// Data migrations for Phase 3. They use the current Mongoose connection and the raw
// collection (no hooks). With apply=false they only count what they WOULD change.
// They never print or return a CNIC number.
import WorkerProfile from '../../models/WorkerProfile.js';
import { normalizeCnic, encryptCnic, hashCnic } from '../../services/cnic.js';
import { categoryIdFrom, CATEGORY_IDS, SKILLS } from '../../config/skillTaxonomy.js';

// Old plain-text cnicNumber -> cnicEncrypted + cnicHash (+ cnicOnFile), then remove cnicNumber.
export async function migrateCnic({ apply = false } = {}) {
  const col = WorkerProfile.collection;
  const report = { found: 0, encrypted: 0, emptyRemoved: 0, invalidRemoved: 0, duplicateSkipped: 0, alreadyEncryptedSkipped: 0 };
  const seen = new Map();
  for await (const doc of col.find({ cnicNumber: { $exists: true } }, { projection: { cnicNumber: 1, cnicHash: 1, user: 1 } })) {
    report.found += 1;
    const digits = normalizeCnic(doc.cnicNumber);
    let update;
    if (!doc.cnicNumber || !String(doc.cnicNumber).trim()) {
      report.emptyRemoved += 1;
      update = { $unset: { cnicNumber: '' } };
    } else if (!digits) {
      report.invalidRemoved += 1; // not a real CNIC format; keeping it in plain text helps nobody
      update = { $unset: { cnicNumber: '' } };
    } else if (doc.cnicHash) {
      report.alreadyEncryptedSkipped += 1;
      update = { $unset: { cnicNumber: '' } };
    } else {
      const hash = hashCnic(digits);
      const clash = seen.get(hash) || (await col.findOne({ cnicHash: hash, _id: { $ne: doc._id } }, { projection: { _id: 1 } }));
      if (clash) {
        report.duplicateSkipped += 1; // left unchanged for an admin to resolve by hand
        continue;
      }
      seen.set(hash, doc._id);
      report.encrypted += 1;
      update = {
        $set: { cnicEncrypted: encryptCnic(digits, doc.user), cnicHash: hash, cnicOnFile: true },
        $unset: { cnicNumber: '' },
      };
    }
    if (apply) await col.updateOne({ _id: doc._id }, update);
  }
  return report;
}

// Old category labels ("Electrical & Solar", "None", "Cleaning & Shifting") -> taxonomy ids.
// Unknown values become null (= "not chosen yet"; the worker chooses again in onboarding).
// "Cleaning & Shifting" is counted separately: it becomes Domestic Work (D-012), check by hand.
export async function migrateCategories({ apply = false } = {}) {
  const col = WorkerProfile.collection;
  const report = { checked: 0, converted: 0, cleaningShiftingToDomestic: 0, unknownSetToNull: 0 };
  for await (const doc of col.find({ category: { $exists: true, $nin: [...CATEGORY_IDS, null] } }, { projection: { category: 1 } })) {
    report.checked += 1;
    const id = categoryIdFrom(doc.category);
    if (id && /cleaning/i.test(doc.category)) report.cleaningShiftingToDomestic += 1;
    else if (id) report.converted += 1;
    else report.unknownSetToNull += 1;
    if (apply) await col.updateOne({ _id: doc._id }, { $set: { category: id ?? null } });
  }
  return report;
}

// Old Module 2 data -> ONE skills array of { skillId, name, category, addedVia, custom, addedAt }.
// - old `skills` (strings) and `categorizedSkills` names are matched to taxonomy skills by
//   (a) the legacy profiler's skill names, (b) the taxonomy name; anything else becomes a
//   clearly marked custom skill (custom: true) in the profile's category.
// - removes categorizedSkills, recommendedSkills, toolsAndEquipment, skillStrengthScore,
//   aiSkillSummary, experienceTierBadge; renames lastAiProfiledAt -> lastExtractedAt.
export const LEGACY_SKILL_MAP = Object.freeze({
  'residential & commercial wiring': 'elec_wiring',
  'solar panel & inverter installation': 'elec_solar',
  'ups & battery backup setup': 'elec_ups',
  'db board & circuit breaker fixing': 'elec_db',
  'switchboard, socket & fan installation': 'elec_fittings',
  'generator changeover & ats wiring': 'elec_generator',
  'earthing & electrical safety testing': 'elec_earthing',
  '3-phase industrial load balancing': 'elec_3phase',
  'pprc & upvc pipe fitting': 'plumb_pipe',
  'water leak detection & repair': 'plumb_leak',
  'bathroom & sanitary fixture installation': 'plumb_fixtures',
  'gas & electric geyser installation': 'plumb_geyser',
  'water pump & pressure motor setup': 'plumb_pump',
  'drainage & sewerage line unblocking': 'plumb_drain',
  'custom wardrobe & kitchen cabinets': 'carp_cabinets',
  'door, window & frame fitting': 'carp_doors',
  'smart & mechanical door lock installation': 'carp_locks',
  'furniture repair & restoration': 'carp_furniture',
  'wood polishing & laminate finishing': 'carp_polish',
  'brickwork & structural masonry': 'mason_brick',
  'wall & ceiling plastering': 'mason_plaster',
  'ceramic tile & marble flooring': 'mason_tile',
  'concrete slab & foundation work': 'mason_concrete',
  'roof waterproofing & damp repair': 'mason_waterproof',
  'split & inverter ac installation': 'ac_install',
  'ac gas charging & leak testing': 'ac_gas',
  'ac master service & chemical wash': 'ac_service',
  'refrigerator & deep freezer repair': 'ac_fridge',
  'automatic washing machine repair': 'ac_washing',
  'interior plastic emulsion & distemper': 'paint_interior',
  'exterior weather shield coating': 'paint_exterior',
  'wall putty, base prep & primer': 'paint_putty',
  'decorative texture & wallpaper fixing': 'paint_texture',
});

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function mapLegacySkillName(name, fallbackCategory) {
  const key = String(name).trim().toLowerCase();
  const id = LEGACY_SKILL_MAP[key] ?? SKILLS.find((s) => s.name.toLowerCase() === key)?.id;
  if (id) {
    const s = SKILLS.find((x) => x.id === id);
    return { skillId: s.id, name: s.name, category: s.category, custom: false };
  }
  const slug = slugify(key);
  const category = categoryIdFrom(fallbackCategory);
  if (!slug || !category) return null; // cannot be kept meaningfully (reported, not saved)
  return { skillId: `custom-${slug}`, name: String(name).trim().slice(0, 60), category, custom: true };
}

const OLD_FIELDS = ['categorizedSkills', 'recommendedSkills', 'toolsAndEquipment', 'skillStrengthScore', 'aiSkillSummary', 'experienceTierBadge'];

export async function migrateSkills({ apply = false } = {}) {
  const col = WorkerProfile.collection;
  const report = { checked: 0, profilesChanged: 0, mappedToTaxonomy: 0, keptAsCustom: 0, dropped: 0 };
  const oldShape = {
    $or: [
      { 'skills.0': { $type: 'string' } },
      ...OLD_FIELDS.map((f) => ({ [f]: { $exists: true } })),
      { lastAiProfiledAt: { $exists: true } },
    ],
  };
  for await (const doc of col.find(oldShape)) {
    report.checked += 1;
    const names = [
      ...(doc.skills || []).filter((x) => typeof x === 'string'),
      ...(doc.categorizedSkills || []).map((c) => c.skillName).filter(Boolean),
    ];
    const kept = (doc.skills || []).filter((x) => x && typeof x === 'object' && x.skillId);
    const seen = new Set(kept.map((x) => x.skillId));
    for (const name of names) {
      const fromCat = (doc.categorizedSkills || []).find((c) => c.skillName === name)?.category;
      const mapped = mapLegacySkillName(name, fromCat ?? doc.category);
      if (!mapped) {
        report.dropped += 1;
        continue;
      }
      if (seen.has(mapped.skillId)) continue;
      seen.add(mapped.skillId);
      if (mapped.custom) report.keptAsCustom += 1;
      else report.mappedToTaxonomy += 1;
      kept.push({ ...mapped, addedVia: 'manual', addedAt: doc.updatedAt ?? new Date() });
    }
    const update = { $set: { skills: kept }, $unset: Object.fromEntries(OLD_FIELDS.map((f) => [f, ''])) };
    if (doc.lastAiProfiledAt !== undefined) {
      update.$set.lastExtractedAt = doc.lastAiProfiledAt ?? null;
      update.$unset.lastAiProfiledAt = '';
    }
    report.profilesChanged += 1;
    if (apply) await col.updateOne({ _id: doc._id }, update);
  }
  return report;
}

// Data migrations for Phase 3. They use the current Mongoose connection and the raw
// collection (no hooks). With apply=false they only count what they WOULD change.
// They never print or return a CNIC number.
import WorkerProfile from '../../models/WorkerProfile.js';
import { normalizeCnic, encryptCnic, hashCnic } from '../../services/cnic.js';
import { categoryIdFrom, CATEGORY_IDS, DEFAULT_CATEGORY_ID } from '../../config/skillTaxonomy.js';

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

// Old category labels ("Electrical & Solar", "None") -> taxonomy ids.
export async function migrateCategories({ apply = false } = {}) {
  const col = WorkerProfile.collection;
  const report = { checked: 0, converted: 0, unknownSetToDefault: 0 };
  for await (const doc of col.find({ category: { $exists: true, $nin: [...CATEGORY_IDS] } }, { projection: { category: 1 } })) {
    report.checked += 1;
    const id = categoryIdFrom(doc.category);
    if (id) report.converted += 1;
    else report.unknownSetToDefault += 1;
    if (apply) await col.updateOne({ _id: doc._id }, { $set: { category: id ?? DEFAULT_CATEGORY_ID } });
  }
  return report;
}

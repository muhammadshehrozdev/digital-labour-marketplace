// Where evidence image bytes live (D-013). Today: the EvidenceFile collection in MongoDB.
// The rest of the app uses only save / read / remove, so a private Vercel Blob store could
// replace this file later without changing any route.
import mongoose from 'mongoose';
import EvidenceFile from '../../models/EvidenceFile.js';

export async function save(buffer, { contentType }) {
  const doc = await EvidenceFile.create({ data: buffer, contentType, size: buffer.length });
  return doc._id;
}

// Returns { data, contentType } or null.
export async function read(fileId) {
  if (!mongoose.isValidObjectId(fileId)) return null;
  const doc = await EvidenceFile.findById(fileId).lean();
  if (!doc) return null;
  return { data: Buffer.from(doc.data.buffer ?? doc.data), contentType: doc.contentType };
}

export async function remove(fileId) {
  if (!mongoose.isValidObjectId(fileId)) return;
  await EvidenceFile.deleteOne({ _id: fileId });
}

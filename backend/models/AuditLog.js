// Append-only audit log (CLAUDE_CODE_PROMPT.md C4/C6). Entries are never updated or deleted
// through the app: the hooks below refuse it. Raw database edits are caught by the hash
// chain (npm run audit:verify). Never store a CNIC number here.
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    seq: { type: Number, required: true, unique: true }, // 1, 2, 3, ... (unique keeps one chain)
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = system/script
    actorRole: { type: String, default: 'system' },
    action: { type: String, required: true, maxlength: 60 },
    targetType: { type: String, default: null, maxlength: 40 },
    targetId: { type: String, default: null, maxlength: 60 },
    fromState: { type: String, default: null, maxlength: 40 },
    toState: { type: String, default: null, maxlength: 40 },
    reason: { type: String, default: null, maxlength: 500 },
    details: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, required: true },
    prevHash: { type: String, required: true },
    hash: { type: String, required: true },
  },
  { versionKey: false, minimize: false }
);

auditLogSchema.index({ targetType: 1, targetId: 1, seq: 1 });
// "last activity of this account" on the admin Users page (Batch 4 review R-04)
auditLogSchema.index({ actor: 1, seq: -1 });
// filter by action on the audit page and in the export
auditLogSchema.index({ action: 1, seq: -1 });

const refuse = function () {
  throw new Error('AuditLog is append-only: updates and deletes are not allowed');
};
for (const op of [
  'updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'findOneAndReplace',
  'deleteOne', 'deleteMany', 'findOneAndDelete',
]) {
  auditLogSchema.pre(op, refuse);
}
auditLogSchema.pre('save', function () {
  if (!this.isNew) refuse();
});

export default mongoose.model('AuditLog', auditLogSchema);

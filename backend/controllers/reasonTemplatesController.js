// Admin: saved reason templates (Batch 4, feature 29). Short sentences in three languages that
// an admin can insert into a decision note and then edit. Every change is audited.
import ReasonTemplate, { MAX_TEMPLATES } from '../models/ReasonTemplate.js';
import { STARTER_TEMPLATES } from '../config/reasonTemplates.js';
import { httpError } from '../utils/httpError.js';
import { writeAudit } from '../services/audit.js';

const view = (t) => ({
  _id: t._id,
  kind: t.kind,
  text: { en: t.text?.en ?? '', ur: t.text?.ur ?? '', 'ur-Latn': t.text?.['ur-Latn'] ?? '' },
  updatedAt: t.updatedAt,
});

const audit = (req, action, template, reason) =>
  writeAudit({ actor: req.user._id, actorRole: 'admin', action, targetType: 'ReasonTemplate', targetId: template._id, reason, details: { kind: template.kind } });

// GET /api/admin/reason-templates?kind=
export const listTemplates = async (req, res) => {
  const { kind } = req.validated.query;
  const templates = await ReasonTemplate.find(kind ? { kind } : {}).sort({ kind: 1, createdAt: 1, _id: 1 }).lean();
  res.json({ templates: templates.map(view), max: MAX_TEMPLATES });
};

// POST /api/admin/reason-templates { kind, text: { en, ur?, ur-Latn? } }
export const createTemplate = async (req, res) => {
  if ((await ReasonTemplate.countDocuments()) >= MAX_TEMPLATES) throw httpError(400, 'TEMPLATE_LIMIT', { max: MAX_TEMPLATES });
  const { kind, text } = req.validated.body;
  const template = await ReasonTemplate.create({ kind, text, createdBy: req.user._id, updatedBy: req.user._id });
  await audit(req, 'template.created', template, 'Admin added a reason template');
  res.status(201).json({ template: view(template) });
};

// PATCH /api/admin/reason-templates/:id { text } — the kind cannot change.
export const updateTemplate = async (req, res) => {
  const template = await ReasonTemplate.findById(req.validated.params.id);
  if (!template) throw httpError(404, 'TEMPLATE_NOT_FOUND');
  const { en, ur = '', 'ur-Latn': urLatn = '' } = req.validated.body.text;
  template.text = { en, ur, 'ur-Latn': urLatn };
  template.updatedBy = req.user._id;
  await template.save();
  await audit(req, 'template.updated', template, 'Admin changed a reason template');
  res.json({ template: view(template) });
};

// DELETE /api/admin/reason-templates/:id
export const deleteTemplate = async (req, res) => {
  const template = await ReasonTemplate.findByIdAndDelete(req.validated.params.id).lean();
  if (!template) throw httpError(404, 'TEMPLATE_NOT_FOUND');
  await audit(req, 'template.deleted', template, 'Admin deleted a reason template');
  res.json({ deleted: true });
};

// POST /api/admin/reason-templates/starter-set — adds the starter sentences for every kind that
// has no template yet. Safe to press twice: a kind that already has templates is left alone.
export const addStarterSet = async (req, res) => {
  const existing = new Set(await ReasonTemplate.distinct('kind'));
  const toAdd = STARTER_TEMPLATES.filter((t) => !existing.has(t.kind));
  const room = MAX_TEMPLATES - (await ReasonTemplate.countDocuments());
  const added = await ReasonTemplate.insertMany(toAdd.slice(0, Math.max(0, room)).map((t) => ({ ...t, createdBy: req.user._id, updatedBy: req.user._id })));
  if (added.length > 0) {
    await writeAudit({ actor: req.user._id, actorRole: 'admin', action: 'template.starter_set', targetType: 'ReasonTemplate', reason: `Admin added the starter set (${added.length} templates)`, details: { added: added.length } });
  }
  const templates = await ReasonTemplate.find().sort({ kind: 1, createdAt: 1, _id: 1 }).lean();
  res.status(added.length ? 201 : 200).json({ added: added.length, templates: templates.map(view), max: MAX_TEMPLATES });
};

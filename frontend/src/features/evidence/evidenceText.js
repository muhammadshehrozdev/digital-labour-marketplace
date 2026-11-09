// Texts and small helpers for Module 3 screens.
import { Award, Camera, FileText } from 'lucide-react';
import API from '../../api';

export const CONSENT_TEXT = "I own this photo or have permission to share it, and it shows no other person's private information.";

export const TYPE_OPTIONS = [
  { value: 'certificate', title: 'Certificate photo', description: 'A course or trade certificate.', icon: Award },
  { value: 'work_photo', title: 'Work photo', description: 'A job you finished (no faces, no house numbers).', icon: Camera },
  { value: 'reference_letter', title: 'Reference letter photo', description: 'A letter from a client or employer.', icon: FileText },
];
export const TYPE_LABEL = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.title]));

export const REASON_TEXT = {
  unclear: 'Photo is unclear',
  not_relevant: 'Not relevant to the skill',
  wrong_skill: 'Belongs to another skill',
  other: 'Other',
};

// The photo is served only to its owner and to admins (the login cookie is sent with the request).
export const evidenceFileUrl = (id) => `${API.defaults.baseURL}/evidence/${encodeURIComponent(id)}/file`;

// Only pending or rejected items may be deleted by the worker (same rule as the server, D-015).
export const canWorkerDelete = (item) => item.status === 'pending' || item.status === 'rejected';

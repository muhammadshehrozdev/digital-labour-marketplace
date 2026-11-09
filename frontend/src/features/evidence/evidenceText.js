// Small helpers for Module 3 screens. All visible words are in the dictionaries (evidence.*).
import { Award, Camera, FileText } from 'lucide-react';
import API from '../../api';

export const EVIDENCE_TYPES = [
  { value: 'certificate', icon: Award },
  { value: 'work_photo', icon: Camera },
  { value: 'reference_letter', icon: FileText },
];
export const REASON_CODES = ['unclear', 'not_relevant', 'wrong_skill', 'other'];

// The photo is served only to its owner and to admins (the login cookie is sent with the request).
export const evidenceFileUrl = (id) => `${API.defaults.baseURL}/evidence/${encodeURIComponent(id)}/file`;

// Only pending or rejected items may be deleted by the worker (same rule as the server, D-015).
export const canWorkerDelete = (item) => item.status === 'pending' || item.status === 'rejected';

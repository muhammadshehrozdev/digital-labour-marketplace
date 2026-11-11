// Where a notification leads (the place where the worker can act on it).
export function notificationLink(n) {
  if (n.type.startsWith('identity_')) return '/worker/profile/edit?section=about';
  const skill = n.params?.skillId ? `&skill=${encodeURIComponent(n.params.skillId)}` : '';
  return `/worker/profile/edit?section=proof${skill}`;
}

export const NOTIFICATION_POLL_MS = 60000; // once a minute, no websockets (Batch 4 prompt)

// The tone of the little dot / icon: good news green, problems red.
export const notificationTone = (type) => (type === 'identity_verified' || type === 'evidence_approved' ? 'success' : 'danger');

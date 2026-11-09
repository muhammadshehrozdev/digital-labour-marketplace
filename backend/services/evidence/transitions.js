// Evidence review state machine (Batch 2 Part 1, D-015). Pure functions, no database.
//
//   pending  --approve-------> approved
//   pending  --reject (code)-> rejected
//   pending  --suspected_fake (reason)--> suspected_fake
//   approved --suspected_fake (reason)--> suspected_fake
//   approved --revoke (reason)---------> revoked
// Any other transition is refused (400). rejected, suspected_fake and revoked are final in this
// version (an appeal / dispute flow belongs to a later module).
export const ACTIONS = Object.freeze({
  approve: { from: ['pending'], to: 'approved', verb: 'approve' },
  reject: { from: ['pending'], to: 'rejected', verb: 'reject' },
  suspected_fake: { from: ['pending', 'approved'], to: 'suspected_fake', verb: 'mark as suspected fake' },
  revoke: { from: ['approved'], to: 'revoked', verb: 'revoke' },
});

const STATUS_WORDS = {
  pending: 'pending review',
  approved: 'approved',
  rejected: 'rejected',
  suspected_fake: 'marked as suspected fake',
  revoked: 'revoked',
};

export function checkTransition(action, currentStatus) {
  const rule = ACTIONS[action];
  if (!rule) return { ok: false, message: 'Unknown action' };
  if (!rule.from.includes(currentStatus)) {
    return { ok: false, message: `You cannot ${rule.verb} an item that is ${STATUS_WORDS[currentStatus] ?? currentStatus}.` };
  }
  return { ok: true, to: rule.to };
}

// Which actions an admin may take from a status (the UI shows only these buttons).
export const allowedActions = (status) => Object.keys(ACTIONS).filter((a) => ACTIONS[a].from.includes(status));

// A worker may delete only items that were never accepted and never marked as fake.
export const WORKER_DELETABLE = Object.freeze(['pending', 'rejected']);

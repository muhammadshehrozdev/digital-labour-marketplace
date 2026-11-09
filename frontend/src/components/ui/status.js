import { CircleDashed, Clock, ShieldCheck, ShieldX, UserRound, FileClock, BadgeCheck, TriangleAlert } from 'lucide-react';

// One place that turns a status into tone + icon + words (never colour alone).
export const STATUS = {
  identity: {
    Unverified: { tone: 'neutral', icon: CircleDashed, text: 'Identity not submitted' },
    Pending: { tone: 'warning', icon: Clock, text: 'Identity pending review' },
    Verified: { tone: 'success', icon: ShieldCheck, text: 'Identity verified' },
    Rejected: { tone: 'danger', icon: ShieldX, text: 'Identity not accepted' },
  },
  // Module 3 states are built now; only "self_declared" is used until evidence exists.
  skill: {
    self_declared: { tone: 'neutral', icon: UserRound, text: 'Self-declared' },
    evidence_pending: { tone: 'warning', icon: FileClock, text: 'Evidence pending' },
    verified: { tone: 'success', icon: BadgeCheck, text: 'Verified by evidence' },
    disputed: { tone: 'danger', icon: TriangleAlert, text: 'Disputed' },
  },
};

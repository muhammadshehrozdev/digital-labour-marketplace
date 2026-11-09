import { CircleDashed, Clock, ShieldCheck, ShieldX, UserRound, FileClock, BadgeCheck, TriangleAlert, CircleX, Undo2 } from 'lucide-react';

// One place that turns a status into tone + icon. The words are in the dictionaries
// (status.<kind>.<status>), so they change with the language.
export const STATUS = {
  identity: {
    Unverified: { tone: 'neutral', icon: CircleDashed },
    Pending: { tone: 'warning', icon: Clock },
    Verified: { tone: 'success', icon: ShieldCheck },
    Rejected: { tone: 'danger', icon: ShieldX },
  },
  skill: {
    self_declared: { tone: 'neutral', icon: UserRound },
    evidence_pending: { tone: 'warning', icon: FileClock },
    verified: { tone: 'success', icon: BadgeCheck },
    disputed: { tone: 'danger', icon: TriangleAlert },
  },
  // One proof item (Module 3).
  evidence: {
    pending: { tone: 'warning', icon: Clock },
    approved: { tone: 'success', icon: BadgeCheck },
    rejected: { tone: 'danger', icon: CircleX },
    suspected_fake: { tone: 'danger', icon: TriangleAlert },
    revoked: { tone: 'neutral', icon: Undo2 },
  },
};

// Evidence strength per skill, shown in plain words (status.strength.*); no percentages in the UI (D-014).
export const STRENGTHS = ['none', 'weak', 'moderate', 'strong'];

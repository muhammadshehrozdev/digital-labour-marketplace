// Batch 6B: rep-2 is the live engine. What changes for people: My reputation shows the rules of the live engine
// (from the server's rule list, so the words always match the code), the new per-review reasons and that
// "Best track record" orders by the reputation score; the Help Centre guide is written from the same rules;
// the admin breakdown shows rep-2's factors. The public profile does not change (it never showed the numbers).
// Fixtures are synthetic.
import { describe, test, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt } from './renderApp';

const RULES = {
  engineVersion: 'rep-2', rankBy: 'expected', newReviewerBudget: 1, burstCheck: true, halfLifeDays: null, lateCancelHours: 24,
  items: [
    { id: 'onlyCustomers', values: {} },
    { id: 'sameCustomer', values: {} },
    { id: 'newAccounts', values: { budget: 1 } },
    { id: 'burst', values: { days: 14, count: 4 } },
    { id: 'lateCancel', values: { hours: 24 } },
  ],
};
const PUBLIC = {
  ratingAverage: 5, reviewCount: 3, depth: 'some', distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 }, completedJobs: 3, workerCancelledEarly: 0, workerCancelledLate: 0, noShows: 0, repeatCustomers: 0, perSkill: [],
  quick: { onTime: { yes: 0, total: 0 }, workQuality: { yes: 0, total: 0 }, polite: { yes: 0, total: 0 }, priceAsAgreed: { yes: 0, total: 0 } }, wouldHireAgain: { yes: 0, total: 0 },
};
const workerRoutes = (extra = {}) => ({
  'GET /auth/me': me('worker', { _id: 'w1' }),
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /workers/me/full': full(PROFILE, []),
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});

describe('My reputation with rep-2', () => {
  test('the five rep-2 rules with the budget in words; no "newer reviews count more"; the new reasons; ordered by the reputation score', async () => {
    localStorage.setItem('dlm.tour.w1', 'done');
    mockApi(workerRoutes({
      'GET /workers/me/reputation': { status: 200, data: {
        workerIdCode: 'DLM-2026-000042', hiddenReviews: 0, cancellations: [],
        snapshot: { engineVersion: 'rep-2', baseRate: 0.8, public: PUBLIC, score: { expected: 0.8889, cautious: 0.6905 }, reliability: { expected: 0.8, completed: 3 } },
        perReview: [
          { id: 'a', stars: 5, createdAt: '2026-11-01T00:00:00Z', weight: 0.33, reasons: ['new_reviewer_budget'], skillId: 'elec_wiring' },
          { id: 'b', stars: 5, createdAt: '2026-11-03T00:00:00Z', weight: 0.17, reasons: ['new_reviewer_budget', 'burst'], skillId: 'elec_wiring' },
        ],
        rules: { ...RULES, earlyCancelCounts: 0.5, lateCancelCounts: 1, disputeWindowDays: 14 },
      } },
    }));
    renderAt('/worker/reputation');
    const rules = await screen.findAllByTestId('reputation-rule');
    expect(rules.map((r) => within(r).getByRole('heading').textContent)).toEqual([
      'Only real customers', 'One customer, less each time', 'New customer accounts: counted, with a limit', 'Many reviews in a few days', 'Cancel early',
    ]);
    expect(screen.queryByRole('heading', { name: 'Newer reviews count more' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Experienced customers count fully' })).toBeNull();
    expect(screen.getByText('Reviews from brand-new customer accounts count, but all of them together count as at most 1 review.')).toBeInTheDocument();
    expect(screen.getByText('Many reviews in a few days count less: when 4 or more arrive within 14 days, each of them counts half.')).toBeInTheDocument();
    expect(screen.getByText('A late cancellation counts double: cancel at least 24 hours before.')).toBeInTheDocument();
    // every rule can be heard
    for (const name of ['Only real customers', 'New customer accounts: counted, with a limit', 'Cancel early']) expect(screen.getByRole('button', { name: `Listen: ${name}` })).toBeInTheDocument();
    expect(screen.getByText('Counted less: a first-time customer account. All such reviews together count as 1 review.')).toBeInTheDocument();
    expect(screen.getByText('Counted less: a first-time customer account. All such reviews together count as 1 review. Counted half: one of many reviews within a few days.')).toBeInTheDocument();
    expect(screen.getByText('Reputation score: 0.89 out of 1 (the middle estimate from your counted reviews). "Best track record" orders by this score.')).toBeInTheDocument();
    expect(screen.getByText('Careful score: 0.69 out of 1. We are about 90% sure your true score is at least this.')).toBeInTheDocument();
  });
});

describe('Help Centre with rep-2', () => {
  test('the reputation guide is written from the live rules', async () => {
    mockApi({ 'GET /auth/me': me('worker', { _id: 'w1' }), 'GET /meta/reputation-rules': { status: 200, data: RULES }, 'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'), 'GET /notifications/unread-count': { status: 200, data: { unread: 0 } } });
    renderAt('/help');
    const title = await screen.findByRole('heading', { level: 3, name: 'How your reputation is counted' });
    const guide = title.closest('article');
    expect(await within(guide).findByText('Reviews from brand-new customer accounts count, but all of them together count as at most 1 review.')).toBeInTheDocument();
    expect(within(guide).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Only customers who finished a job with you can review you.',
      'Many reviews from the same customer count less each time.',
      'Reviews from brand-new customer accounts count, but all of them together count as at most 1 review.',
      'Many reviews in a few days count less.',
      'A late cancellation counts double: cancel at least a day before.',
    ]);
    expect(guide.textContent).not.toMatch(/Newer reviews count more/);
  });
});

describe('admin breakdown with rep-2', () => {
  test('provenance, new-account budget, burst and pair; the rep-2 reasons', async () => {
    mockApi({
      'GET /auth/me': me('admin'),
      'GET /admin/reason-templates': { status: 200, data: { templates: [], max: 60 } },
      'GET /meta/reputation-rules': { status: 200, data: RULES },
      'GET /admin/users': { status: 200, data: { users: [{ _id: 'u9', name: 'Bilal Ahmed', email: 'b@example.com', phone: '03001234567', role: 'worker', status: 'active', createdAt: '2026-11-01T00:00:00Z' }], page: 1, limit: 25, total: 1 } },
      'GET /admin/users/u9': { status: 200, data: { user: { _id: 'u9', name: 'Bilal Ahmed', email: 'b@example.com', phone: '03001234567', role: 'worker', status: 'active', createdAt: '2026-11-01T00:00:00Z' }, worker: { profileId: 'p1', workerIdCode: 'DLM-2026-000042', occupation: 'Electrician', category: 'electrical_solar', verificationStatus: 'Verified', skills: 2, profileCompletion: 80, evidence: { pending: 0, approved: 1, rejected: 0, suspected_fake: 0, revoked: 0 } }, customer: null, activity: [] } },
      'GET /admin/workers/p1/reputation': { status: 200, data: {
        workerIdCode: 'DLM-2026-000042',
        snapshot: { public: { reviewCount: 2 }, score: { expected: 0.8889, cautious: 0.6905, uncertainty: 0.6667, depth: 'few' }, reliability: { expected: 0.75, completed: 2, workerCancelledEarly: 0, workerCancelledLate: 0, noShows: 0 } },
        storedSnapshot: { computedAt: '2026-11-17T02:00:00Z', engineVersion: 'rep-2', paramsHash: 'cfb1c342f1f5' },
        perReview: [{ id: 'r1', stars: 5, createdAt: '2026-11-10T00:00:00Z', weight: 0.25, factors: { provenance: 1, recency: 1, reviewerTrust: 1, pairFactor: 1, burst: 0.5, newReviewerBudget: 0.5 }, reasons: ['new_reviewer_budget', 'burst'], review: { customer: { name: 'Sara Khan' } } }],
        hiddenReviews: [], flags: [], bookingsByStatus: { completed: 2 },
      } },
    });
    renderAt('/admin/users');
    const user = userEvent.setup();
    await user.click(await screen.findByText('Bilal Ahmed'));
    await user.click(await screen.findByRole('tab', { name: 'Reputation' }));
    const breakdown = await screen.findByTestId('reputation-breakdown');
    expect(within(breakdown).getByText('provenance 1.00 · new-account budget 0.50 · burst 0.50 · pair 1.00')).toBeInTheDocument();
    expect(await within(breakdown).findByText('Counted less: a first-time customer account. All such reviews together count as 1 review. Counted half: one of many reviews within a few days.')).toBeInTheDocument();
    expect(within(breakdown).getByText(/engine rep-2, parameters cfb1c342f1f5/)).toBeInTheDocument();
  });
});

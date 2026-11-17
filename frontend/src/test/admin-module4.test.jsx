// Module 4 (Batch 6) admin screens: the dispute queue and decision drawer, review moderation, reputation
// flags, the overview charts from real counts, and the worker's Reputation tab. Synthetic data only.
import { describe, test, expect } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me } from './mockApi';
import { renderAt } from './renderApp';

const ADMIN = me('admin', { _id: 'admin1', name: 'Test Admin' });
const booking = (extra = {}) => ({
  _id: 'b1', code: 'BK-2026-000007', status: 'accepted', outcome: null, skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar',
  preferredDate: '2026-11-18', timeSlot: 'morning', scheduledStart: '2026-11-18T04:00:00Z', city: 'Islamabad', area: 'G-9', description: 'Two sockets.',
  worker: { name: 'Bilal Ahmed', workerIdCode: 'DLM-2026-000042' }, customer: { name: 'Sara Khan' }, disputeStatus: 'open', actions: [], createdAt: '2026-11-16T10:00:00Z',
  timeline: [{ from: null, to: 'requested', by: 'customer', at: '2026-11-16T10:00:00Z' }, { from: 'requested', to: 'accepted', by: 'worker', at: '2026-11-16T11:00:00Z' }],
  dispute: { type: 'no_show_contested', openedBy: 'worker', reasonCode: 'i_did_come', note: 'I came at nine [test].', openedAt: new Date(Date.now() - 3 * 864e5).toISOString(), status: 'open', decision: null, decisionNote: '' },
  allowedDecisions: ['no_show_confirmed', 'no_show_rejected'], review: null, ...extra,
});
const REVIEW = {
  _id: 'r1', rating: 1, onTime: 'no', workQuality: 'no', polite: null, priceAsAgreed: null, wouldHireAgain: 'no', comment: 'Bad work [test].', status: 'visible', hidden: null, reply: null,
  reports: [{ reasonCode: 'job_did_not_happen', note: '', at: '2026-11-15T10:00:00Z' }], skillId: 'elec_wiring', createdAt: '2026-11-14T10:00:00Z',
  worker: { profileId: 'p1', name: 'Bilal Ahmed', workerIdCode: 'DLM-2026-000042' }, customer: { name: 'Sara Khan' }, booking: { _id: 'b1', code: 'BK-2026-000007', completionMethod: 'both' }, synthetic: true,
};
const base = (extra = {}) => ({ 'GET /auth/me': ADMIN, 'GET /admin/reason-templates': { status: 200, data: { templates: [], max: 60 } }, ...extra });

describe('dispute queue', () => {
  test('oldest first with a waiting badge; the drawer shows the note, the timeline and only the decisions that fit; a note is required', async () => {
    const calls = mockApi(base({
      'GET /admin/disputes': { status: 200, data: { disputes: [booking()], total: 1 } },
      'GET /admin/bookings/b1': { status: 200, data: { booking: booking() } },
      'PATCH /admin/bookings/b1/dispute': (config, body) => ({ status: 200, data: { booking: booking({ dispute: { ...booking().dispute, status: 'decided', decision: body.decision } }) } }),
    }));
    renderAt('/admin/disputes');
    const user = userEvent.setup();
    expect(await screen.findByText('Waiting 3 days')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open booking BK-2026-000007' }));
    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByText('“I came at nine [test].”')).toBeInTheDocument();
    expect(within(drawer).getByText('Opened by the worker · I did come')).toBeInTheDocument();
    const cards = within(drawer).getByRole('group', { name: 'What happened?' });
    expect(within(cards).getAllByRole('radio').map((r) => r.closest('label').querySelector('span span').textContent)).toEqual(['Decision: the worker did not come', 'Decision: the worker did come']);
    await user.click(within(drawer).getByRole('button', { name: 'Save the decision' }));
    expect(within(drawer).getByText('Choose a decision')).toBeInTheDocument();
    await user.click(within(cards).getByRole('radio', { name: /the worker did come/ }));
    await user.click(within(drawer).getByRole('button', { name: 'Save the decision' }));
    expect(within(drawer).getByText('Write a note of at least 5 characters')).toBeInTheDocument();
    await user.type(within(drawer).getByLabelText(/^Note for the record/), 'Both called; he was there.');
    await user.click(within(drawer).getByRole('button', { name: 'Save the decision' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'PATCH /admin/bookings/b1/dispute')).toBe(true));
    expect(calls.find((c) => c.key === 'PATCH /admin/bookings/b1/dispute').body).toEqual({ decision: 'no_show_rejected', note: 'Both called; he was there.' });
    expect(document.body.textContent).not.toMatch(/03\d{9}/); // no phone number anywhere
  });
});

describe('review moderation', () => {
  test('reported reviews are marked; hiding needs a reason card and warns that negative is never a reason; restoring needs words', async () => {
    const calls = mockApi(base({
      'GET /admin/reviews': { status: 200, data: { reviews: [REVIEW], page: 1, limit: 25, total: 1, reportedVisible: 1 } },
      'PATCH /admin/reviews/r1': (config, body) => ({ status: 200, data: { review: { ...REVIEW, status: body.action === 'hide' ? 'hidden' : 'visible' } } }),
    }));
    renderAt('/admin/reviews');
    const user = userEvent.setup();
    const card = await screen.findByTestId('admin-review');
    expect(within(card).getByText('Reported')).toBeInTheDocument();
    expect(within(card).getByText(/This job never happened/)).toBeInTheDocument();
    expect(within(card).getByRole('img', { name: '1 star' })).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Hide' }));
    const dialog = await screen.findByRole('dialog', { name: 'Hide this review?' });
    expect(within(dialog).getByText('A negative review is never a reason to hide it. Hide only for one of the reasons below.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Hide' }));
    expect(within(dialog).getByText('Choose a reason')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('radio', { name: 'Fake or manipulated' }));
    await user.click(within(dialog).getByRole('button', { name: 'Hide' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'PATCH /admin/reviews/r1')).toBe(true));
    expect(calls.find((c) => c.key === 'PATCH /admin/reviews/r1').body).toEqual({ action: 'hide', reasonCode: 'fake_or_manipulated' });
  });
});

describe('reputation flags', () => {
  test('a flag explains its rule in words; dismissing needs a note', async () => {
    const FLAG = { _id: 'f1', type: 'new_account_praise', status: 'open', details: { reviews: 3, windowDays: 14 }, createdAt: '2026-11-15T10:00:00Z', decision: null, worker: { profileId: 'p1', workerIdCode: 'DLM-2026-000042', name: 'Bilal Ahmed' }, reviews: [{ ...REVIEW, rating: 5, reports: [] }], bookings: [] };
    const calls = mockApi(base({
      'GET /admin/reputation-flags': { status: 200, data: { flags: [FLAG], total: 1, open: 1 } },
      'PATCH /admin/reputation-flags/f1': { status: 200, data: { flag: { ...FLAG, status: 'dismissed' }, reviewsHidden: 0 } },
    }));
    renderAt('/admin/flags');
    const user = userEvent.setup();
    const flag = await screen.findByTestId('flag');
    expect(within(flag).getByRole('heading', { name: 'Praise from new accounts' })).toBeInTheDocument();
    expect(within(flag).getByText(/3 or more good reviews came from accounts less than 14 days old/)).toBeInTheDocument();
    await user.click(within(flag).getByRole('button', { name: 'Dismiss' }));
    const dialog = await screen.findByRole('dialog', { name: 'Dismiss this flag?' });
    await user.click(within(dialog).getByRole('button', { name: 'Dismiss' }));
    expect(within(dialog).getByText('Write a note of at least 5 characters')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/^Note for the record/), 'Three neighbours, checked by phone.');
    await user.click(within(dialog).getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PATCH /admin/reputation-flags/f1')?.body).toEqual({ action: 'dismiss', note: 'Three neighbours, checked by phone.' }));
  });
});

describe('overview and the worker breakdown', () => {
  const STATS = {
    days: 30, timezone: 'Asia/Karachi', generatedAt: '2026-11-16T10:00:00Z',
    bookingsPerDay: Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.UTC(2026, 9, 18) + i * 864e5).toISOString().slice(0, 10), requested: 0, accepted: 0, completed: i === 29 ? 2 : 0, declined: 0, expired: 0, cancelled: i === 29 ? 1 : 0 })),
    ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 },
    perWeek: [{ week: 1, from: '2026-11-10', completed: 2, workerCancelled: 1, noShows: 0 }],
    queues: { openDisputes: 1, openFlags: 0, reportedReviews: 2 },
  };
  test('the overview has the Module 4 queues and charts from the stats endpoint', async () => {
    mockApi(base({
      'GET /admin/stats': { status: 200, data: { workers: { total: 0, Unverified: 0, Pending: 0, Verified: 0, Rejected: 0 }, users: { worker: 0, customer: 0, admin: 1 }, evidence: { pending: 0, suspected_fake: 0 } } },
      'GET /admin/charts': { status: 404, data: {} },
      'GET /admin/audit': { status: 200, data: { entries: [], total: 0, page: 1, limit: 8, actions: [] } },
      'GET /admin/audit/verify': { status: 200, data: { ok: true, count: 0, checkedAt: '2026-11-16T10:00:00Z' } },
      'GET /admin/stats/bookings': { status: 200, data: STATS },
    }));
    renderAt('/admin');
    const charts = await screen.findByTestId('booking-charts');
    expect(within(charts).getByText('New bookings per day')).toBeInTheDocument();
    expect(within(charts).getByText('Stars in visible reviews (all time)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Open disputes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open the queue: Reported reviews/ })).toHaveAttribute('href', '/admin/reviews?reported=true');
  });

  test('the user drawer of a worker has a Reputation tab with every weight and factor', async () => {
    mockApi(base({
      'GET /admin/users': { status: 200, data: { users: [{ _id: 'u9', name: 'Bilal Ahmed', email: 'b@example.com', phone: '03001234567', role: 'worker', status: 'active', createdAt: '2026-11-01T00:00:00Z' }], page: 1, limit: 25, total: 1 } },
      'GET /admin/users/u9': { status: 200, data: { user: { _id: 'u9', name: 'Bilal Ahmed', email: 'b@example.com', phone: '03001234567', role: 'worker', status: 'active', createdAt: '2026-11-01T00:00:00Z' }, worker: { profileId: 'p1', workerIdCode: 'DLM-2026-000042', occupation: 'Electrician', category: 'electrical_solar', verificationStatus: 'Verified', skills: 2, profileCompletion: 80, evidence: { pending: 0, approved: 1, rejected: 0, suspected_fake: 0, revoked: 0 } }, customer: null, activity: [] } },
      'GET /admin/workers/p1/reputation': { status: 200, data: {
        workerIdCode: 'DLM-2026-000042',
        snapshot: { public: { reviewCount: 1 }, score: { expected: 0.6, cautious: 0.2644, uncertainty: 0.8, depth: 'few' }, reliability: { expected: 0.6667, completed: 1, workerCancelledEarly: 0, workerCancelledLate: 0, noShows: 0 } },
        storedSnapshot: { computedAt: '2026-11-16T02:00:00Z', engineVersion: 'rep-1', paramsHash: '23974876a27d' },
        perReview: [{ id: 'r1', stars: 5, createdAt: '2026-11-10T00:00:00Z', weight: 0.5, factors: { provenance: 1, recency: 0.99, reviewerTrust: 0.5, pairFactor: 1 }, reasons: ['new_reviewer'], review: { customer: { name: 'Sara Khan' } } }],
        hiddenReviews: [], flags: [], bookingsByStatus: { completed: 1 },
      } },
    }));
    renderAt('/admin/users');
    const user = userEvent.setup();
    await user.click(await screen.findByText('Bilal Ahmed'));
    await user.click(await screen.findByRole('tab', { name: 'Reputation' }));
    const breakdown = await screen.findByTestId('reputation-breakdown');
    expect(within(breakdown).getByText('0.2644')).toBeInTheDocument();
    expect(within(breakdown).getByText('provenance 1.00 · recency 0.99 · trust 0.50 · pair 1.00')).toBeInTheDocument();
    expect(within(breakdown).getByText('Counted less: this customer has not hired other workers here yet.')).toBeInTheDocument();
    expect(within(breakdown).getByText(/engine rep-1, parameters 23974876a27d/)).toBeInTheDocument();
  });
});

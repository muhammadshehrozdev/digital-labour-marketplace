// Module 4 (Batch 6) list screens and the booking buttons: My bookings (customer), My jobs (worker),
// My reviews (reply and report), the admin bookings list with its drawer, and what the buttons send.
// Synthetic test data only; the API is answered from a table (mockApi). Typed texts have no "[" or "{":
// user-event reads those as key names.
import { describe, test, expect } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt, pathname } from './renderApp';

const CODE = 'DLM-2026-000042';
const HOUR = 60 * 60 * 1000;
const booking = (extra = {}) => ({
  _id: 'b1', code: 'BK-2026-000007', status: 'requested', outcome: null, skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar',
  preferredDate: '2026-11-18', timeSlot: 'morning', scheduledStart: new Date(Date.now() + 72 * HOUR).toISOString(), city: 'Islamabad', area: 'G-9 Markaz', description: 'Two sockets do not work.',
  worker: { name: 'Bilal Ahmed', workerIdCode: CODE }, customer: { name: 'Sara K.' }, disputeStatus: null, hasReview: false, actions: [], timeline: [], dispute: null, review: null, contact: null,
  noShow: { reportedAt: null, workerResponse: null }, createdAt: '2026-11-16T10:00:00Z', ...extra,
});
const list = (bookings) => ({ status: 200, data: { bookings, counts: { requested: 0, accepted: 0 }, page: 1, limit: 20, total: bookings.length } });
const customerRoutes = (extra = {}) => ({
  'GET /auth/me': me('customer', { _id: 'c1' }),
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});
const workerRoutes = (extra = {}) => ({
  'GET /auth/me': me('worker', { _id: 'w1' }),
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /workers/me/full': full(PROFILE, []),
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});
const callsTo = (calls, key) => calls.filter((c) => c.key === key);

describe('My bookings (customer)', () => {
  test('Active and Past tabs; no phone number in the list; cancelling a request needs no reason and keeps the booking on "Keep"', async () => {
    let cancelled = false;
    const calls = mockApi(customerRoutes({
      'GET /bookings/mine': (config) => (config.params.status === 'past'
        ? list([])
        : list(cancelled ? [] : [booking({ actions: ['cancel'] })])),
      'POST /bookings/b1/cancel': () => { cancelled = true; return { status: 200, data: { booking: booking({ status: 'cancelled' }) } }; },
    }));
    renderAt('/bookings');
    const user = userEvent.setup();
    const card = (await screen.findAllByTestId('booking-card'))[0];
    expect(within(card).getByText('BK-2026-000007', { exact: false })).toBeInTheDocument();
    expect(card.querySelector('a[href^="tel:"], a[href*="wa.me"]')).toBeNull();
    expect(callsTo(calls, 'GET /bookings/mine')[0].params).toMatchObject({ status: 'active', page: '1' });

    await user.click(within(card).getByRole('button', { name: 'Cancel' }));
    let dialog = await screen.findByRole('dialog', { name: 'Cancel this booking?' });
    expect(within(dialog).getByText('The worker will be told.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Keep the booking' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(callsTo(calls, 'POST /bookings/b1/cancel')).toHaveLength(0);

    await user.click(within(card).getByRole('button', { name: 'Cancel' }));
    dialog = await screen.findByRole('dialog', { name: 'Cancel this booking?' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel the booking' }));
    await waitFor(() => expect(callsTo(calls, 'POST /bookings/b1/cancel')).toHaveLength(1));
    expect(callsTo(calls, 'POST /bookings/b1/cancel')[0].body).toEqual({});
    expect(await screen.findByText('No open requests')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Past/ }));
    expect(await screen.findByText('Nothing here yet')).toBeInTheDocument();
    expect(callsTo(calls, 'GET /bookings/mine').some((c) => c.params.status === 'past')).toBe(true);
  });

  test('a server refusal (409) is shown in words, and the list stays', async () => {
    mockApi(customerRoutes({
      'GET /bookings/mine': list([booking({ status: 'accepted', actions: ['confirm_done'] })]),
      'POST /bookings/b1/confirm-done': { status: 409, data: { code: 'BOOKING_CHANGED', message: 'changed' } },
    }));
    renderAt('/bookings');
    const user = userEvent.setup();
    const card = (await screen.findAllByTestId('booking-card'))[0];
    await user.click(within(card).getByRole('button', { name: 'Work done' }));
    const dialog = await screen.findByRole('dialog', { name: 'Is the work finished?' });
    await user.click(within(dialog).getByRole('button', { name: 'Work done' }));
    expect(await screen.findByText('Someone changed this booking just now. Please reload the page.')).toBeInTheDocument();
    expect(screen.getAllByTestId('booking-card')).toHaveLength(1);
  });
});

describe('My jobs (worker)', () => {
  test('an accepted job shows the customer\'s number with a Call link; "Work done" asks first; a late cancellation warns and needs a reason', async () => {
    const soon = booking({
      status: 'accepted', scheduledStart: new Date(Date.now() + 5 * HOUR).toISOString(), actions: ['confirm_done', 'cancel'],
      contact: { visibleUntil: null, customer: { phone: '03001112222' } },
    });
    const calls = mockApi(workerRoutes({
      'GET /bookings/mine': list([soon]),
      'GET /bookings/b1': { status: 200, data: { booking: soon } },
      'POST /bookings/b1/confirm-done': { status: 200, data: { booking: { ...soon, actions: [] } } },
      'POST /bookings/b1/cancel': { status: 200, data: { booking: { ...soon, status: 'cancelled' } } },
    }));
    localStorage.setItem('dlm.tour.w1', 'done');
    renderAt('/worker/jobs');
    const user = userEvent.setup();
    const contact = await screen.findByTestId('contact-card');
    expect(within(contact).getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:03001112222');
    // (the menu's request count asks with status=requested; the page itself asks for accepted jobs)
    expect(callsTo(calls, 'GET /bookings/mine').some((c) => c.params.status === 'accepted')).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Work done' }));
    let dialog = await screen.findByRole('dialog', { name: 'Is the work finished?' });
    await user.click(within(dialog).getByRole('button', { name: 'Work done' }));
    await waitFor(() => expect(callsTo(calls, 'POST /bookings/b1/confirm-done')).toHaveLength(1));
    expect(await screen.findByText('Saved: work done')).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    dialog = await screen.findByRole('dialog', { name: 'Cancel this booking?' });
    expect(within(dialog).getByText('The work starts in less than 24 hours. A cancellation now is "late" and counts double.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel the booking' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Please choose a reason');
    expect(callsTo(calls, 'POST /bookings/b1/cancel')).toHaveLength(0);
    await user.click(within(dialog).getByRole('radio', { name: 'An emergency' }));
    await user.click(within(dialog).getByRole('button', { name: 'Cancel the booking' }));
    await waitFor(() => expect(callsTo(calls, 'POST /bookings/b1/cancel')).toHaveLength(1));
    expect(callsTo(calls, 'POST /bookings/b1/cancel')[0].body).toEqual({ reason: 'emergency' });
  });

  test('an early cancellation still reminds the worker that it counts', async () => {
    const later = booking({ status: 'accepted', actions: ['cancel'], contact: { visibleUntil: null, customer: { phone: '03001112222' } } });
    mockApi(workerRoutes({ 'GET /bookings/mine': list([later]), 'GET /bookings/b1': { status: 200, data: { booking: later } } }));
    localStorage.setItem('dlm.tour.w1', 'done');
    renderAt('/worker/jobs');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    const dialog = await screen.findByRole('dialog', { name: 'Cancel this booking?' });
    expect(within(dialog).getByText('A cancellation by you counts in your reliability record. Cancel at least a day before.')).toBeInTheDocument();
  });

  test('the no-show question: "Yes, I could not come" asks first; "I did come" sends the note to an admin', async () => {
    const asked = booking({ status: 'accepted', actions: ['respond_no_show'], noShow: { reportedAt: '2026-11-17T10:00:00Z', workerResponse: null } });
    const calls = mockApi(workerRoutes({
      'GET /bookings/mine': list([asked]),
      'GET /bookings/b1': { status: 200, data: { booking: asked } },
      'POST /bookings/b1/no-show/respond': (config, body) => ({ status: 200, data: { booking: { ...asked, noShow: { ...asked.noShow, workerResponse: body.answer } } } }),
    }));
    localStorage.setItem('dlm.tour.w1', 'done');
    renderAt('/worker/jobs');
    const user = userEvent.setup();
    expect(await screen.findByText('The customer says you did not come. Please answer within 3 days.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Yes, I could not come' }));
    let dialog = await screen.findByRole('dialog', { name: 'You could not come?' });
    await user.click(within(dialog).getByRole('button', { name: 'Yes, I could not come' }));
    await waitFor(() => expect(callsTo(calls, 'POST /bookings/b1/no-show/respond')).toHaveLength(1));
    expect(callsTo(calls, 'POST /bookings/b1/no-show/respond')[0].body).toEqual({ answer: 'admit' });

    await user.click(await screen.findByRole('button', { name: 'I did come' }));
    dialog = await screen.findByRole('dialog', { name: 'The customer says you did not come' });
    await user.type(within(dialog).getByRole('textbox', { name: /What happened/ }), 'I came at nine, test only.');
    await user.click(within(dialog).getByRole('button', { name: 'I did come' }));
    await waitFor(() => expect(callsTo(calls, 'POST /bookings/b1/no-show/respond')).toHaveLength(2));
    expect(callsTo(calls, 'POST /bookings/b1/no-show/respond')[1].body).toEqual({ answer: 'dispute', note: 'I came at nine, test only.' });
  });

  test('no accepted jobs: a plain empty state', async () => {
    mockApi(workerRoutes({ 'GET /bookings/mine': list([]) }));
    localStorage.setItem('dlm.tour.w1', 'done');
    renderAt('/worker/jobs');
    expect(await screen.findByText('No accepted jobs')).toBeInTheDocument();
  });
});

describe('My reviews (worker)', () => {
  const REVIEW = { _id: 'r1', rating: 2, onTime: 'no', workQuality: null, polite: null, priceAsAgreed: null, wouldHireAgain: 'no', comment: 'Came late [test].', reviewer: 'Sara K.', skillId: 'elec_wiring', createdAt: '2026-11-10T10:00:00Z', reply: null };
  test('reply once (the final warning is shown); report with a reason card; a refused reply shows the server words', async () => {
    let replies = 0;
    const calls = mockApi(workerRoutes({
      [`GET /workers/${CODE}/reviews`]: { status: 200, data: { reviews: [REVIEW], page: 1, limit: 10, total: 1 } },
      'POST /reviews/r1/reply': () => ((replies += 1) === 1
        ? { status: 400, data: { code: 'TEXT_HAS_CONTACT_INFO', message: 'x' } }
        : { status: 200, data: { review: { ...REVIEW, reply: { text: 'Sorry, test only.' } } } }),
      'POST /reviews/r1/report': { status: 200, data: { ok: true } },
    }));
    localStorage.setItem('dlm.tour.w1', 'done');
    renderAt('/worker/reviews');
    const user = userEvent.setup();
    expect(await screen.findByText('Came late [test].', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reply' }));
    expect(screen.getByText('You can reply only once, and the reply cannot be changed.')).toBeInTheDocument();
    const send = screen.getByRole('button', { name: 'Send the reply' });
    expect(send).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: /Your reply/ }), 'Sorry, test only.');
    await user.click(send);
    expect(await screen.findByText(/Please do not write phone numbers/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send the reply' }));
    await waitFor(() => expect(callsTo(calls, 'POST /reviews/r1/reply')).toHaveLength(2));
    expect(callsTo(calls, 'POST /reviews/r1/reply')[1].body).toEqual({ text: 'Sorry, test only.' });
    expect(await screen.findByText('Reply saved')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Report' }));
    const dialog = await screen.findByRole('dialog', { name: 'Report this review?' });
    expect(within(dialog).getByText(/Reporting does not hide the review/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('radio', { name: 'This job never happened' }));
    await user.click(within(dialog).getByRole('button', { name: 'Report' }));
    await waitFor(() => expect(callsTo(calls, 'POST /reviews/r1/report')).toHaveLength(1));
    expect(callsTo(calls, 'POST /reviews/r1/report')[0].body).toEqual({ reasonCode: 'job_did_not_happen' });
    expect(await screen.findByText('Reported. An admin will look at it.')).toBeInTheDocument();
  });
});

describe('Admin: bookings', () => {
  test('the count, the state filter and the search go into the address; a row opens the drawer with the outcome and the timeline; no phone number', async () => {
    const closed = booking({
      status: 'cancelled', outcome: 'cancelled_by_worker_late',
      timeline: [{ from: null, to: 'requested', by: 'customer', at: '2026-11-16T10:00:00Z' }, { from: 'requested', to: 'accepted', by: 'worker', at: '2026-11-16T11:00:00Z' }, { from: 'accepted', to: 'cancelled', by: 'worker', at: '2026-11-17T08:00:00Z', reason: 'emergency' }],
    });
    const calls = mockApi({
      'GET /auth/me': me('admin', { _id: 'admin1' }),
      'GET /admin/bookings': { status: 200, data: { bookings: [closed], page: 1, limit: 25, total: 1 } },
      'GET /admin/bookings/b1': { status: 200, data: { booking: closed } },
    });
    renderAt('/admin/bookings?status=cancelled');
    const user = userEvent.setup();
    expect(await screen.findByText('1 booking')).toBeInTheDocument();
    expect(callsTo(calls, 'GET /admin/bookings')[0].params).toMatchObject({ status: 'cancelled', page: '1' });

    await user.type(screen.getByRole('textbox', { name: 'Booking number, worker ID or name' }), 'BK-2026-000007');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(callsTo(calls, 'GET /admin/bookings').some((c) => c.params.q === 'BK-2026-000007')).toBe(true));

    await user.selectOptions(screen.getByRole('combobox', { name: 'State' }), 'all');
    await waitFor(() => expect(callsTo(calls, 'GET /admin/bookings').at(-1).params).toMatchObject({ status: 'all', q: 'BK-2026-000007' }));

    await user.click(await screen.findByRole('button', { name: 'Open booking BK-2026-000007' }));
    const drawer = await screen.findByRole('dialog');
    expect(await within(drawer).findByText('BK-2026-000007 · House wiring')).toBeInTheDocument();
    expect(within(drawer).getAllByText(/late/i).length).toBeGreaterThan(0);
    expect(within(drawer).getByText('Two sockets do not work.')).toBeInTheDocument();
    expect(drawer.querySelector('a[href^="tel:"], a[href*="wa.me"]')).toBeNull();
    expect(pathname()).toBe('/admin/bookings');
  });
});

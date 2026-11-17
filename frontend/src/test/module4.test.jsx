// Module 4 (Batch 6) screens: the request form, the rating form, the worker's request card with
// "Hear this request", My reputation, the public reputation section and the contact card.
// Synthetic test data only; the API is answered from a table (mockApi).
import { afterEach, describe, test, expect } from 'vitest';
import { act, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt, pathname } from './renderApp';
import { installSpeech, uninstallSpeech, VOICES } from './speechMocks';
import { LanguageProvider } from '../i18n';
import RatingBadge from '../features/reputation/RatingBadge';
import ReputationPanel from '../features/reputation/ReputationPanel';

afterEach(() => uninstallSpeech());

const CODE = 'DLM-2026-000042';
const pkt = (offsetDays) => new Date(Date.now() + 5 * 3600e3 + offsetDays * 864e5).toISOString().slice(0, 10);
const PUBLIC = {
  quick: { onTime: { yes: 3, total: 4 }, workQuality: { yes: 4, total: 4 }, polite: { yes: 0, total: 0 }, priceAsAgreed: { yes: 0, total: 0 } },
  wouldHireAgain: { yes: 9, total: 10 },
};
const WORKER = {
  workerIdCode: CODE, user: { name: 'Bilal Ahmed' }, occupation: 'Electrician', category: 'electrical_solar', city: 'Islamabad', availability: 'Busy',
  verificationStatus: 'Verified', languages: ['Urdu'], bio: '', experienceYears: 4, hourlyRate: 600, dailyRate: 0, profileCompletion: 80, workHistory: [],
  skills: [
    { skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', evidenceSummary: { status: 'self_declared' } },
    { skillId: 'elec_solar', name: 'Solar panel installation', category: 'electrical_solar', evidenceSummary: { status: 'self_declared' } },
  ],
  reputation: {
    public: { ratingAverage: 4.5, reviewCount: 4, depth: 'few', distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 2 }, ...PUBLIC, completedJobs: 5, workerCancelledEarly: 0, workerCancelledLate: 1, noShows: 0, repeatCustomers: 1, perSkill: [] },
    // never sent to customers by the server; here to prove the screen would not show it anyway
    score: { expected: 0.7391, cautious: 0.4832, uncertainty: 0.5217 },
  },
};
const REVIEWS = { reviews: [{ _id: 'r1', rating: 5, onTime: 'yes', workQuality: 'yes', polite: null, priceAsAgreed: null, wouldHireAgain: 'yes', comment: 'Fixed the wiring [test].', reviewer: 'Sara K.', skillId: 'elec_wiring', createdAt: '2026-11-10T10:00:00Z', reply: { text: 'Thank you [test].', at: '2026-11-11T10:00:00Z' } }], page: 1, limit: 10, total: 1 };
const HISTORY = { entries: [{ _id: 'h1', skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar', month: '2026-10', city: 'Islamabad', rating: 5 }], total: 1, limit: 20 };
const customerRoutes = (extra = {}) => ({
  'GET /auth/me': me('customer', { _id: 'c1' }),
  [`GET /workers/${CODE}`]: { status: 200, data: WORKER },
  [`GET /workers/${CODE}/reviews`]: { status: 200, data: REVIEWS },
  [`GET /workers/${CODE}/work-history`]: { status: 200, data: HISTORY },
  'GET /saved/ids': { status: 200, data: { ids: [], max: 100 } },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});
const booking = (extra = {}) => ({
  _id: 'b1', code: 'BK-2026-000007', status: 'requested', outcome: null, skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar',
  preferredDate: pkt(1), timeSlot: 'morning', scheduledStart: '2026-11-18T04:00:00Z', city: 'Islamabad', area: 'G-9 Markaz', description: 'Two sockets do not work.',
  worker: { name: 'Bilal Ahmed', workerIdCode: CODE }, customer: { name: 'Sara K.' }, disputeStatus: null, hasReview: false, actions: [], timeline: [], dispute: null, review: null, contact: null,
  noShow: { reportedAt: null, workerResponse: null }, createdAt: '2026-11-16T10:00:00Z', ...extra,
});
const WORKER_ME = me('worker', { _id: 'w1' });
const workerRoutes = (extra = {}) => ({
  'GET /auth/me': WORKER_ME,
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /workers/me/full': full(PROFILE, []),
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});

describe('Request this worker (customer)', () => {
  test('skill, day and time are real radio groups with pictures and help; the Busy notice; the request is sent', async () => {
    localStorage.setItem('dlm.tour.w1', 'done');
    const calls = mockApi(customerRoutes({
      'POST /bookings': (config, body) => ({ status: 201, data: { booking: booking({ ...body, _id: 'b9' }) } }),
      'GET /bookings/b9': { status: 200, data: { booking: booking({ _id: 'b9', actions: ['cancel'] }) } },
    }));
    renderAt(`/workers/${CODE}/request`);
    const user = userEvent.setup();
    const skill = await screen.findByRole('group', { name: 'Which work do you need?' });
    expect(within(skill).getAllByRole('radio').map((r) => r.closest('label').textContent)).toEqual(['House wiring', 'Solar panel installation']);
    expect(within(skill).getByRole('radio', { name: 'House wiring' })).toBeChecked();
    const day = screen.getByRole('group', { name: 'Which day?' });
    expect(within(day).getByRole('radio', { name: 'Tomorrow' })).toBeChecked();
    const time = screen.getByRole('group', { name: 'What time?' });
    expect(within(time).getAllByRole('radio')).toHaveLength(4);
    for (const group of [skill, day, time]) expect(group.querySelector(':scope > [data-assist]')).not.toBeNull();
    expect(screen.getByText('This worker is busy now')).toBeInTheDocument();
    expect(screen.getByText('Your phone number is shared with the worker only if they accept.')).toBeInTheDocument();

    await user.click(within(time).getByRole('radio', { name: 'Evening (5 pm)' }));
    await user.click(within(day).getByRole('radio', { name: 'Pick a date' }));
    expect(screen.getByLabelText(/^Date/)).toHaveAttribute('min', pkt(0));
    await user.click(within(day).getByRole('radio', { name: 'Today' }));
    await user.type(screen.getByLabelText(/^Area or sector/), 'G-9 Markaz');
    await user.click(screen.getByRole('button', { name: 'Send the request' }));
    await waitFor(() => expect(pathname()).toBe('/bookings/b9'));
    expect(calls.find((c) => c.key === 'POST /bookings').body).toEqual({ workerIdCode: CODE, skillId: 'elec_wiring', preferredDate: pkt(0), timeSlot: 'evening', city: 'Islamabad', area: 'G-9 Markaz' });
  });

  test('a phone number in the text: the server refuses it and the words are shown', async () => {
    mockApi(customerRoutes({
      'POST /bookings': { status: 400, data: { code: 'TEXT_HAS_CONTACT_INFO', message: 'x', errors: [{ field: 'area', code: 'TEXT_HAS_CONTACT_INFO' }] } },
    }));
    renderAt(`/workers/${CODE}/request`);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^Area or sector/), 'Call 0300 1234567');
    await user.click(screen.getByRole('button', { name: 'Send the request' }));
    expect((await screen.findAllByText('Please do not write phone numbers, links or ID numbers here.')).length).toBeGreaterThan(0);
  });
});

describe('Rate this work (customer)', () => {
  const routes = (extra) => customerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: booking({ status: 'completed', actions: ['review'] }) } }, ...extra });

  test('stars are one radio group (arrow keys work); thumbs; the final dialog reads the answers back before sending', async () => {
    const calls = mockApi(routes({
      'POST /bookings/b1/review': { status: 201, data: { review: { _id: 'r9' } } },
      'GET /bookings/b1': { status: 200, data: { booking: booking({ status: 'completed', actions: ['review'] }) } },
    }));
    renderAt('/bookings/b1/rate');
    const user = userEvent.setup();
    const stars = await screen.findByRole('group', { name: 'How was the work?' });
    expect(within(stars).getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByText('Reviews cannot be changed after you send them.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Check and send' }));
    expect(screen.getByText('Choose from 1 to 5 stars')).toBeInTheDocument();

    await user.click(within(stars).getByRole('radio', { name: /Good$/ }));
    await user.keyboard('{ArrowRight}');
    expect(within(stars).getByRole('radio', { name: /Very good/ })).toBeChecked();
    await user.keyboard('{ArrowLeft}');
    expect(within(stars).getAllByRole('radio')[3]).toBeChecked(); // 4 stars

    await user.click(within(screen.getByRole('group', { name: 'Did the worker come on time?' })).getByRole('radio', { name: 'Yes' }));
    await user.click(within(screen.getByRole('group', { name: 'Would you hire this worker again?' })).getByRole('radio', { name: 'No' }));
    await user.type(screen.getByLabelText(/^Comment/), 'Good wiring, a little late.');
    await user.click(screen.getByRole('button', { name: 'Check and send' }));
    const dialog = await screen.findByRole('dialog', { name: 'Send this review?' });
    expect(within(dialog).getByText('Good wiring, a little late.')).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: '4 stars' })).toBeInTheDocument();
    expect(within(dialog).getByText('Yes')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Send the review' }));
    await waitFor(() => expect(pathname()).toBe('/bookings/b1'));
    expect(calls.find((c) => c.key === 'POST /bookings/b1/review').body).toEqual({ rating: 4, onTime: 'yes', wouldHireAgain: 'no', comment: 'Good wiring, a little late.' });
  });

  test('a booking that cannot be rated says so instead of showing the form', async () => {
    mockApi(customerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: booking({ status: 'completed', hasReview: true, actions: [] }) } } }));
    renderAt('/bookings/b1/rate');
    expect(await screen.findByText('You already reviewed this work.')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'How was the work?' })).toBeNull();
  });
});

describe("The worker's requests", () => {
  test('🔊 says the composed sentence, then the customer words; Accept and Decline (with picture reasons) call the server', async () => {
    const synth = installSpeech({ voices: [VOICES.en] });
    localStorage.setItem('dlm.tour.w1', 'done');
    const calls = mockApi(workerRoutes({
      'GET /bookings/mine': { status: 200, data: { bookings: [booking({ actions: ['accept', 'decline'] })], counts: { requested: 1, accepted: 0 }, page: 1, limit: 50, total: 1 } },
      'POST /bookings/b1/accept': { status: 200, data: { booking: booking({ status: 'accepted' }) } },
      'POST /bookings/b1/decline': { status: 200, data: { booking: booking({ status: 'declined' }) } },
    }));
    renderAt('/worker/requests');
    const user = userEvent.setup();
    const card = (await screen.findAllByTestId('booking-card'))[0];
    expect(within(card).getByText('Two sockets do not work.')).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Hear this request' }));
    await waitFor(() => expect(synth.spoken.length).toBeGreaterThan(0));
    expect(synth.spoken[0].text).toBe('New work: House wiring, Tomorrow, Morning (9 am), G-9 Markaz, Islamabad.');
    act(() => synth.finish());
    await waitFor(() => expect(synth.spoken).toHaveLength(2));
    expect(synth.spoken[1].text).toBe('Written: Two sockets do not work.');

    await user.click(within(card).getByRole('button', { name: 'Decline' }));
    const dialog = await screen.findByRole('dialog', { name: 'Decline this request?' });
    expect(within(dialog).getByText('Declining never counts against you. You may choose a reason.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('radio', { name: 'Too far' }));
    await user.click(within(dialog).getByRole('button', { name: 'Decline' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /bookings/b1/decline')).toBe(true));
    expect(calls.find((c) => c.key === 'POST /bookings/b1/decline').body).toEqual({ reason: 'too_far' });
    await user.click(within((await screen.findAllByTestId('booking-card'))[0]).getByRole('button', { name: 'Accept' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /bookings/b1/accept')).toBe(true));
  });

  test('the navigation shows the number of new requests in words', async () => {
    mockApi(workerRoutes({ 'GET /bookings/mine': { status: 200, data: { bookings: [], counts: { requested: 2, accepted: 1 }, page: 1, limit: 1, total: 2 } } }));
    renderAt('/worker');
    const badges = await screen.findAllByTestId('requests-count');
    expect(badges[0]).toHaveTextContent('2');
    expect(within(badges[0]).getByText('2 new')).toBeInTheDocument();
  });
});

describe('My reputation (worker)', () => {
  test('shows how each review was counted, in words; the numbers have words next to them', async () => {
    const snapshot = {
      public: { ratingAverage: 4, reviewCount: 2, depth: 'few', distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 0 }, ...PUBLIC, completedJobs: 2, workerCancelledEarly: 0, workerCancelledLate: 0, noShows: 0, repeatCustomers: 0, perSkill: [] },
      score: { expected: 0.6522, cautious: 0.3711 }, reliability: { expected: 0.75, completed: 2 },
    };
    mockApi(workerRoutes({
      'GET /workers/me/reputation': { status: 200, data: {
        workerIdCode: 'DLM-2026-000042', snapshot, hiddenReviews: 1, cancellations: [],
        perReview: [
          { id: 'a', stars: 4, createdAt: '2026-06-01T00:00:00Z', weight: 0.42, reasons: ['months_old', 'new_reviewer'], skillId: 'elec_wiring' },
          { id: 'b', stars: 4, createdAt: '2026-11-15T00:00:00Z', weight: 0.5, reasons: ['repeat_reviewer'], skillId: 'elec_wiring' },
        ],
        rules: { lateCancelHours: 24, earlyCancelCounts: 0.5, lateCancelCounts: 1, halfLifeDays: 365, disputeWindowDays: 14 },
      } },
    }));
    renderAt('/worker/reputation');
    expect(await screen.findByText('Counted a little less: it is some months old. Counted less: this customer has not hired other workers here yet.')).toBeInTheDocument();
    expect(screen.getByText('Counted less: the same customer reviewed you before.')).toBeInTheDocument();
    expect(screen.getByText('Reputation score: 0.65 out of 1 (the middle estimate from your counted reviews).')).toBeInTheDocument();
    expect(screen.getByText(/Careful score: 0.37 out of 1/)).toBeInTheDocument();
    expect(screen.getByText('1 review is hidden by an admin and does not count.')).toBeInTheDocument();
    for (const rule of ['Only real customers', 'Newer reviews count more', 'One customer, less each time', 'Experienced customers count fully']) {
      expect(screen.getByRole('heading', { name: rule })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: /^Listen: / }).length).toBeGreaterThanOrEqual(5); // the summary and the four rules
    expect(screen.getByText('If you must cancel, cancel at least 24 hours before: a late cancellation counts double.')).toBeInTheDocument();
  });
});

describe('Public reputation (what customers see)', () => {
  test('words, counts and real stars only; never the numbers expected / cautious; reviews with replies; verified history', async () => {
    mockApi(customerRoutes());
    renderAt(`/workers/${CODE}`);
    const panel = await screen.findByTestId('reputation-panel');
    expect(within(panel).getByText('Few reviews yet')).toBeInTheDocument();
    expect(panel.textContent).toContain('★');
    expect(within(panel).getByText('4.5')).toBeInTheDocument();
    expect(panel.textContent).toContain('On time: 3 of 4'); // below 5 answers: no percentage
    expect(panel.textContent).toContain('Would hire again: 90%'); // 10 answers: a percentage
    expect(panel.textContent).toContain('5 jobs done on this platform');
    expect(panel.textContent).toContain('1 cancelled by the worker');
    expect(panel.textContent).toContain('Hired again by 1 customer');
    const page = document.body.textContent;
    for (const number of ['0.7391', '0.74', '0.4832', '0.48', '0.5217']) expect(page).not.toContain(number);
    expect(page).not.toMatch(/expected|cautious|uncertainty/i);
    expect(await screen.findByText('Sara K.')).toBeInTheDocument();
    expect(screen.getByText('Thank you [test].')).toBeInTheDocument();
    const history = screen.getByTestId('verified-history');
    expect(within(history).getByText('Done through this platform')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request this worker' })).toHaveAttribute('href', `/workers/${CODE}/request`);
  });

  test('the percentage rule: x of y below 5 answers, a percentage from 5 up', () => {
    render(<LanguageProvider initialLanguage="en"><ReputationPanel reputation={{ public: { ...WORKER.reputation.public, quick: { onTime: { yes: 4, total: 5 }, workQuality: { yes: 1, total: 4 } }, wouldHireAgain: { yes: 2, total: 2 } } }} /></LanguageProvider>);
    expect(document.body.textContent).toContain('On time: 80%');
    expect(document.body.textContent).toContain('Good work: 1 of 4');
    expect(document.body.textContent).toContain('Would hire again: 2 of 2');
  });

  test('the card line: "4.5 (4) · 5 jobs", or "New on this platform" without reviews', () => {
    const { unmount } = render(<LanguageProvider initialLanguage="en"><RatingBadge reputation={WORKER.reputation} /></LanguageProvider>);
    expect(screen.getByTestId('rating-badge').textContent).toBe('★4.5 out of 5 stars from 4 reviews4.5 (4)· 5 jobs');
    unmount();
    render(<LanguageProvider initialLanguage="en"><RatingBadge reputation={null} /></LanguageProvider>);
    expect(screen.getByTestId('rating-badge')).toHaveTextContent('New on this platform');
  });
});

describe('Booking detail and notifications', () => {
  test('the contact card has Call and WhatsApp links only when the server sends the numbers', async () => {
    const accepted = booking({ status: 'accepted', actions: ['cancel', 'confirm_done'], contact: { visibleUntil: null, worker: { phone: '03001234567', whatsapp: '03211234567', whatsappLink: 'https://wa.me/923211234567' } } });
    mockApi(customerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: accepted } } }));
    renderAt('/bookings/b1');
    const card = await screen.findByTestId('contact-card');
    expect(within(card).getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:03001234567');
    expect(within(card).getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/923211234567');
    expect(screen.getByRole('button', { name: 'Work done' })).toBeInTheDocument();
  });

  test('no numbers before acceptance: the card explains when they appear', async () => {
    mockApi(customerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: booking({ actions: ['cancel'] }) } } }));
    renderAt('/bookings/b1');
    expect(await screen.findByText('The phone number appears here when the worker accepts.')).toBeInTheDocument();
    expect(screen.queryByTestId('contact-card')).toBeNull();
  });

  test('customers have notifications too; a booking notification leads to that booking', async () => {
    mockApi(customerRoutes({
      'GET /notifications': { status: 200, data: { notifications: [{ _id: 'n1', type: 'booking_accepted', params: { bookingId: 'b1', bookingCode: 'BK-2026-000007', skillId: 'elec_wiring' }, read: false, createdAt: '2026-11-16T10:00:00Z' }], unread: 1, page: 1, limit: 20, total: 1 } },
    }));
    renderAt('/notifications');
    const link = await screen.findByRole('link', { name: /The worker accepted: House wiring/ });
    expect(link).toHaveAttribute('href', '/bookings/b1');
    expect(screen.getByText('Booking BK-2026-000007. You can now see the phone number.')).toBeInTheDocument();
  });
});

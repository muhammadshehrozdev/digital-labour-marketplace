// Batch 4 worker features: input masks (7), drafts (8), profile strength (10), potential skills
// (11), matched-word marking (12), example carousel (13, in onboarding.test), compression (14),
// crop and rotate (15), upload progress with cancel (16), Undo (17), copy ID (18), count-up (51),
// welcome tour (37).
import { describe, test, expect, vi, afterEach } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatCnic, formatMobile, formatRupees, maskStatus, plainNumber } from '../utils/masks';
import { nextRotation, outputSize } from '../utils/imageEdit';
import { prepareImage, COMPRESS_FROM_BYTES } from '../utils/imageCheck';
import { markMatches, examplesFor, EXAMPLES } from '../features/skills/skillsText';
import { readDraft, DRAFT_DELAY_MS } from '../hooks/useDraft';
import { tourSeen } from '../features/worker/tourStorage';
import CountUp from '../features/worker/CountUp';
import { MaskedField } from '../components/ui';
import { mockApi, me, onboarding, PROFILE, full, strengthOf } from './mockApi';
import { renderAt } from './renderApp';

afterEach(() => {
  vi.useRealTimers();
  delete globalThis.createImageBitmap;
});

const WORKER = me('worker', { _id: 'w1' });
const COMPLETE = onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z');
const dashRoutes = (extra = {}) => ({
  'GET /auth/me': WORKER,
  'GET /workers/me/onboarding': COMPLETE,
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /workers/me/full': full(PROFILE),
  'GET /workers/me/skills/potential': { status: 200, data: { suggestions: [{ id: 'elec_solar', name: 'Solar panel installation', category: 'electrical_solar', i18n: { ur: 'سولر پینل کی تنصیب', 'ur-Latn': 'Solar panel lagana' }, reason: 'main_trade' }], method: 'same trade category (rule-based)' } },
  ...extra,
});
const noTour = () => localStorage.setItem('dlm.tour.w1', 'done');

describe('input masks (feature 7)', () => {
  test('CNIC: digits only, grouped 5-7-1, at most 13 digits', () => {
    expect(formatCnic('3740512345671')).toBe('37405-1234567-1');
    expect(formatCnic('37405 1234567 1 999')).toBe('37405-1234567-1');
    expect(formatCnic('374')).toBe('374');
    expect(formatCnic('abc')).toBe('');
  });

  test('mobile: 03XX-XXXXXXX; +92 and 0092 become 0; a missing leading zero is added', () => {
    expect(formatMobile('03001234567')).toBe('0300-1234567');
    expect(formatMobile('+92 300 1234567')).toBe('0300-1234567');
    expect(formatMobile('00923001234567')).toBe('0300-1234567');
    expect(formatMobile('3001234567')).toBe('0300-1234567');
    expect(formatMobile('030')).toBe('030');
  });

  test('rupees: grouped, whole rupees, no leading zeros; plainNumber gives the number back', () => {
    expect(formatRupees('4500')).toBe('4,500');
    expect(formatRupees('0045')).toBe('45');
    expect(formatRupees('1,000,000')).toBe('1,000,000');
    expect(formatRupees('12.75')).toBe('12');
    expect(plainNumber('4,500')).toBe('4500');
  });

  test('live status: how many digits are missing, or that it looks right', () => {
    expect(maskStatus('cnic', '')).toEqual({ state: 'empty', message: null });
    expect(maskStatus('cnic', '37405-12')).toMatchObject({ state: 'typing', params: { count: 6 } });
    expect(maskStatus('cnic', '37405-1234567-1').state).toBe('ok');
    expect(maskStatus('mobile', '0412')).toMatchObject({ state: 'problem', message: 'workerx.masks.mobileStart' });
    expect(maskStatus('mobile', '0300-1234567').state).toBe('ok');
    expect(maskStatus('rupees', '2,000,000').state).toBe('problem');
  });

  test('MaskedField formats while typing and announces the progress politely', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [v, setV] = useState('');
      return <MaskedField mask="mobile" label="Mobile number" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    const { useState } = await import('react');
    render(<Demo />);
    await user.type(screen.getByLabelText('Mobile number'), '03001234');
    expect(screen.getByLabelText('Mobile number')).toHaveValue('0300-1234');
    expect(screen.getByText('3 more digits')).toHaveAttribute('aria-live', 'polite');
    await user.type(screen.getByLabelText('Mobile number'), '567');
    expect(screen.getByText('Mobile number looks right')).toBeInTheDocument();
  });
});

describe('autosaved drafts (feature 8)', () => {
  test('typing in the editor is kept on this device, but never the CNIC', async () => {
    noTour();
    mockApi(dashRoutes());
    const user = userEvent.setup();
    renderAt('/worker/profile/edit?section=about');
    const city = await screen.findByLabelText(/^City/);
    await user.clear(city);
    await user.type(city, 'Lahore');
    await user.type(screen.getByLabelText(/^CNIC number/), '3740512345671');
    await waitFor(() => expect(readDraft('w1', 'edit-about')?.city).toBe('Lahore'), { timeout: DRAFT_DELAY_MS + 2000 });
    const stored = JSON.stringify(readDraft('w1', 'edit-about'));
    expect(stored).not.toMatch(/37405|cnicNumber/);
  });

  test('a saved draft comes back with a toast; "Discard draft" puts the saved values back', async () => {
    noTour();
    localStorage.setItem('dlm.draft.w1.edit-about', JSON.stringify({ city: 'Multan from draft', cnicNumber: '3740512345671' }));
    mockApi(dashRoutes());
    const user = userEvent.setup();
    renderAt('/worker/profile/edit?section=about');
    await screen.findByLabelText(/^City/);
    await waitFor(() => expect(screen.getByLabelText(/^City/)).toHaveValue('Multan from draft'));
    expect(screen.getByLabelText(/^CNIC number/)).toHaveValue(''); // a CNIC in storage is ignored
    expect(screen.getByText('Draft restored')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Discard draft' }));
    expect(screen.getByLabelText(/^City/)).toHaveValue(PROFILE.city);
    expect(localStorage.getItem('dlm.draft.w1.edit-about')).toBeNull();
  });

  test('after a successful save the draft is gone', async () => {
    noTour();
    const calls = mockApi(dashRoutes({ 'PUT /workers/me': (cfg, body) => ({ status: 200, data: { profile: { ...PROFILE, ...body, user: PROFILE.user }, onboarding: COMPLETE.data } }) }));
    const user = userEvent.setup();
    renderAt('/worker/profile/edit?section=about');
    const city = await screen.findByLabelText(/^City/);
    await user.clear(city);
    await user.type(city, 'Quetta');
    await waitFor(() => expect(readDraft('w1', 'edit-about')).not.toBeNull(), { timeout: DRAFT_DELAY_MS + 2000 });
    await user.click(screen.getByRole('button', { name: 'Save personal details' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'PUT /workers/me')).toBe(true));
    await waitFor(() => expect(readDraft('w1', 'edit-about')).toBeNull(), { timeout: DRAFT_DELAY_MS + 2000 });
  });
});

describe('dashboard: strength, potential skills, copy ID, count-up (features 10, 11, 18, 51)', () => {
  test('the strength meter shows the level, the proof line, and next steps that link to the right place', async () => {
    noTour();
    mockApi(dashRoutes());
    renderAt('/worker');
    const meter = await screen.findByRole('region', { name: 'Profile strength' });
    expect(within(meter).getByText('Strong')).toBeInTheDocument();
    // the ring is labelled as the checklist, so "100%" is not read as the strength level
    expect(within(meter).getByRole('progressbar', { name: 'Profile filled in' })).toBeInTheDocument();
    expect(within(meter).getByText('Profile filled in', { selector: 'figcaption' })).toBeInTheDocument();
    expect(within(meter).getByText(/Skills with approved proof: 0/)).toBeInTheDocument();
    expect(within(meter).getByRole('link', { name: /Add a past job/ })).toHaveAttribute('href', '/worker/profile/edit?section=history');
    // "How this is counted" shows the checklist with its weights (no hidden scoring)
    await userEvent.setup().click(within(meter).getByText('How this is counted'));
    expect(within(meter).getByText(/account 20, trade 15/)).toBeInTheDocument();
  });

  test('strengthOf (test mock) uses the server shape; a complete profile with proof has no tips', () => {
    const s = strengthOf({ ...PROFILE, profileCompletion: 100, cnicOnFile: true, workHistory: [{}], skills: [{ skillId: 'a', name: 'A', evidenceSummary: { approved: 1 } }] });
    expect(s).toMatchObject({ percent: 100, level: 'complete', tips: [] });
  });

  test('one tap adds a potential skill as "related"; Undo removes it again', async () => {
    noTour();
    const calls = mockApi(dashRoutes({
      'POST /workers/me/skills': (cfg, body) => ({ status: 201, data: { skills: [...PROFILE.skills, { skillId: body.skillIds[0], name: 'Solar panel installation', category: 'electrical_solar', addedVia: body.addedVia }], onboarding: COMPLETE.data } }),
      'DELETE /workers/me/skills/elec_solar': { status: 200, data: { skills: PROFILE.skills, onboarding: COMPLETE.data } },
    }));
    const user = userEvent.setup();
    renderAt('/worker');
    const box = await screen.findByRole('region', { name: 'You may also do…' });
    expect(within(box).getByText(/Nothing is added without your tap/)).toBeInTheDocument();
    await user.click(within(box).getByRole('button', { name: 'Add Solar panel installation' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'POST /workers/me/skills')?.body).toEqual({ skillIds: ['elec_solar'], addedVia: 'related' }));
    expect(await screen.findByText('Solar panel installation added to your profile')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'DELETE /workers/me/skills/elec_solar')).toBe(true));
  });

  test('copy ID: copies the worker ID and confirms', async () => {
    noTour();
    mockApi(dashRoutes());
    renderAt('/worker');
    const button = await screen.findByRole('button', { name: 'Copy worker ID' });
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await user.click(button);
    expect(writeText).toHaveBeenCalledWith('DLM-2026-000042');
    expect(await screen.findByText('Worker ID copied')).toBeInTheDocument();
  });

  test('count-up: the real number is always in the page for screen readers; reduced motion shows it at once', () => {
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
    const { container } = render(<CountUp value={7} />);
    expect(container.textContent).toBe('77'); // visible + screen-reader copy, both final
    delete window.matchMedia;
  });
});

describe('welcome tour (feature 37)', () => {
  test('shown once on the first dashboard visit; skippable; then remembered', async () => {
    mockApi(dashRoutes());
    const user = userEvent.setup();
    renderAt('/worker');
    const card = await screen.findByRole('dialog', { name: 'Your profile strength' }, { timeout: 3000 });
    expect(within(card).getByText(/1 of 4/)).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('dialog', { name: 'Skills you may also have' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Skip the tour' })[0]);
    expect(screen.queryByTestId('welcome-tour')).toBeNull();
    expect(tourSeen('w1')).toBe(true);
  });

  test('Escape closes it, and a remembered tour does not come back', async () => {
    mockApi(dashRoutes());
    const user = userEvent.setup();
    const first = renderAt('/worker');
    await screen.findByRole('dialog', { name: 'Your profile strength' }, { timeout: 3000 });
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('welcome-tour')).toBeNull();
    first.unmount();
    renderAt('/worker');
    await screen.findByRole('region', { name: 'Profile strength' });
    await new Promise((r) => setTimeout(r, 400));
    expect(screen.queryByTestId('welcome-tour')).toBeNull();
  });
});

describe('matched words marked inside the text (feature 12)', () => {
  test('markMatches: longest words first, any letter case, literal characters', () => {
    expect(markMatches('I do House wiring and wiring', ['wiring', 'house wiring']).filter((p) => p.match).map((p) => p.text)).toEqual(['House wiring', 'wiring']);
    expect(markMatches('سولر پینل اور وائرنگ', ['وائرنگ']).filter((p) => p.match).map((p) => p.text)).toEqual(['وائرنگ']);
    expect(markMatches('a+b (c)', ['(c']).filter((p) => p.match).map((p) => p.text)).toEqual(['(c']);
    expect(markMatches('', ['x'])).toEqual([{ text: '', match: false }]);
  });

  test('after "Find my skills" the matched words are marked in a copy under the text box', async () => {
    const extract = { skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', matched: ['wiring'], alreadySaved: false }], categories: [{ id: 'electrical_solar', label: 'Electrical & Solar', matched: ['wiring'], skillIds: ['elec_wiring'] }], suggestedCategory: 'electrical_solar', categoryTie: false, suggestedOccupation: 'Electrician', experience: null, method: 'rule-based word list' };
    mockApi({ 'GET /auth/me': WORKER, 'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: false }), 'GET /workers/me': { status: 200, data: { ...PROFILE, skills: [] } }, 'GET /workers/me/skills': { status: 200, data: { skills: [] } }, 'POST /workers/me/skills/extract': { status: 200, data: extract } });
    const user = userEvent.setup();
    renderAt('/onboarding/skills');
    await user.type(await screen.findByLabelText(/what work do you do/), 'I do wiring work');
    expect(screen.queryByTestId('highlight-mirror')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Find my skills' }));
    const mirror = await screen.findByTestId('highlight-mirror');
    expect(mirror).toHaveAttribute('aria-hidden', 'true');
    expect(mirror.querySelector('mark')).toHaveTextContent('wiring');
    expect(screen.getByLabelText(/what work do you do/)).toHaveAccessibleDescription(/Marked words are the ones the word list matched/);
  });

  test('the carousel order starts with the website language and has every example once', () => {
    expect(examplesFor('ur')[0].lang).toBe('ur');
    expect(examplesFor('ur-Latn')[0].lang).toBe('ur-Latn');
    expect(new Set(examplesFor('en').map((e) => e.id)).size).toBe(EXAMPLES.length);
  });
});

describe('upload: compression, crop and rotate, progress with cancel (features 14, 15, 16)', () => {
  const JPEG = [0xff, 0xd8, 0xff, 0xe0];
  const jpeg = (size) => { const b = new Uint8Array(size); b.set(JPEG); return new File([b], 'big.jpg', { type: 'image/jpeg' }); };

  test('a photo above 1 MB is made smaller when the browser can; small photos are left alone', async () => {
    expect(await prepareImage(jpeg(2000))).toEqual({ file: expect.any(File) });
    // jsdom has no canvas: the 2 MB photo stays as it is (still below the 4 MB limit)
    const big = await prepareImage(jpeg(COMPRESS_FROM_BYTES * 2));
    expect(big.shrunk).toBeUndefined();
    expect(big.file.size).toBe(COMPRESS_FROM_BYTES * 2);
  });

  test('rotation and crop maths', () => {
    expect(nextRotation(0, -90)).toBe(270);
    expect(nextRotation(270, 90)).toBe(0);
    expect(outputSize(400, 300, 0, { left: 0, right: 0, top: 0, bottom: 0 })).toEqual({ width: 400, height: 300 });
    expect(outputSize(400, 300, 90, { left: 0.1, right: 0.1, top: 0, bottom: 0.5 })).toEqual({ width: 240, height: 200 });
    expect(outputSize(400, 300, 0, { left: 0.45, right: 0.45, top: 0.45, bottom: 0.45 })).toEqual({ width: 40, height: 30 });
  });

  const proofRoutes = (extra = {}) => dashRoutes({ 'GET /evidence/mine': { status: 200, data: { evidence: [] } }, ...extra });

  test('the proof form tells the worker how to take the photo, and offers crop or rotate', async () => {
    noTour();
    mockApi(proofRoutes());
    const user = userEvent.setup();
    renderAt('/worker/profile/edit?section=proof');
    const form = await screen.findByRole('form', { name: /proof/i });
    expect(within(form).getByText('Take a clear photo of your certificate')).toBeInTheDocument();
    await user.upload(within(form).getByLabelText(/^Photo/), jpeg(3000));
    await user.click(await within(form).findByRole('button', { name: 'Crop or rotate' }));
    const editor = await screen.findByRole('dialog', { name: 'Crop or rotate the photo' });
    // no canvas in this test browser: the editor says so and the photo can still be uploaded
    expect(within(editor).getByText(/could not change the photo/)).toBeInTheDocument();
    expect(within(editor).getByRole('button', { name: 'Use this photo' })).toBeDisabled();
  });

  test('crop sliders and turn buttons are keyboard controls when the browser can edit', async () => {
    globalThis.createImageBitmap = vi.fn(() => Promise.resolve({ width: 400, height: 300 }));
    const { default: ImageEditor } = await import('../components/ui/ImageEditor');
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
    render(<ImageEditor file={jpeg(100)} onClose={() => {}} onApply={() => {}} />);
    const sliders = await screen.findAllByRole('slider');
    expect(sliders.map((s) => s.getAttribute('aria-label') ?? s.closest('label').textContent)).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Rotate left' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rotate right' })).toBeInTheDocument();
    // native range inputs: the browser moves them with the arrow keys; here the change itself is checked
    expect(sliders.every((s) => s.tagName === 'INPUT' && s.type === 'range')).toBe(true);
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(sliders[0], { target: { value: '12' } });
    expect(sliders[0]).toHaveValue('12');
    expect(sliders[0]).toHaveAttribute('aria-valuetext', '12%');
  });

  test('an upload in progress can be cancelled; nothing is saved and the worker is told', async () => {
    noTour();
    mockApi(proofRoutes({
      'POST /evidence': (config) => new Promise((resolve, reject) => {
        config.onUploadProgress?.({ loaded: 30, total: 100 });
        config.signal?.addEventListener('abort', () => reject(Object.assign(new Error('canceled'), { code: 'ERR_CANCELED', name: 'CanceledError' })));
      }),
    }));
    const user = userEvent.setup();
    renderAt('/worker/profile/edit?section=proof');
    const form = await screen.findByRole('form', { name: /proof/i });
    await user.selectOptions(within(form).getByLabelText(/^Which skill/), 'elec_wiring');
    await user.click(within(form).getByRole('radio', { name: /Work photo/ }));
    await user.upload(within(form).getByLabelText(/^Photo/), jpeg(3000));
    await user.click(within(form).getByRole('checkbox', { name: /I own this photo/ }));
    await user.click(within(form).getByRole('button', { name: /Upload proof/ }));
    expect(await within(form).findByRole('progressbar', { name: /Uploading/ })).toHaveAttribute('aria-valuenow', '30');
    await user.click(within(form).getByRole('button', { name: 'Cancel upload' }));
    expect(await within(form).findByText('Upload cancelled. Nothing was saved.')).toBeInTheDocument();
    expect(within(form).queryByRole('progressbar')).toBeNull();
  });
});

describe('Undo after removing a skill (feature 17)', () => {
  test('a skill without proof can be put back with one tap', async () => {
    noTour();
    const skill = { skillId: 'plumb_geyser', name: 'Geyser installation', category: 'plumbing_sanitary', addedVia: 'manual', custom: false, evidenceSummary: { status: 'self_declared', approved: 0, pending: 0 } };
    const calls = mockApi(dashRoutes({
      'GET /workers/me/skills': { status: 200, data: { skills: [skill], onboarding: COMPLETE.data } },
      'DELETE /workers/me/skills/plumb_geyser': { status: 200, data: { skills: [], onboarding: COMPLETE.data } },
      'POST /workers/me/skills': (cfg, body) => ({ status: 201, data: { skills: [{ ...skill, addedVia: body.addedVia }], onboarding: COMPLETE.data } }),
    }));
    const user = userEvent.setup();
    renderAt('/worker/profile/edit?section=skills');
    await user.click(await screen.findByRole('button', { name: /Remove Geyser installation/ }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Remove this skill?' })).getByRole('button', { name: /Remove/ }));
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'POST /workers/me/skills')?.body).toEqual({ skillIds: ['plumb_geyser'], addedVia: 'manual' }));
  });

  test('a skill whose proof was deleted with it gets no Undo (the proof cannot come back)', async () => {
    noTour();
    const skill = { skillId: 'plumb_geyser', name: 'Geyser installation', category: 'plumbing_sanitary', addedVia: 'manual', custom: false, evidenceSummary: { status: 'evidence_pending', approved: 0, pending: 1 } };
    mockApi(dashRoutes({
      'GET /workers/me/skills': { status: 200, data: { skills: [skill], onboarding: COMPLETE.data } },
      'DELETE /workers/me/skills/plumb_geyser': { status: 200, data: { skills: [], onboarding: COMPLETE.data } },
    }));
    const user = userEvent.setup();
    renderAt('/worker/profile/edit?section=skills');
    await user.click(await screen.findByRole('button', { name: /Remove Geyser installation/ }));
    await user.click(within(await screen.findByRole('dialog', { name: 'Remove this skill?' })).getByRole('button', { name: /Remove/ }));
    expect(await screen.findByText(/Geyser installation" removed/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
  });
});

// keep the act import used (React warns otherwise in some versions)
void act;

describe('milestone confetti (feature 52)', () => {
  test('each milestone is celebrated once per account, with its own look', async () => {
    const { milestoneToCelebrate, markCelebrated } = await import('../features/worker/milestones');
    expect(milestoneToCelebrate('u9', { level: 'strong', approved: 0 })).toBeNull();
    expect(milestoneToCelebrate('u9', { level: 'strong', approved: 1 })).toEqual({ id: 'firstApproved', variant: 'ribbons' });
    markCelebrated('u9', 'firstApproved');
    expect(milestoneToCelebrate('u9', { level: 'strong', approved: 2 })).toBeNull();
    expect(milestoneToCelebrate('u9', { level: 'complete', approved: 2 })).toEqual({ id: 'complete', variant: 'stars' });
    markCelebrated('u9', 'complete');
    expect(milestoneToCelebrate('u9', { level: 'complete', approved: 2 })).toBeNull();
    expect(milestoneToCelebrate(undefined, { level: 'complete', approved: 1 })).toBeNull();
  });

  test('the confetti draws nothing with reduced motion', async () => {
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
    const { default: Confetti } = await import('../components/motion/Confetti');
    const { container } = render(<Confetti variant="stars" />);
    expect(container.querySelector('canvas')).toBeNull();
    delete window.matchMedia;
  });
});

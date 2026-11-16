// Module 3 screens (Phase 6 tests): upload form, client file checks, onboarding Step 4,
// worker proof list, admin Evidence review, and customer privacy (no evidence images).
import { describe, test, expect } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt, pathname, currentSearch } from './renderApp';
import en from '../i18n/dictionaries/en';

// The browser checks use the server's error codes; these are their English texts.
const MSG_NOT_IMAGE = en.errors.PHOTO_NOT_IMAGE;
const MSG_NOT_JPG_PNG = en.errors.PHOTO_NOT_JPG_PNG;
const MSG_PDF = en.errors.PHOTO_PDF;
const MSG_TOO_LARGE = en.errors.PHOTO_TOO_LARGE;

const JPEG_HEAD = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46];
const jpegFile = (name = 'job.jpg', size = 2048) => {
  const bytes = new Uint8Array(size);
  bytes.set(JPEG_HEAD);
  return new File([bytes], name, { type: 'image/jpeg' });
};
const textFile = () => new File(['just some text, not a photo'], 'notes.jpg', { type: 'image/jpeg' });
const pdfFile = () => new File(['%PDF-1.4 fake'], 'certificate.pdf', { type: 'application/pdf' });
const gifFile = () => new File(['GIF89a....'], 'animation.gif', { type: 'image/gif' });
const heicFile = () => new File([new Uint8Array([0, 0, 0, 0x18, ...'ftypheic'.split('').map((c) => c.charCodeAt(0)), 0, 0, 0, 0])], 'IMG_0001.HEIC', { type: 'image/heic' });

const COMPLETE = onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z');
const SKILLS = [
  { skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', addedVia: 'manual', custom: false, evidenceSummary: { status: 'verified', approved: 1, pending: 0, strength: 'moderate' } },
  { skillId: 'elec_solar', name: 'Solar panel installation', category: 'electrical_solar', addedVia: 'manual', custom: false, evidenceSummary: { status: 'evidence_pending', approved: 0, pending: 1, strength: 'none' } },
];
const ITEMS = [
  { _id: 'e1', skillId: 'elec_wiring', skillName: 'House wiring', type: 'certificate', title: 'Wiring course', status: 'approved', reasonCode: null, reviewNote: '', createdAt: '2026-11-08T10:00:00Z' },
  { _id: 'e2', skillId: 'elec_solar', skillName: 'Solar panel installation', type: 'work_photo', title: '', status: 'pending', reasonCode: null, reviewNote: '', createdAt: '2026-11-09T10:00:00Z' },
  { _id: 'e3', skillId: 'elec_wiring', skillName: 'House wiring', type: 'work_photo', title: 'Blurry one', status: 'rejected', reasonCode: 'unclear', reviewNote: 'Photo is unclear', createdAt: '2026-11-07T10:00:00Z' },
  { _id: 'e4', skillId: 'elec_wiring', skillName: 'House wiring', type: 'certificate', title: 'Odd certificate', status: 'suspected_fake', reasonCode: null, reviewNote: 'Issuer has no such certificate', createdAt: '2026-11-06T10:00:00Z' },
];

const proofStepRoutes = (extra = {}) => ({
  'GET /auth/me': me('worker'),
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }),
  'GET /workers/me': { status: 200, data: { ...PROFILE, skills: [SKILLS[0]] } },
  'GET /evidence/mine': { status: 200, data: { evidence: [] } },
  ...extra,
});

async function fillUploadForm(user, { file = jpegFile(), consent = true } = {}) {
  await user.click(within(await screen.findByRole('group', { name: /Which skill does this photo prove/ })).getByRole('radio', { name: 'House wiring' }));
  await user.click(screen.getByRole('radio', { name: /Work photo/ }));
  if (file) await user.upload(screen.getByLabelText(/^Photo/), file);
  if (consent) await user.click(screen.getByRole('checkbox', { name: /I own this photo/ }));
}

describe('evidence upload form', () => {
  test('requires the consent checkbox: nothing is sent without it', async () => {
    const calls = mockApi(proofStepRoutes());
    renderAt('/onboarding/proof');
    const user = userEvent.setup();
    await fillUploadForm(user, { consent: false });
    await user.click(screen.getByRole('button', { name: 'Upload proof' }));
    expect(await screen.findByText('Please tick the consent box before uploading.')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'POST /evidence')).toBe(false);
  });

  test.each([
    ['a text file named .jpg', textFile, MSG_NOT_IMAGE],
    ['a PDF', pdfFile, MSG_PDF],
    ['a HEIC photo', heicFile, MSG_NOT_JPG_PNG],
    ['a GIF', gifFile, MSG_NOT_JPG_PNG],
    ['a 5 MB photo (cannot be shrunk here)', () => jpegFile('huge.jpg', 5 * 1024 * 1024), MSG_TOO_LARGE],
  ])('rejects %s in the browser with the server\'s message, before any upload', async (_label, makeFile, message) => {
    const calls = mockApi(proofStepRoutes());
    renderAt('/onboarding/proof');
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(await screen.findByLabelText(/^Photo/), makeFile());
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Photo/)).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'Upload proof' }));
    expect(calls.some((c) => c.key === 'POST /evidence')).toBe(false);
  });

  test('a photo can also be dropped on the drop zone, and removed again', async () => {
    mockApi(proofStepRoutes());
    renderAt('/onboarding/proof');
    const zone = (await screen.findByText('Choose a photo')).closest('label');
    fireEvent.drop(zone, { dataTransfer: { files: [jpegFile('dropped.jpg')] } });
    expect(await screen.findByText('dropped.jpg')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove this photo' }));
    expect(screen.queryByText('dropped.jpg')).toBeNull();
    expect(screen.getByText('Choose a photo')).toBeInTheDocument();
  });

  test('the file input stays reachable by keyboard and has a label and hint', async () => {
    mockApi(proofStepRoutes());
    renderAt('/onboarding/proof');
    const input = await screen.findByLabelText(/^Photo/);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    expect(input).not.toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAccessibleDescription(/Location data inside the photo is removed/);
  });
});

describe('onboarding Step 4 (real upload)', () => {
  test('after an upload the new item appears as "Pending review", and the button becomes "Continue"', async () => {
    let uploaded = [];
    const calls = mockApi(proofStepRoutes({
      'GET /evidence/mine': () => ({ status: 200, data: { evidence: uploaded } }),
      'POST /evidence': (cfg, body) => {
        uploaded = [{ _id: 'new1', skillId: body.skillId, skillName: 'House wiring', type: body.type, title: '', status: 'pending', reasonCode: null, reviewNote: '', createdAt: '2026-11-09T12:00:00Z' }];
        return { status: 201, data: { evidence: uploaded[0], skill: { skillId: body.skillId, evidenceSummary: { status: 'evidence_pending', approved: 0, pending: 1, strength: 'none' } } } };
      },
    }));
    renderAt('/onboarding/proof');
    const user = userEvent.setup();
    expect(await screen.findByRole('button', { name: 'Skip for now' })).toBeInTheDocument();
    await fillUploadForm(user);
    await user.click(screen.getByRole('button', { name: 'Upload proof' }));

    expect(await screen.findByText('Photo uploaded')).toBeInTheDocument();
    const list = await screen.findByRole('list', { name: 'Proof for House wiring' });
    expect(within(list).getByText('Pending review')).toBeInTheDocument();
    expect(screen.getByText('Evidence pending')).toBeInTheDocument(); // the skill chip changed
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();

    const post = calls.find((c) => c.key === 'POST /evidence');
    expect(post.body).toMatchObject({ skillId: 'elec_wiring', type: 'work_photo', consent: 'true' });
    expect(post.body.image).toBeInstanceOf(File);
  });

  test('a server error is shown in the form (e.g. duplicate photo)', async () => {
    mockApi(proofStepRoutes({ 'POST /evidence': { status: 409, data: { message: 'You already uploaded this photo for this skill.' } } }));
    renderAt('/onboarding/proof');
    const user = userEvent.setup();
    await fillUploadForm(user);
    await user.click(screen.getByRole('button', { name: 'Upload proof' }));
    expect(await screen.findByText('You already uploaded this photo for this skill.')).toBeInTheDocument();
  });
});

describe('worker proof list (profile editor, Proof of skills; D-020)', () => {
  const PAGE = '/worker/profile/edit?section=proof';
  const routes = (extra = {}) => ({
    'GET /auth/me': me('worker'),
    'GET /workers/me/onboarding': COMPLETE,
    'GET /workers/me/full': full({ ...PROFILE, skills: SKILLS }, ITEMS),
    ...extra,
  });

  test('each skill shows its chip, "Evidence: N approved", the strength label, and items with status and reason; no percentages', async () => {
    mockApi(routes());
    renderAt(PAGE);
    const wiring = await screen.findByRole('list', { name: 'Proof for House wiring' });
    const card = wiring.closest('li');
    expect(within(card).getByText('Verified by evidence')).toBeInTheDocument();
    expect(within(card).getByText('Evidence: 1 approved')).toBeInTheDocument();
    expect(within(card).getByText('Strength: Moderate')).toBeInTheDocument();
    expect(within(wiring).getByText('Reason: Photo is unclear')).toBeInTheDocument();
    expect(within(wiring).getByText('Suspected fake')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\d+\s*%/);
  });

  test('delete is offered only for pending or rejected items (never for approved or suspected fake)', async () => {
    mockApi(routes());
    renderAt(PAGE);
    await screen.findByRole('list', { name: 'Proof for House wiring' });
    expect(screen.getByRole('button', { name: 'Delete Blurry one' })).toBeInTheDocument(); // rejected
    expect(screen.getByRole('button', { name: 'Delete Work photo' })).toBeInTheDocument(); // pending, no title
    expect(screen.queryByRole('button', { name: 'Delete Wiring course' })).toBeNull(); // approved
    expect(screen.queryByRole('button', { name: 'Delete Odd certificate' })).toBeNull(); // suspected fake
  });

  test('deleting asks first, then calls DELETE /evidence/:id', async () => {
    const calls = mockApi(routes({ 'DELETE /evidence/e3': { status: 200, data: { message: 'Proof deleted.' } } }));
    renderAt(PAGE);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Delete Blurry one' }));
    expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(false);
    await user.click(within(screen.getByRole('dialog', { name: 'Delete this proof?' })).getByRole('button', { name: 'Delete proof' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'DELETE /evidence/e3')).toBe(true));
  });

  test('"Add proof" for a skill chooses that skill in the upload form (no top-menu link needed)', async () => {
    mockApi(routes());
    renderAt(PAGE);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Add proof for Solar panel installation' }));
    await waitFor(() => expect(within(screen.getByRole('group', { name: /Which skill does this photo prove/ })).getByRole('radio', { name: 'Solar panel installation' })).toBeChecked());
    expect(pathname()).toBe('/worker/profile/edit');
    expect(currentSearch()).toContain('skill=elec_solar');
  });
});

describe('admin Evidence review', () => {
  const ITEM = {
    _id: 'e9', worker: { _id: 'u2', name: 'Rashid Mehmood' }, workerIdCode: 'DLM-2026-000042', skillId: 'elec_wiring', skillName: 'House wiring',
    type: 'certificate', title: 'Wiring course', status: 'pending', reasonCode: null, reviewNote: '', createdAt: '2026-11-09T10:00:00Z',
    width: 800, height: 600, size: 51200, possibleDuplicateOf: 'e7', duplicateKind: 'similar', duplicateDistance: 4, allowedActions: ['approve', 'reject', 'suspected_fake'],
  };
  const DUP = { ...ITEM, _id: 'e7', worker: { _id: 'u3', name: 'Other Worker' }, workerIdCode: 'DLM-2026-000007', possibleDuplicateOf: null, duplicateKind: null };
  const OPINION = { method: 'Beta evidence counting in subjective-logic form (W = 2, a = 0.5)', r: 0, s: 0, belief: 0, disbelief: 0, uncertainty: 1, expected: 0.5, status: 'evidence_pending', strength: 'none' };
  const routes = (extra = {}) => ({
    'GET /auth/me': me('admin'),
    'GET /admin/evidence': { status: 200, data: { evidence: [ITEM], page: 1, limit: 25, total: 1 } },
    'GET /admin/evidence/e9': { status: 200, data: { evidence: ITEM, duplicate: DUP, opinion: OPINION } },
    ...extra,
  });

  async function openDrawer(user) {
    await user.click(await screen.findByRole('button', { name: 'Review proof from Rashid Mehmood for House wiring' }));
    return screen.findByRole('dialog', { name: /House wiring/ });
  }

  test('the drawer shows the image, the possible duplicate in a compare slider, and b, d, u, E with the method', async () => {
    mockApi(routes());
    renderAt('/admin/evidence');
    const user = userEvent.setup();
    const drawer = await openDrawer(user);
    expect(await within(drawer).findByRole('img', { name: 'Proof for House wiring' })).toHaveAttribute('src', '/api/evidence/e9/file');
    expect(within(drawer).getByRole('img', { name: 'Possible duplicate from Other Worker' })).toHaveAttribute('src', '/api/evidence/e7/file');
    expect(within(drawer).getByText(/Looks like another worker's photo/)).toBeInTheDocument();
    expect(within(drawer).getByText('uncertainty u')).toBeInTheDocument();
    expect(within(drawer).getByText(/How this is computed/)).toBeInTheDocument();
    // Batch 4 (feature 34): the two photos lie on top of each other with a slider, or side by side.
    expect(within(drawer).getByRole('slider', { name: 'Slide to compare this upload with the earlier photo' })).toBeInTheDocument();
    await user.click(within(drawer).getByRole('button', { name: 'Side by side' }));
    expect(within(drawer).getAllByRole('figure')).toHaveLength(2);
  });

  test.each([
    ['Reject', 'Reject this proof', 'Choose a reason.'],
    ['Suspected fake', 'Mark as suspected fake', 'A written reason (at least 5 characters) is required.'],
  ])('%s requires a reason: nothing is sent without it', async (button, dialogTitle, message) => {
    const calls = mockApi(routes());
    renderAt('/admin/evidence');
    const user = userEvent.setup();
    const drawer = await openDrawer(user);
    await user.click(await within(drawer).findByRole('button', { name: button }));
    const dialog = screen.getByRole('dialog', { name: dialogTitle });
    await user.click(within(dialog).getByRole('button', { name: button }));
    expect(within(dialog).getByText(message)).toBeInTheDocument();
    expect(calls.some((c) => c.key.startsWith('PATCH /admin'))).toBe(false);
  });

  test('Revoke requires a written reason too (on an approved item)', async () => {
    const approved = { ...ITEM, status: 'approved', allowedActions: ['suspected_fake', 'revoke'] };
    const calls = mockApi(routes({ 'GET /admin/evidence/e9': { status: 200, data: { evidence: approved, duplicate: null, opinion: OPINION } } }));
    renderAt('/admin/evidence');
    const user = userEvent.setup();
    const drawer = await openDrawer(user);
    expect(within(drawer).queryByRole('button', { name: 'Approve' })).toBeNull(); // only allowed actions are shown
    await user.click(await within(drawer).findByRole('button', { name: 'Revoke approval' }));
    const dialog = screen.getByRole('dialog', { name: 'Revoke the approval' });
    await user.click(within(dialog).getByRole('button', { name: 'Revoke approval' }));
    expect(within(dialog).getByText('A written reason (at least 5 characters) is required.')).toBeInTheDocument();
    expect(calls.some((c) => c.key.startsWith('PATCH /admin'))).toBe(false);
  });

  test('with a reason the decision is sent; approve needs only a confirmation', async () => {
    const calls = mockApi(routes({ 'PATCH /admin/evidence/e9': { status: 200, data: { evidence: { ...ITEM, status: 'rejected' } } } }));
    renderAt('/admin/evidence');
    const user = userEvent.setup();
    const drawer = await openDrawer(user);
    await user.click(await within(drawer).findByRole('button', { name: 'Reject' }));
    const dialog = screen.getByRole('dialog', { name: 'Reject this proof' });
    await user.selectOptions(within(dialog).getByLabelText(/^Reason/), 'unclear');
    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PATCH /admin/evidence/e9')?.body).toEqual({ action: 'reject', reasonCode: 'unclear' }));
    expect(await screen.findByText('Reject: saved')).toBeInTheDocument();
  });

  test('the queue filters are sent to the server, and the sidebar has "Evidence review"', async () => {
    const calls = mockApi(routes());
    renderAt('/admin/evidence');
    const user = userEvent.setup();
    expect(await screen.findByRole('link', { name: 'Evidence review' })).toHaveAttribute('aria-current', 'page');
    await user.selectOptions(screen.getByLabelText('Type'), 'certificate');
    await user.click(screen.getByRole('switch', { name: 'Possible duplicates only' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'GET /admin/evidence' && c.params.type === 'certificate' && c.params.duplicates === 'true' && c.params.status === 'pending')).toBe(true));
  });
});

describe('customers never see evidence images or private data', () => {
  const WORKER = {
    _id: 'p1', workerIdCode: 'DLM-2026-000042', occupation: 'Electrician', category: 'electrical_solar', city: 'Rawalpindi',
    experienceYears: 6, hourlyRate: 800, dailyRate: 4000, availability: 'Available', verificationStatus: 'Verified', languages: ['Urdu'],
    user: { name: 'Rashid Mehmood' }, skills: SKILLS.map(({ skillId, name, category, evidenceSummary }) => ({ skillId, name, category, custom: false, evidenceSummary })),
    // Even if a buggy server sent these, they must not appear:
    cnicNumber: '37405-1234567-1', email: 'rashid@example.com', address: 'Satellite Town', phone: '03001234567', fileId: 'f1',
  };

  test('directory card: verified skill marked, no <img>, no private fields', async () => {
    const calls = mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [WORKER], page: 1, limit: 12, total: 1 } } });
    const { container } = renderAt('/find');
    const card = await screen.findByTestId('worker-card');
    expect(within(card).getByText('(verified by evidence)')).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(0);
    for (const s of ['37405', 'rashid@example.com', 'Satellite Town', '03001234567', '/evidence/']) expect(container.innerHTML).not.toContain(s);
    await userEvent.setup().click(screen.getAllByRole('switch', { name: 'Verified skills only' })[0]);
    await waitFor(() => expect(calls.some((c) => c.key === 'GET /workers' && c.params.skills === 'verified')).toBe(true));
  });

  test('public profile: chips, "Evidence: N approved" and strength per skill, but no images', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers/DLM-2026-000042': { status: 200, data: WORKER } });
    const { container } = renderAt('/workers/DLM-2026-000042');
    expect(await screen.findByText('Verified by evidence')).toBeInTheDocument();
    expect(screen.getByText('Evidence: 1 approved')).toBeInTheDocument();
    expect(screen.getByText('Strength: Moderate')).toBeInTheDocument();
    expect(screen.getByText('Evidence pending')).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(0);
    for (const s of ['37405', 'rashid@example.com', 'Satellite Town', '03001234567', '/evidence/']) expect(container.innerHTML).not.toContain(s);
  });
});

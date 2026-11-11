// Guided worker onboarding (D-011, Batch 1 Part 5.2) and the Module 2 skills step.
import { describe, test, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt, pathname } from './renderApp';

const EMPTY = { about: false, work: false, skills: false };
const ABOUT_DONE = { about: true, work: false, skills: false };
const WORK_DONE = { about: true, work: true, skills: false };

const EXTRACT_RESULT = {
  skills: [
    { skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', matched: ['wiring'], alreadySaved: false },
    { skillId: 'elec_solar', name: 'Solar panel installation', category: 'electrical_solar', matched: ['solar'], alreadySaved: false },
  ],
  categories: [{ id: 'electrical_solar', label: 'Electrical & Solar', matched: ['wiring', 'solar'], skillIds: ['elec_wiring', 'elec_solar'] }],
  suggestedCategory: 'electrical_solar',
  categoryTie: false,
  suggestedOccupation: 'Electrician',
  experience: { years: 6, months: 0 },
  experienceNote: null,
  noSkillReason: null,
  method: 'rule-based word list',
};

describe('onboarding steps', () => {
  test('an empty profile starts at step 1 "About you", with a stepper showing step 1 of 5', async () => {
    mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': onboarding(EMPTY), 'GET /workers/me': { status: 404, data: {} } });
    renderAt('/worker');
    expect(await screen.findByRole('heading', { level: 1, name: 'About you' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/about');
    const stepper = screen.getByRole('navigation', { name: 'Onboarding steps' });
    expect(within(stepper).getByText(/Step 1 of 5/)).toBeInTheDocument();
    expect(stepper.querySelector('[aria-current="step"]')).toHaveTextContent('About you');
    expect(screen.getByText('Only verified admins can see your CNIC. It is stored encrypted.')).toBeInTheDocument();
  });

  test('later steps cannot be skipped: /onboarding/skills with work not done -> "Your work"', async () => {
    mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': onboarding(ABOUT_DONE), 'GET /workers/me': { status: 200, data: { ...PROFILE, occupation: '', category: null, skills: [] } } });
    renderAt('/onboarding/skills');
    expect(await screen.findByRole('heading', { level: 1, name: 'Your work' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/work');
  });

  test('saving step 1 moves to step 2 by itself (after a "Saved" toast)', async () => {
    const calls = mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me/onboarding': onboarding(EMPTY),
      'GET /workers/me': { status: 404, data: {} },
      'PUT /workers/me': (cfg, body) => ({ status: 200, data: { profile: { ...PROFILE, ...body, user: { name: body.name, phone: body.phone }, skills: [] }, onboarding: onboarding(ABOUT_DONE).data } }),
    });
    renderAt('/onboarding/about');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^City/), 'Rawalpindi');
    await user.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Your work' })).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    const put = calls.find((c) => c.key === 'PUT /workers/me');
    expect(put.body).toMatchObject({ name: 'Test Worker', phone: '03001234567', city: 'Rawalpindi', languages: ['Urdu'] });
    expect(put.body).not.toHaveProperty('cnicNumber'); // not typed -> not sent
  });

  test('after step 2 is saved, the app opens step 3 (skills) by itself', async () => {
    mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me/onboarding': onboarding(ABOUT_DONE),
      'GET /workers/me': { status: 200, data: { ...PROFILE, occupation: '', category: null, experienceYears: null, hourlyRate: 0, dailyRate: 0, skills: [] } },
      'PUT /workers/me': (cfg, body) => ({ status: 200, data: { profile: { ...PROFILE, ...body, skills: [] }, onboarding: onboarding(WORK_DONE).data } }),
      'GET /workers/me/skills': { status: 200, data: { skills: [] } },
    });
    renderAt('/onboarding/work');
    const user = userEvent.setup();
    await screen.findByRole('option', { name: 'Electrical & Solar' }); // taxonomy loaded from the API
    await user.selectOptions(screen.getByLabelText(/^Main trade/), 'electrical_solar');
    expect(screen.getByLabelText(/^Occupation/)).toHaveValue('Electrician'); // helpful default, only because it was empty
    await user.type(screen.getByLabelText(/^Years of experience/), '6');
    await user.type(screen.getByLabelText(/^Rate per day/), '4000');
    await user.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Your skills' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/skills');
  });

  test('step 2 needs a trade, experience and a rate before anything is sent', async () => {
    const calls = mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me/onboarding': onboarding(ABOUT_DONE),
      'GET /workers/me': { status: 200, data: { ...PROFILE, occupation: '', category: null, experienceYears: null, hourlyRate: 0, dailyRate: 0, skills: [] } },
    });
    renderAt('/onboarding/work');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Save and continue' }));
    expect(screen.getByText('Please choose your main trade.')).toBeInTheDocument();
    expect(screen.getByText('Please give at least one rate (per hour or per day).')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'PUT /workers/me')).toBe(false);
  });

  test('Back keeps what was typed (drafts survive moving between steps)', async () => {
    mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me/onboarding': onboarding(ABOUT_DONE),
      'GET /workers/me': { status: 200, data: { ...PROFILE, occupation: '', category: null, experienceYears: null, skills: [] } },
      'PUT /workers/me': (cfg, body) => ({ status: 200, data: { profile: { ...PROFILE, ...body, occupation: '', category: null, experienceYears: null, skills: [] }, onboarding: onboarding(ABOUT_DONE).data } }),
    });
    renderAt('/onboarding/work');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^Occupation/), 'Solar fitter');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'About you' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Your work' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Occupation/)).toHaveValue('Solar fitter');
  });
});

describe('skills step (Module 2)', () => {
  const skillsRoutes = (extra = {}) => ({
    'GET /auth/me': me('worker'),
    'GET /workers/me/onboarding': onboarding(WORK_DONE),
    'GET /workers/me': { status: 200, data: { ...PROFILE, skills: [] } },
    'GET /workers/me/skills': { status: 200, data: { skills: [] } },
    'POST /workers/me/skills/extract': { status: 200, data: EXTRACT_RESULT },
    ...extra,
  });

  test('"Find my skills" only asks for suggestions: nothing is saved without a click (M2-2, M2-3)', async () => {
    const calls = mockApi(skillsRoutes());
    renderAt('/onboarding/skills');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/what work do you do/), '6 saal se wiring aur solar');
    await user.click(screen.getByRole('button', { name: 'Find my skills' }));
    expect(await screen.findByRole('heading', { name: 'Skill suggestions' })).toBeInTheDocument();
    expect(screen.getByText('Suggestions come from a word list. Please check them.')).toBeInTheDocument();
    // matched words are shown as chips
    const wiring = screen.getByRole('checkbox', { name: 'House wiring' });
    expect(wiring).toBeChecked();
    expect(screen.getByText('wiring', { selector: 'span' })).toBeInTheDocument();
    // No % and no "confidence" anywhere (M2-8)
    expect(document.body.textContent).not.toMatch(/confidence|\d+\s*%/i);
    // Writes to the profile or skills (the language setting PATCH /users/me/preferences is not profile data).
    const writes = calls.filter((c) => c.key !== 'POST /workers/me/skills/extract' && c.key.split(' ')[0] !== 'GET' && c.key !== 'PATCH /users/me/preferences');
    expect(writes).toEqual([]);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  test('"Add selected skills" saves only the ticked skills, then Continue is enabled', async () => {
    const calls = mockApi(skillsRoutes({
      'POST /workers/me/skills': (cfg, body) => ({ status: 201, data: { skills: body.skillIds.map((id) => ({ skillId: id, name: id === 'elec_wiring' ? 'House wiring' : 'Solar panel installation', category: 'electrical_solar', addedVia: 'extractor', custom: false })), onboarding: onboarding({ ...WORK_DONE, skills: true }).data } }),
    }));
    renderAt('/onboarding/skills');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/what work do you do/), '6 saal se wiring aur solar');
    await user.click(screen.getByRole('button', { name: 'Find my skills' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Solar panel installation' })); // untick
    await user.click(screen.getByRole('button', { name: /Add selected skills/ }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /workers/me/skills')).toBe(true));
    expect(calls.find((c) => c.key === 'POST /workers/me/skills').body).toEqual({ skillIds: ['elec_wiring'], addedVia: 'extractor', sourceText: '6 saal se wiring aur solar' });
    expect(await screen.findByText('1 skill added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
    expect(calls.some((c) => c.key === 'PUT /workers/me')).toBe(false); // trade/years not touched
  });

  test('root cause of the Step 3 dead end (Batch 3): after adding skills, Continue really opens Step 4', async () => {
    mockApi(skillsRoutes({
      'POST /workers/me/skills': (cfg, body) => ({ status: 201, data: { skills: body.skillIds.map((id) => ({ skillId: id, name: id, category: 'electrical_solar', addedVia: 'extractor', custom: false })), onboarding: onboarding({ ...WORK_DONE, skills: true }).data } }),
      'GET /evidence/mine': { status: 200, data: { evidence: [] } },
    }));
    renderAt('/onboarding/skills');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/what work do you do/), '6 saal se wiring aur solar');
    await user.click(screen.getByRole('button', { name: 'Find my skills' }));
    await user.click(await screen.findByRole('button', { name: /Add selected skills/ }));
    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Proof of skills' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/proof');
  });

  test('no silent dead end: without a skill, Continue explains why and links to the skill search', async () => {
    mockApi(skillsRoutes());
    renderAt('/onboarding/skills');
    const cont = await screen.findByRole('button', { name: 'Continue' });
    expect(cont).toBeDisabled();
    expect(cont).toHaveAccessibleDescription(/Add at least one skill to continue/);
    await userEvent.setup().click(screen.getByRole('button', { name: 'search the skill list' }));
    expect(screen.getByRole('combobox', { name: /Add a skill from the list/ })).toHaveFocus();
  });

  test('"Use these on my profile" is the only way the suggestion reaches the profile', async () => {
    const calls = mockApi(skillsRoutes({ 'PUT /workers/me': (cfg, body) => ({ status: 200, data: { profile: { ...PROFILE, ...body, skills: [] }, onboarding: onboarding(WORK_DONE).data } }) }));
    renderAt('/onboarding/skills');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/what work do you do/), '6 saal se wiring');
    await user.click(screen.getByRole('button', { name: 'Find my skills' }));
    expect(await screen.findByText('6 years')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'PUT /workers/me')).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Use these on my profile' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PUT /workers/me')?.body).toEqual({ category: 'electrical_solar', occupation: 'Electrician', experienceYears: 6 }));
  });

  test('example carousel: starts in the website language, moves through all scripts, and fills the box (Batch 4, feature 13)', async () => {
    mockApi(skillsRoutes());
    renderAt('/onboarding/skills');
    const user = userEvent.setup();
    const carousel = await screen.findByRole('region', { name: 'Example sentences' });
    expect(within(carousel).getByText('Example 1 of 9')).toBeInTheDocument();
    const first = carousel.querySelector('blockquote');
    expect(first).toHaveAttribute('lang', 'en'); // English website: English examples first
    for (let i = 0; i < 3; i += 1) await user.click(within(carousel).getByRole('button', { name: 'Next example' }));
    const urdu = carousel.querySelector('blockquote');
    expect(urdu).toHaveAttribute('lang', 'ur');
    expect(urdu).toHaveAttribute('dir', 'rtl');
    await user.click(within(carousel).getByRole('button', { name: 'Previous example' }));
    await user.click(within(carousel).getByRole('button', { name: 'Use this example' }));
    expect(screen.getByLabelText(/what work do you do/)).toHaveValue('I install and service split ACs and repair fridges.');
    expect(screen.getByLabelText(/what work do you do/)).toHaveAttribute('dir', 'auto');
  });

  test('a "no trade words" result explains what to do and offers the manual list', async () => {
    mockApi(skillsRoutes({ 'POST /workers/me/skills/extract': { status: 200, data: { ...EXTRACT_RESULT, skills: [], categories: [], suggestedCategory: null, suggestedOccupation: null, experience: null, noSkillReason: 'no_trade_words' } } }));
    renderAt('/onboarding/skills');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/what work do you do/), 'hello');
    await user.click(screen.getByRole('button', { name: 'Find my skills' }));
    expect(await screen.findByText(/We did not find any trade words/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Add a skill from the list/ })).toBeInTheDocument();
  });

  test('proof step: "Skip for now" leads to "All set" with the worker ID and how much proof waits for review', async () => {
    mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }),
      'GET /workers/me': { status: 200, data: PROFILE },
      'GET /evidence/mine': { status: 200, data: { evidence: [] } },
    });
    renderAt('/onboarding/proof');
    expect(await screen.findByRole('heading', { level: 1, name: 'Proof of skills' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Photo/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Skip for now' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'All set' })).toBeInTheDocument();
    expect(screen.getByText('DLM-2026-000042')).toBeInTheDocument();
    expect(screen.getByText('Identity pending review')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to my dashboard/ })).toHaveAttribute('href', '/worker');
  });
});

describe('voice input notice (M2-13)', () => {
  test('when the browser has speech recognition, the notice is shown next to the voice button', async () => {
    window.webkitSpeechRecognition = function FakeRecognition() {};
    try {
      mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }), 'GET /workers/me/full': full(PROFILE), 'GET /workers/me/skills': { status: 200, data: { skills: PROFILE.skills } } });
      renderAt('/worker/profile/edit?section=skills');
      expect(await screen.findByRole('button', { name: 'Use voice typing' })).toBeInTheDocument();
      expect(screen.getByText(/may send your audio to an online service\. Use the text box if you prefer\./)).toBeInTheDocument();
    } finally {
      delete window.webkitSpeechRecognition;
    }
  });

  test('without speech recognition there is no voice button (text is the main input)', async () => {
    mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }), 'GET /workers/me/full': full(PROFILE), 'GET /workers/me/skills': { status: 200, data: { skills: PROFILE.skills } } });
    renderAt('/worker/profile/edit?section=skills');
    expect(await screen.findByRole('button', { name: 'Find my skills' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Use voice typing' })).toBeNull();
  });
});

describe('no 404 for a new worker (Batch 3, console gate)', () => {
  test('when the server says no profile exists yet, the page does not ask for it', async () => {
    const calls = mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me/onboarding': { status: 200, data: { steps: { about: false, work: false, skills: false }, nextStep: 'about', complete: false, completedAt: null, profileExists: false } },
    });
    renderAt('/onboarding/about');
    expect(await screen.findByRole('heading', { level: 1, name: 'About you' })).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'GET /workers/me')).toBe(false);
  });
});

// Module 6 (Batch 8B) customer screens: the re-check rule (pure), the request bodies (pure), "Describe a job" in three
// steps (typed and spoken words, a tie, no trade words, contact details, the address warning, the exact save body),
// "My job requests", the card on /find, the navigation, page help, honesty and right to left.
// SYNTHETIC test data only; the analyzer answers are the real answers of the backend code for these sentences
// (module6Fixtures.js); the API is answered from a table (mockApi).
import { describe, test, expect, afterEach, beforeAll } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me } from './mockApi';
import { renderAt, pathname } from './renderApp';
import { ANALYSES, TAXONOMY_FULL } from './module6Fixtures';
import { installSpeech, lastRecognition, uninstallSpeech, VOICES } from './speechMocks';
import { mergeSuggestions, suggestionsOf, suggestionWords, takeOffer } from '../features/jobs/mergeSuggestions';
import { EMPTY_FORM, checkForm, createBody, dateOf, dayChoiceOf, editBody, formOf, openBookingOf, wordsFound } from '../features/jobs/jobText';
import { PAGE_HELP_NAMES, pageHelpName } from '../features/assist/pageHelp';
import { NAV_LINKS } from '../components/layout/navLinks';
import { destinationsFor } from '../features/navigation/destinations';
import { addDays, pktDay } from '../features/booking/bookingText';
import { formatRupees } from '../utils/masks';

const TODAY = pktDay();
const CATEGORY_OF = new Map(TAXONOMY_FULL.skills.map((s) => [s.id, s.category]));
const skillCategory = (id) => CATEGORY_OF.get(id) ?? null;
const merge = (form, touched, analysis) => mergeSuggestions(form, new Set(touched), analysis, { skillCategory, formatAmount: formatRupees });
const BODY_KEYS = ['area', 'budget', 'category', 'city', 'description', 'inputMode', 'preferredDate', 'skills', 'taskType', 'timeSlot', 'urgent'];

export const customerRoutes = (extra = {}) => ({
  'GET /auth/me': me('customer', { _id: 'c1', name: 'Sara Khan (synthetic)' }),
  'GET /meta/taxonomy': { status: 200, data: TAXONOMY_FULL },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});

// answers the analyze route with these analyses, one after the other (the last one repeats)
const analyzeInTurn = (...list) => {
  let n = 0;
  return () => ({ status: 200, data: list[Math.min(n++, list.length - 1)] });
};

async function describe1(user, text, extra = {}, analysis = ANALYSES.PINDI) {
  const calls = mockApi(customerRoutes({ 'POST /job-requests/analyze': typeof analysis === 'function' ? analysis : { status: 200, data: analysis }, ...extra }));
  renderAt('/job-requests/new');
  const box = await screen.findByRole('textbox', { name: 'Describe the job in your own words' });
  await user.click(box);
  await user.paste(text);
  return { calls, box };
}
const analyzeCalls = (calls) => calls.filter((c) => c.key === 'POST /job-requests/analyze');

afterEach(() => uninstallSpeech());
// The lazy pages are loaded once here (the first load of a page module is the slow part on a busy machine), so no
// single test comes near the 15 s limit when the files run in parallel.
beforeAll(async () => {
  await Promise.all([import('../pages/jobs/DescribeJob'), import('../pages/jobs/MyJobRequests'), import('../features/jobs/JobDetailsForm')]);
}, 60_000);

describe('the re-check rule (mergeSuggestions, pure)', () => {
  test('the first check fills every field from the suggestions (skills of the suggested trade, at most 5)', () => {
    const { form, offers, removedSkills } = merge(EMPTY_FORM, [], ANALYSES.PINDI);
    expect(form).toMatchObject({
      category: 'plumbing_sanitary', skills: ['plumb_leak', 'plumb_fixtures'], taskType: 'repair', city: 'Rawalpindi', day: 'tomorrow', date: '', timeSlot: 'morning', urgent: false, budget: { amount: '', unit: null },
    });
    expect(offers).toEqual({});
    expect(removedSkills).toEqual([]);
    expect(merge(EMPTY_FORM, [], ANALYSES.LAHORE).form).toMatchObject({ budget: { amount: '3,000', unit: 'job' }, urgent: true, city: 'Lahore', day: 'none', timeSlot: null });
  });

  test('untouched fields always take the newest suggestion, also "nothing"', () => {
    const first = merge(EMPTY_FORM, [], ANALYSES.PINDI).form;
    const { form } = merge({ ...first, area: 'Satellite Town' }, [], ANALYSES.NONE);
    expect(form).toMatchObject({ category: null, skills: [], taskType: null, city: '', day: 'none', timeSlot: null, area: 'Satellite Town' });
  });

  test('touched fields keep the person\'s value; a different, non-empty suggestion is offered', () => {
    const first = merge(EMPTY_FORM, [], ANALYSES.PINDI).form;
    const mine = { ...first, taskType: 'install', city: 'Pindi', timeSlot: 'evening' };
    const { form, offers } = merge(mine, ['taskType', 'city', 'timeSlot'], ANALYSES.LAHORE);
    expect(form).toMatchObject({ taskType: 'install', city: 'Pindi', timeSlot: 'evening', urgent: true, budget: { amount: '3,000', unit: 'job' } });
    expect(offers).toEqual({ city: 'Lahore' }); // taskType: same value (install); timeSlot: nothing suggested
    expect(merge(mine, ['city'], ANALYSES.PINDI).offers).toEqual({ city: 'Rawalpindi' });
    expect(merge({ ...first, city: 'rawalpindi' }, ['city'], ANALYSES.PINDI).offers).toEqual({}); // the same city
  });

  test('skills follow the final trade; touched skills of another trade are removed and reported', () => {
    const first = merge(EMPTY_FORM, [], ANALYSES.PINDI).form;
    const r = merge({ ...first, skills: ['plumb_leak', 'plumb_geyser'] }, ['skills'], ANALYSES.URDU);
    expect(r.form).toMatchObject({ category: 'electrical_solar', skills: [] });
    expect(r.removedSkills).toEqual(['plumb_leak', 'plumb_geyser']);
    expect(r.offers.skills).toEqual(['elec_fittings']);
    // the person chose the trade: the suggested skills of THAT trade
    expect(merge({ ...EMPTY_FORM, category: 'plumbing_sanitary' }, ['category'], ANALYSES.TIE).form).toMatchObject({ category: 'plumbing_sanitary', skills: ['plumb_general'] });
  });

  test('"Use it" takes the offer and the field follows the suggestions again', () => {
    const first = merge(EMPTY_FORM, [], ANALYSES.PINDI).form;
    const { form, offers } = merge({ ...first, city: 'Pindi' }, ['city'], ANALYSES.LAHORE);
    const used = takeOffer(form, new Set(['city']), offers, 'city');
    expect(used.form.city).toBe('Lahore');
    expect(used.touched.has('city')).toBe(false);
    expect(used.offers).toEqual({});
  });

  test('a tie and a city conflict suggest nothing (never decided for the person)', () => {
    expect(suggestionsOf(ANALYSES.TIE)).toMatchObject({ category: null });
    expect(suggestionsOf(ANALYSES.TWO_CITIES)).toMatchObject({ category: 'moving_loading', city: '' });
  });

  test('the words shown next to a field are the analyzer\'s own; none when the person chose something else', () => {
    const form = merge(EMPTY_FORM, [], ANALYSES.PINDI).form;
    expect(suggestionWords('category', form, ANALYSES.PINDI)).toEqual({ fromCategory: false, words: ['tapak', 'nalka', 'bathroom'] });
    expect(suggestionWords('city', form, ANALYSES.PINDI).words).toEqual(['pindi']);
    expect(suggestionWords('category', { ...form, category: 'electrical_solar' }, ANALYSES.PINDI)).toBeNull();
    const painter = { category: { suggested: 'painting_renovation', matched: ['painter'] }, taskType: { suggested: 'new_work', matched: [], fromCategory: true } };
    expect(suggestionWords('taskType', { ...EMPTY_FORM, category: 'painting_renovation', taskType: 'new_work' }, painter)).toEqual({ fromCategory: true, words: [] });
    expect(wordsFound(ANALYSES.PINDI)).toEqual(['tapak', 'nalka', 'bathroom', 'pindi', 'kal', 'subah']);
  });
});

describe('request bodies and form checks (pure)', () => {
  const form = { ...merge(EMPTY_FORM, [], ANALYSES.PINDI).form, area: '  Satellite Town ' };
  test('POST /api/job-requests: exactly the documented fields, no analysis', () => {
    const body = createBody({ text: '  Bathroom ka nalka tapak raha hai ', inputMode: 'voice', form, today: TODAY });
    expect(Object.keys(body).sort()).toEqual(BODY_KEYS);
    expect(body).toEqual({
      description: 'Bathroom ka nalka tapak raha hai', inputMode: 'voice', category: 'plumbing_sanitary', skills: ['plumb_leak', 'plumb_fixtures'], taskType: 'repair',
      city: 'Rawalpindi', area: 'Satellite Town', preferredDate: addDays(TODAY, 1), timeSlot: 'morning', urgent: false, budget: null,
    });
    expect(createBody({ text: 'x', inputMode: 'text', form: { ...form, budget: { amount: '2,500', unit: 'day' } }, today: TODAY }).budget).toEqual({ amount: 2500, unit: 'day' });
  });
  test('PATCH: baseVersion and only the changed fields; a changed description sends its input mode', () => {
    const job = { version: 3, description: 'Nalka tapak raha hai', category: 'plumbing_sanitary', skills: [{ skillId: 'plumb_leak', name: 'Water leak repair' }], taskType: 'repair', city: 'Rawalpindi', area: 'G-9', preferredDate: null, timeSlot: null, urgent: false, budget: null };
    const same = formOf(job, TODAY, formatRupees);
    expect(editBody({ job, text: job.description, inputMode: 'text', form: same, today: TODAY })).toEqual({ baseVersion: 3 });
    expect(editBody({ job, text: 'Nalka tapak raha hai, jaldi', inputMode: 'voice', form: { ...same, area: 'G-10', urgent: true }, today: TODAY }))
      .toEqual({ baseVersion: 3, description: 'Nalka tapak raha hai, jaldi', inputMode: 'voice', area: 'G-10', urgent: true });
    expect(editBody({ job: { ...job, budget: { amount: 2000, unit: 'job' } }, text: job.description, inputMode: 'text', form: { ...same, budget: { amount: '', unit: null } }, today: TODAY })).toEqual({ baseVersion: 3, budget: null });
  });
  test('the day choice and the client checks (the server checks again)', () => {
    expect(dayChoiceOf(TODAY, TODAY)).toEqual({ day: 'today', date: '' });
    expect(dayChoiceOf(addDays(TODAY, 1), TODAY)).toEqual({ day: 'tomorrow', date: '' });
    expect(dayChoiceOf(addDays(TODAY, 5), TODAY)).toEqual({ day: 'pick', date: addDays(TODAY, 5) });
    expect(dayChoiceOf(null, TODAY)).toEqual({ day: 'none', date: '' });
    expect(dateOf('none', '', TODAY)).toBeNull();
    expect(checkForm(EMPTY_FORM, TODAY)).toEqual({ category: 'jobs.form.needTrade', city: 'jobs.form.needCity', area: 'jobs.form.needArea' });
    expect(checkForm({ ...form, budget: { amount: '2,000', unit: null } }, TODAY)).toEqual({ budget: { code: 'JOB_BUDGET_INCOMPLETE' } });
    expect(checkForm({ ...form, day: 'pick', date: addDays(TODAY, 31) }, TODAY).date).toEqual({ code: 'BOOKING_DATE_RANGE', params: { max: 30 } });
    expect(openBookingOf({ bookings: [{ _id: 'b0', status: 'declined' }, { _id: 'b1', status: 'requested' }] })._id).toBe('b1');
  });
});

describe('Describe a job (/job-requests/new)', () => {
  test('typed words -> Check my words -> the found words; step 2 has every suggestion pre-selected with its words', async () => {
    const user = userEvent.setup();
    const { calls } = await describe1(user, 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah');
    await user.click(screen.getByRole('button', { name: 'Check my words' }));
    const found = await screen.findByTestId('found-words');
    for (const w of ['tapak', 'nalka', 'bathroom', 'pindi', 'kal', 'subah']) expect(within(found).getByText(w)).toBeInTheDocument();
    expect(analyzeCalls(calls)[0].body).toEqual({ text: 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah', inputMode: 'text' });
    // "How does this work?" names the method from GET /api/meta/job-options and says what it does
    expect(screen.getByTestId('how-it-works')).toHaveTextContent('Method: rule-based word lists.');
    expect(screen.getByTestId('how-it-works')).toHaveTextContent('The app looks for known words in your text.');

    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    expect(analyzeCalls(calls)).toHaveLength(1); // the text did not change: no second check
    const trade = await screen.findByRole('radio', { name: /Plumbing & Sanitary/ });
    expect(trade).toBeChecked();
    expect(trade.closest('label')).toHaveTextContent('Suggested from your words:');
    expect(screen.getByRole('checkbox', { name: 'Water leak repair' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Bathroom and sanitary fittings' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Geyser installation' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /^Repair/ })).toBeChecked();
    expect(screen.getByRole('textbox', { name: /^City/ })).toHaveValue('Rawalpindi');
    expect(screen.getByRole('radio', { name: /^Tomorrow/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^Morning/ })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Urgent' })).not.toBeChecked();
    expect(screen.getByTestId('job-budget-step')).toHaveTextContent("Only you and the site's admins can see this. Workers never see it.");
  });

  test('a tie: the tied trades first, nothing selected, and the person is asked to choose', async () => {
    const user = userEvent.setup();
    await describe1(user, 'Painter aur carpenter dono chahiye', {}, ANALYSES.TIE_LATER);
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    await screen.findByText('Your words fit more than one trade. Choose the one you need first.');
    const group = screen.getByRole('group', { name: 'Trade' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.slice(0, 2).map((r) => r.value)).toEqual(['carpentry_woodwork', 'painting_renovation']);
    expect(radios.every((r) => !r.checked)).toBe(true);
    // choosing a trade ticks the suggested skills of that trade
    await user.click(screen.getByRole('radio', { name: /Painting & Renovation/ }));
    expect(screen.getByRole('checkbox', { name: /General painting/ })).toBeChecked();
  });

  test('no trade words: nothing selected, "Choose the trade", and saving waits for a trade', async () => {
    const user = userEvent.setup();
    await describe1(user, 'Hello, kya haal hai', {}, ANALYSES.NONE);
    await user.click(screen.getByRole('button', { name: 'Check my words' }));
    expect(await screen.findByTestId('found-words')).toHaveTextContent('No known words found.');
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    expect(await screen.findByText('Choose the trade.', { selector: '[role="alert"] *, [role="status"] *, div *' })).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Trade' })).getAllByRole('radio').every((r) => !r.checked)).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Next: save' }));
    expect(screen.getByText('Please check the marked parts.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save the job request' })).toBeNull();
  });

  test('contact details in the words: the server\'s message under the box, and no step 2', async () => {
    const user = userEvent.setup();
    const refused = { status: 400, data: { code: 'VALIDATION_FAILED', message: 'Invalid input', errors: [{ field: 'text', code: 'TEXT_HAS_CONTACT_INFO', message: 'Please do not write phone numbers, links or ID numbers here.' }] } };
    const { box } = await describe1(user, 'Plumber chahiye 0300 1234567', {}, () => refused);
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    expect(await screen.findByText('Please do not write phone numbers, links or ID numbers here.')).toBeInTheDocument();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('group', { name: 'Trade' })).toBeNull();
  });

  test('a house number in the words: a friendly warning that never blocks', async () => {
    const user = userEvent.setup();
    await describe1(user, 'Gali number 5, makan 12 mein wiring ka kaam hai', {}, ANALYSES.ADDRESS);
    await user.click(screen.getByRole('button', { name: 'Check my words' }));
    expect(await screen.findByText('It looks like a house or street number. Please remove it; you will write your area in the next step.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    expect(await screen.findByRole('radio', { name: /Electrical & Solar/ })).toBeChecked();
  });

  test('🎤 Speak adds the words at the end, they are checked when the microphone stops, and inputMode is "voice"', async () => {
    installSpeech({ voices: [VOICES.en] });
    const user = userEvent.setup();
    const { calls, box } = await describe1(user, 'Bathroom ka', {}, ANALYSES.PINDI);
    await user.click(screen.getByRole('button', { name: 'Speak' }));
    lastRecognition().say('nalka tapak raha hai, Pindi mein, kal subah');
    expect(box).toHaveValue('Bathroom ka nalka tapak raha hai, Pindi mein, kal subah');
    await waitFor(() => expect(analyzeCalls(calls)).toHaveLength(1));
    expect(analyzeCalls(calls)[0].body).toEqual({ text: 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah', inputMode: 'voice' });
    expect(await screen.findByTestId('found-words')).toHaveTextContent('tapak');
  });

  test('checking again keeps what the person changed, offers the new suggestion, and updates the rest', async () => {
    const user = userEvent.setup();
    const { calls, box } = await describe1(user, 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah', {}, analyzeInTurn(ANALYSES.PINDI, ANALYSES.LAHORE));
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    await user.click(await screen.findByRole('radio', { name: /^Install/ })); // the person changes the kind of work
    await user.clear(screen.getByRole('textbox', { name: /^City/ }));
    await user.type(screen.getByRole('textbox', { name: /^City/ }), 'Pindi');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    const again = await screen.findByRole('textbox', { name: 'Describe the job in your own words' });
    expect(again).toHaveValue(box.value); // the words are kept when going back
    await user.clear(again);
    await user.paste('Lahore mein geyser lagwana hai, budget 3000 rupay, jaldi');
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    await waitFor(() => expect(analyzeCalls(calls)).toHaveLength(2)); // the words changed: checked again
    // kept: the person's kind of work and city; offered: the new city; updated: the untouched fields
    expect(await screen.findByRole('radio', { name: /^Install/ })).toBeChecked();
    expect(screen.getByRole('textbox', { name: /^City/ })).toHaveValue('Pindi');
    expect(screen.getByTestId('offer-city')).toHaveTextContent('New suggestion from your words: Lahore. Use it?');
    expect(screen.queryByTestId('offer-taskType')).toBeNull(); // the same as the person's choice
    expect(screen.getByRole('checkbox', { name: 'Geyser installation' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Urgent' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: /Budget amount/ })).toHaveValue('3,000');
    expect(within(screen.getByRole('group', { name: 'Day' })).getByRole('radio', { name: /^Not decided/ })).toBeChecked(); // the day: no day word now
    await user.click(within(screen.getByTestId('offer-city')).getByRole('button', { name: 'Use it' }));
    expect(screen.getByRole('textbox', { name: /^City/ })).toHaveValue('Lahore');
  });

  test('step 3: the summary with the private budget, and Save sends exactly the documented fields, then opens the job', async () => {
    const user = userEvent.setup();
    const saved = { _id: 'j1', code: 'JR-2026-000007', state: 'open', version: 1, actions: ['edit', 'find_workers', 'request', 'close', 'delete'] };
    const { calls } = await describe1(user, 'Lahore mein geyser lagwana hai, budget 3000 rupay, jaldi', {
      'POST /job-requests': { status: 201, data: { job: saved } },
      'GET /job-requests/j1': { status: 200, data: { job: { ...saved, category: 'plumbing_sanitary', skills: [], city: 'Lahore', area: 'Gulberg', bookings: [], analysis: null } } },
    }, ANALYSES.LAHORE);
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    await user.type(await screen.findByRole('textbox', { name: /^Area/ }), 'Gulberg');
    await user.click(screen.getByRole('button', { name: 'Next: save' }));
    const summary = await screen.findByTestId('job-summary');
    expect(summary).toHaveTextContent('Plumbing & Sanitary');
    expect(summary).toHaveTextContent('Geyser installation');
    expect(summary).toHaveTextContent('Install');
    expect(within(summary).getByTestId('job-budget')).toHaveTextContent('Budget: Rs 3,000 for the whole job');
    expect(within(summary).getByTestId('job-budget')).toHaveTextContent('Only you and the admins see this.');
    expect(screen.getByText('Your words are used for this request only.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save the job request' }));
    await waitFor(() => expect(pathname()).toBe('/job-requests/j1'));
    const body = calls.find((c) => c.key === 'POST /job-requests').body;
    expect(Object.keys(body).sort()).toEqual(BODY_KEYS);
    expect(body).toEqual({
      description: 'Lahore mein geyser lagwana hai, budget 3000 rupay, jaldi', inputMode: 'text', category: 'plumbing_sanitary', skills: ['plumb_geyser'], taskType: 'install',
      city: 'Lahore', area: 'Gulberg', preferredDate: null, timeSlot: null, urgent: true, budget: { amount: 3000, unit: 'job' },
    });
  });

  test('a city conflict: the two cities as buttons ("Which city?")', async () => {
    const user = userEvent.setup();
    await describe1(user, 'Pindi se Islamabad samaan shift karna hai', {}, ANALYSES.TWO_CITIES);
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    const choice = await screen.findByTestId('city-choice');
    expect(choice).toHaveTextContent('Which city?');
    expect(screen.getByRole('textbox', { name: /^City/ })).toHaveValue('');
    await user.click(within(choice).getByRole('button', { name: 'Islamabad' }));
    expect(screen.getByRole('textbox', { name: /^City/ })).toHaveValue('Islamabad');
  });

  test('more than five skills: the sixth tick explains the limit', async () => {
    const user = userEvent.setup();
    await describe1(user, 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah');
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    for (const name of ['General plumbing work', 'PPRC and uPVC pipe fitting', 'Geyser installation']) await user.click(await screen.findByRole('checkbox', { name }));
    await user.click(screen.getByRole('checkbox', { name: 'Water pump and tank' }));
    expect(screen.getByRole('checkbox', { name: 'Water pump and tank' })).not.toBeChecked();
    expect(screen.getByText('You can choose up to 5 skills.')).toBeInTheDocument();
  });

  test('honest words: no "AI", no "confidence", no percentage on any step', async () => {
    const user = userEvent.setup();
    await describe1(user, 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah');
    await user.click(screen.getByRole('button', { name: 'Check my words' }));
    await screen.findByTestId('found-words');
    const check = () => {
      const text = document.body.textContent;
      expect(text).not.toMatch(/\bAI\b|confiden|%|smart|intelligen/i);
    };
    check();
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    await screen.findByRole('group', { name: 'Trade' });
    check();
  });

  test('right to left in Urdu: the page, its steps and the suggestion words', async () => {
    mockApi(customerRoutes({ 'POST /job-requests/analyze': { status: 200, data: ANALYSES.URDU } }));
    renderAt('/job-requests/new', { language: 'ur' });
    expect(await screen.findByRole('heading', { level: 1, name: 'کام بتائیں' })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement).toHaveAttribute('dir', 'rtl'));
    const user = userEvent.setup();
    await user.click(screen.getByRole('textbox', { name: 'اپنے الفاظ میں کام بتائیں' }));
    await user.paste('پنکھا نہیں چل رہا، آج شام کو کوئی آ جائے');
    await user.click(screen.getByRole('button', { name: 'میرے الفاظ جانچیں' }));
    expect(await screen.findByTestId('found-words')).toHaveTextContent('پنکھا');
  });
});

describe('My job requests (/job-requests)', () => {
  const job = (extra) => ({
    _id: 'j1', code: 'JR-2026-000001', state: 'open', version: 1, actions: ['edit', 'find_workers', 'request', 'close', 'delete'], category: 'plumbing_sanitary',
    skills: [{ skillId: 'plumb_leak', name: 'Water leak repair' }], taskType: 'repair', description: '[synthetic] Nalka tapak raha hai', inputMode: 'text', city: 'Rawalpindi',
    region: 'PB', area: 'Satellite Town', preferredDate: null, timeSlot: 'morning', urgent: false, budget: { amount: 2000, unit: 'job' }, bookingsCount: 0, ...extra,
  });
  const COUNTS = { open: 1, requested: 1, accepted: 0, done: 0, expired: 0, closed: 0, active: 2 };

  test('tabs with the server\'s counts; each card has its state, its meaning and the main action; no budget in the list', async () => {
    const calls = mockApi(customerRoutes({
      'GET /job-requests/mine': (config) => ({
        status: 200,
        data: config.params.state === 'active'
          ? { jobs: [job(), job({ _id: 'j2', code: 'JR-2026-000002', state: 'requested', actions: ['find_workers', 'close'], bookingsCount: 1 })], counts: COUNTS, page: 1, limit: 20, total: 2 }
          : { jobs: [], counts: COUNTS, page: 1, limit: 20, total: 0 },
      }),
    }));
    const user = userEvent.setup();
    renderAt('/job-requests');
    const cards = await screen.findAllByTestId('job-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('JR-2026-000001');
    expect(cards[0]).toHaveTextContent('Open: choose a worker');
    expect(within(cards[0]).getByRole('link', { name: /Choose a worker/ })).toHaveAttribute('href', '/job-requests/j1/workers');
    expect(cards[1]).toHaveTextContent("Waiting for the worker's answer");
    expect(within(cards[1]).getByRole('link', { name: /See the job request/ })).toHaveAttribute('href', '/job-requests/j2');
    await waitFor(() => expect(screen.getByRole('tab', { name: /Active/ })).toHaveTextContent('2'));
    expect(screen.getByRole('tab', { name: /Waiting for a worker/ })).toHaveTextContent('1');
    expect(document.body.textContent).not.toMatch(/Budget|2,000/);
    await user.click(screen.getByRole('tab', { name: /Closed/ }));
    expect(await screen.findByText('Nothing here')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Describe a job' }).length).toBeGreaterThan(0);
    expect(calls.filter((c) => c.key === 'GET /job-requests/mine').map((c) => c.params.state)).toEqual(['active', 'closed']);
  });
});

describe('navigation, the /find card and page help', () => {
  test('"My job requests" is the second customer link; the palette knows both pages', () => {
    expect(NAV_LINKS.customer.map((l) => l.to).slice(0, 2)).toEqual(['/find', '/job-requests']);
    expect(destinationsFor('customer').map((d) => d.to)).toEqual(expect.arrayContaining(['/job-requests/new', '/job-requests']));
    expect(destinationsFor('worker').map((d) => d.to)).not.toContain('/job-requests');
  });

  test('/find: "Not sure whom to call?" card with a link to Describe a job; the search is still there', async () => {
    mockApi(customerRoutes({ 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0, sort: 'updated' } }, 'GET /saved/ids': { status: 200, data: { ids: [], max: 100 } } }));
    renderAt('/find');
    const card = await screen.findByTestId('describe-job-card');
    expect(card).toHaveTextContent('Not sure whom to call? Describe the job in your own words');
    expect(card).toHaveTextContent('🎤');
    expect(within(card).getByRole('link', { name: 'Describe a job' })).toHaveAttribute('href', '/job-requests/new');
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(within(screen.getAllByRole('banner')[0]).getAllByRole('link', { name: 'My job requests' }).length).toBeGreaterThan(0);
  });

  test('page help for every new page', () => {
    expect(Object.fromEntries(['/job-requests', '/job-requests/new', '/job-requests/j1', '/job-requests/j1/edit', '/job-requests/j1/workers'].map((p) => [p, pageHelpName(p)]))).toEqual({
      '/job-requests': 'myJobRequests', '/job-requests/new': 'describeJob', '/job-requests/j1': 'jobRequest', '/job-requests/j1/edit': 'editJobRequest', '/job-requests/j1/workers': 'jobWorkers',
    });
    expect(PAGE_HELP_NAMES).toEqual(expect.arrayContaining(['myJobRequests', 'describeJob', 'jobRequest', 'editJobRequest', 'jobWorkers']));
    expect(pageHelpName('/workers/DLM-2026-000001/request')).toBe('requestWorker'); // also with ?job= (the path decides)
  });
});

// Batch 8B independent review: a test for each fixed finding (REVIEW.md in the working notes)
describe('review fixes (Batch 8B, Stage 9)', () => {
  // a check that suggests AC and also finds an electrical skill (only the fields that matter here)
  const AC_AND_WIRING = {
    category: { suggested: 'ac_appliance_repair', tie: false, ranked: ['ac_appliance_repair'], matched: ['ac'] },
    skills: [{ skillId: 'ac_general', category: 'ac_appliance_repair', matched: ['ac'] }, { skillId: 'elec_wiring', category: 'electrical_solar', matched: ['wiring'] }],
    taskType: { suggested: 'repair', matched: ['kharab'], fromCategory: false }, city: { suggested: null, matched: [], conflict: false },
    when: { suggested: null, matched: [] }, timeSlot: { suggested: null, matched: [] }, urgent: { suggested: false, matched: [] }, budget: { suggested: null, matched: [] },
  };

  test('finding 1: "Use it" on a trade makes the skills follow the new trade (untouched and touched skills)', () => {
    const mine = { ...EMPTY_FORM, category: 'electrical_solar' };
    const r = merge(mine, ['category'], AC_AND_WIRING);
    expect(r.form).toMatchObject({ category: 'electrical_solar', skills: ['elec_wiring'] });
    expect(r.offers.category).toBe('ac_appliance_repair');
    const used = takeOffer(r.form, new Set(['category']), r.offers, 'category', { analysis: AC_AND_WIRING, skillCategory });
    expect(used.form).toMatchObject({ category: 'ac_appliance_repair', skills: ['ac_general'] });
    expect(used.removedSkills).toEqual(['elec_wiring']);
    // touched skills keep only those of the new trade, and the suggested ones of that trade are offered
    const touched = takeOffer({ ...r.form, skills: ['elec_wiring'] }, new Set(['category', 'skills']), { ...r.offers, skills: ['elec_fittings'] }, 'category', { analysis: AC_AND_WIRING, skillCategory });
    expect(touched.form.skills).toEqual([]);
    expect(touched.offers.skills).toEqual(['ac_general']);
    expect(touched.form.skills.every((id) => skillCategory(id) === 'ac_appliance_repair')).toBe(true);
  });

  test('finding 4: "usual for this trade" only while the trade is still the suggested one', () => {
    const painter = { category: { suggested: 'painting_renovation', matched: ['painter'] }, taskType: { suggested: 'new_work', matched: [], fromCategory: true } };
    expect(suggestionWords('taskType', { ...EMPTY_FORM, category: 'painting_renovation', taskType: 'new_work' }, painter)).toEqual({ fromCategory: true, words: [] });
    expect(suggestionWords('taskType', { ...EMPTY_FORM, category: 'electrical_solar', taskType: 'new_work' }, painter)).toBeNull();
  });

  test('finding 5: an unchanged saved day that has passed does not block saving; a changed day is checked', () => {
    const past = addDays(TODAY, -3);
    const old = { ...merge(EMPTY_FORM, [], ANALYSES.PINDI).form, area: 'G-9', day: 'pick', date: past };
    expect(checkForm(old, TODAY, { savedDate: past }).date).toBeUndefined();
    expect(checkForm({ ...old, date: addDays(TODAY, -2) }, TODAY, { savedDate: past }).date).toEqual({ code: 'BOOKING_DATE_RANGE', params: { max: 30 } });
  });

  test('finding 8: the budget limits are checked on the page and the message goes to the amount box', async () => {
    const form = { ...merge(EMPTY_FORM, [], ANALYSES.PINDI).form, area: 'G-9' };
    expect(checkForm({ ...form, budget: { amount: '50', unit: 'job' } }, TODAY)).toEqual({ budget: { key: 'jobs.budget.tooSmall', params: { min: '100' } } });
    expect(checkForm({ ...form, budget: { amount: '6,000,000', unit: 'job' } }, TODAY, { amountMax: 5000000 }).budget).toEqual({ key: 'jobs.budget.tooLarge', params: { max: '5,000,000' } });
    const user = userEvent.setup();
    await describe1(user, 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah');
    await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
    await user.type(await screen.findByRole('textbox', { name: /^Area/ }), 'G-9');
    await user.type(screen.getByRole('textbox', { name: /Budget amount/ }), '50');
    await user.click(screen.getByRole('radio', { name: /^Whole job/ }));
    await user.click(screen.getByRole('button', { name: 'Next: save' }));
    expect(await screen.findByText('The budget must be at least Rs 100.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Budget amount/ })).toHaveAttribute('aria-invalid', 'true');
  });

  test('finding 6: the request page with a job has its own page help; finding 7: "Expired" does not claim nobody was asked', async () => {
    expect(pageHelpName('/workers/DLM-2026-000001/request', '?job=j1')).toBe('requestWithJob');
    expect(pageHelpName('/workers/DLM-2026-000001/request', '')).toBe('requestWorker');
    expect(PAGE_HELP_NAMES).toContain('requestWithJob');
    const en = (await import('../i18n/dictionaries/en.js')).default;
    expect(en.help.screen.requestWithJob).not.toMatch(/area/i);
    expect(en.jobs.meaning.expired).toBe('Expired: no worker took this job in time');
  });
});

// Module 6 (Batch 8A): the rule-based job analyzer job-rules-1. The 13 required examples (5.9 of the batch plan,
// now = 2026-11-24 10:00 Pakistan time, a Tuesday) and property tests. All texts here are SYNTHETIC.
import { describe, test, expect } from 'vitest';
import { analyzeJob } from '../../services/jobAnalyzer/index.js';
import { analyzeRules, findTaskType } from '../../services/jobAnalyzer/rules.js';
import { findBudget } from '../../services/jobAnalyzer/budget.js';
import { findCity, looksLikeAddress } from '../../services/jobAnalyzer/fields.js';
import { jobTokens, compileTerm, termMatches, VARIANT_MAP } from '../../services/jobAnalyzer/tokens.js';
import { extractSkills } from '../../services/skillExtractor/extractor.js';
import { SKILL_PHRASES, SPELLING_VARIANTS, TASK_TYPE_WORDS, JOB_PHRASES_VERSION } from '../../config/jobPhrases.js';
import { SKILL_IDS, CATEGORY_IDS, skillById } from '../../config/skillTaxonomy.js';
import { TASK_TYPES } from '../../config/jobRules.js';
import { CITY_SPELLINGS, canonicalCity } from '../../config/regions.js';
import { ANALYZER_VERSION, LIVE_METHOD, LIVE_MODEL } from '../../config/jobAnalyzer.js';

const NOW = new Date('2026-11-24T10:00:00+05:00');
const run = (text, options) => analyzeJob(text, { now: NOW, options });
const skillIds = (a) => a.skills.map((s) => s.skillId);

describe('the 13 required examples (5.9)', () => {
  test('1: Kal subah AC ki service karwani hai, Rawalpindi mein', () => {
    const a = run('Kal subah AC ki service karwani hai, Rawalpindi mein');
    expect(a.category).toMatchObject({ suggested: 'ac_appliance_repair', tie: false, ranked: ['ac_appliance_repair'], matched: ['ac', 'service'], source: 'rules', words: [] });
    expect(skillIds(a)).toEqual(expect.arrayContaining(['ac_general', 'ac_service']));
    expect(a.taskType.suggested).toBe('service');
    expect(a.city).toMatchObject({ suggested: 'Rawalpindi', region: 'PB', matched: ['rawalpindi'], conflict: false });
    expect(a.when).toEqual({ suggested: 'tomorrow', date: '2026-11-25', matched: ['kal'] });
    expect(a.timeSlot).toEqual({ suggested: 'morning', matched: ['subah'] });
    expect(a.missing).toEqual(['area']);
  });

  test('2: Bathroom ka nalka tapak raha hai, jaldi koi plumber bhej dein', () => {
    const a = run('Bathroom ka nalka tapak raha hai, jaldi koi plumber bhej dein');
    expect(a.category.suggested).toBe('plumbing_sanitary');
    expect(skillIds(a)).toEqual(expect.arrayContaining(['plumb_fixtures', 'plumb_leak', 'plumb_general']));
    expect(a.taskType.suggested).toBe('repair');
    expect(a.urgent.suggested).toBe(true);
    expect(a.city.suggested).toBeNull();
    expect([...a.missing].sort()).toEqual(['area', 'city']);
  });

  test('3: پنکھا نہیں چل رہا، آج شام کو کوئی آ جائے', () => {
    const a = run('پنکھا نہیں چل رہا، آج شام کو کوئی آ جائے');
    expect(a.category.suggested).toBe('electrical_solar');
    expect(skillIds(a)).toContain('elec_fittings');
    expect(a.taskType.suggested).toBe('repair');
    expect(a.when).toMatchObject({ suggested: 'today', date: '2026-11-24' });
    expect(a.timeSlot.suggested).toBe('evening');
  });

  test('4: Ghar shift karna hai Lahore mein, budget 15,000 rupay', () => {
    const a = run('Ghar shift karna hai Lahore mein, budget 15,000 rupay');
    expect(a.category.suggested).toBe('moving_loading');
    expect(skillIds(a)).toContain('move_shifting');
    expect(a.taskType.suggested).toBe('moving');
    expect(a.city.suggested).toBe('Lahore');
    expect(a.budget.suggested).toEqual({ amount: 15000, unit: 'job' });
  });

  test('5: Need a painter for two rooms, around Rs 2 hazar per day', () => {
    const a = run('Need a painter for two rooms, around Rs 2 hazar per day');
    expect(a.category.suggested).toBe('painting_renovation');
    expect(skillIds(a)).toContain('paint_general');
    expect(a.taskType).toMatchObject({ suggested: 'new_work', fromCategory: true, matched: [] });
    expect(a.budget.suggested).toEqual({ amount: 2000, unit: 'day' });
  });

  test('6: AC thanda nahi kar raha, gas bharni hai', () => {
    const a = run('AC thanda nahi kar raha, gas bharni hai');
    expect(a.category.suggested).toBe('ac_appliance_repair');
    expect(skillIds(a)).toContain('ac_gas');
    expect(a.taskType.suggested).toBe('repair');
  });

  test('7: Mujhe kal ek electrician aur ek plumber chahiye -> a tie, reported, not decided', () => {
    const a = run('Mujhe kal ek electrician aur ek plumber chahiye');
    expect(a.category).toMatchObject({ suggested: null, tie: true, ranked: ['electrical_solar', 'plumbing_sanitary'], source: null });
    expect(a.notes).toContain('category_tie');
    expect(a.missing).toContain('category');
  });

  test('8: Hello, kya haal hai -> nothing', () => {
    const a = run('Hello, kya haal hai');
    expect(a.category.suggested).toBeNull();
    expect(a.notes).toContain('no_trade_words');
    expect(a.skills).toEqual([]);
    for (const field of ['taskType', 'city', 'when', 'timeSlot', 'budget']) expect(a[field].suggested).toBeNull();
    expect(a.urgent).toEqual({ suggested: false, matched: [] });
  });

  test('9: Gali number 5, makan 12 mein wiring ka kaam hai -> address hint', () => {
    const a = run('Gali number 5, makan 12 mein wiring ka kaam hai');
    expect(skillIds(a)).toContain('elec_wiring');
    expect(a.notes).toContain('address_in_text');
    expect(a.budget.suggested).toBeNull();
  });

  test('10: کراچی میں گیزر لگوانا ہے', () => {
    const a = run('کراچی میں گیزر لگوانا ہے');
    expect(a.category.suggested).toBe('plumbing_sanitary');
    expect(skillIds(a)).toContain('plumb_geyser');
    expect(a.taskType.suggested).toBe('install');
    expect(a.city).toMatchObject({ suggested: 'Karachi', region: 'SD' });
  });

  test('11: Pindi se Islamabad samaan shift karna hai -> two cities, the customer chooses', () => {
    const a = run('Pindi se Islamabad samaan shift karna hai');
    expect(a.category.suggested).toBe('moving_loading');
    expect(a.city).toMatchObject({ suggested: null, conflict: true });
    expect(a.notes).toContain('city_conflict');
  });

  test('12: AC repair ke liye Rs 50 -> budget out of range', () => {
    const a = run('AC repair ke liye Rs 50');
    expect(a.budget.suggested).toBeNull();
    expect(a.notes).toContain('budget_out_of_range');
  });

  test('13: kharab pankha utaar kar naya lagana hai -> install words come first', () => {
    expect(run('kharab pankha utaar kar naya lagana hai').taskType.suggested).toBe('install');
  });

  test('Module 2 as it is: the gaps the problem phrases close (checked 23 Nov 2026)', () => {
    expect(extractSkills('Bathroom ka nalka tapak raha hai, jaldi koi plumber bhej dein').skills.map((s) => s.skillId)).not.toContain('plumb_leak');
    expect(extractSkills('AC thanda nahi kar raha, gas bharni hai').skills.map((s) => s.skillId)).not.toContain('ac_gas');
    expect(extractSkills('Ghar shift karna hai Lahore mein, budget 15,000 rupay').skills).toEqual([]);
    expect(extractSkills('Pindi se Islamabad samaan shift karna hai').skills).toEqual([]);
  });
});

describe('output shape and honest words', () => {
  test('the documented keys, the live method and versions; no score, probability or percentage', () => {
    const a = run('Kal subah AC ki service karwani hai, Rawalpindi mein');
    expect(Object.keys(a)).toEqual(['method', 'methodName', 'versions', 'category', 'skills', 'taskType', 'city', 'when', 'timeSlot', 'urgent', 'budget', 'notes', 'missing']);
    expect(a.method).toBe('rules');
    expect(a.methodName).toBe('rule-based word lists');
    expect(a.versions).toEqual({ analyzer: ANALYZER_VERSION, taxonomy: '2026-11-09-v1', phrases: JOB_PHRASES_VERSION, model: null });
    const json = JSON.stringify(a);
    expect(json).not.toMatch(/score|probab|confiden|percent|%|smart|intelligent|\bAI\b/i);
  });

  test('live use in Batch 8A is the rules only', () => {
    expect(LIVE_METHOD).toBe('rules');
    expect(LIVE_MODEL).toBeNull();
  });

  test('analyzeRules needs the clock passed in (pure: no hidden clock)', () => {
    expect(() => analyzeRules('AC service')).toThrow(/now/);
    expect(() => analyzeJob('AC service', { now: NOW, method: 'magic' })).toThrow(/Unknown/);
    expect(() => analyzeJob('AC service', { now: NOW, method: 'nb' })).toThrow(/model/);
  });
});

describe('category and skills', () => {
  test('weak terms need strong evidence of the same trade; a phrase is strong evidence', () => {
    expect(run('tap leak ho raha hai').category.suggested).toBeNull(); // two weak words only
    const a = run('nalka leak ho raha hai');
    expect(a.category.suggested).toBe('plumbing_sanitary');
    expect(skillIds(a)).toEqual(expect.arrayContaining(['plumb_fixtures', 'plumb_leak']));
  });

  test('option phraseUnlocksWeak=false: the phrase still finds its skill, but weak words stay locked', () => {
    const a = run('nalka leak ho raha hai', { phraseUnlocksWeak: false });
    expect(skillIds(a)).toEqual(['plumb_fixtures']);
  });

  test('option phrases=false: the problem phrases are off (Module 2 terms only)', () => {
    expect(run('AC thanda nahi kar raha', { phrases: false }).skills.map((s) => s.skillId)).toEqual(['ac_general']);
    expect(run('Ghar shift karna hai', { phrases: false }).category.suggested).toBeNull();
  });

  test('option variants=false: spelling variants are not mapped', () => {
    expect(run('pani nhi aa rha').category.suggested).toBe('plumbing_sanitary');
    expect(run('pani nhi aa rha', { variants: false }).category.suggested).toBeNull();
  });

  test('co-occurrence phrases: darar with deewar anywhere in the text', () => {
    const a = run('deewar mein bari darar aa gayi hai');
    expect(skillIds(a)).toContain('mason_plaster');
    expect(run('darar aa gayi hai').skills.map((s) => s.skillId)).not.toContain('mason_plaster');
  });

  test('negative phrases only explain an empty result', () => {
    expect(run('abhi kuch nahi chahiye').notes).toContain('negative_phrase');
    expect(run('abhi kuch nahi chahiye').category.suggested).toBeNull();
  });

  test('a clear winner is suggested; the runner-up stays in ranked', () => {
    const a = run('AC service aur AC gas charging, ek switch bhi');
    expect(a.category.suggested).toBe('ac_appliance_repair');
    expect(a.category.ranked[0]).toBe('ac_appliance_repair');
  });

  test('whole words only, never parts of words', () => {
    expect(run('acha kaam chahiye').category.suggested).toBeNull(); // "acha" contains "ac"
  });
});

describe('task type', () => {
  test('each list in its order, and the trade defaults', () => {
    const cases = [
      ['AC lagwana hai', 'install'],
      ['fridge kharab hai', 'repair'],
      ['AC ki servicing', 'service'],
      ['ghar ki safai karwani hai', 'cleaning'],
      ['samaan shifting karni hai', 'moving'],
      ['khana banane wali chahiye', 'household_help'],
      ['khana banana hai roz', 'household_help'],
      ['tiles lagwane hain kitchen mein', 'new_work'],
      ['raj mistri chahiye', 'new_work'],
      ['jharu pocha wali maasi chahiye', 'cleaning'],
      ['maasi chahiye ghar ke kaam ke liye', 'household_help'],
      ['electrician chahiye', null],
    ];
    for (const [text, type] of cases) expect([text, run(text).taskType.suggested]).toEqual([text, type]);
  });

  test('the domestic default is cleaning only when the cleaning skill was found', () => {
    expect(findTaskType([], 'domestic_work', [{ skillId: 'dom_cleaning' }]).suggested).toBe('cleaning');
    expect(findTaskType([], 'domestic_work', [{ skillId: 'dom_cooking' }]).suggested).toBe('household_help');
    expect(findTaskType([], null, []).suggested).toBeNull();
  });
});

describe('city, day, time, urgency', () => {
  test('Urdu script and Roman spellings; "Pindi" is Rawalpindi', () => {
    expect(run('pindi mein plumber').city).toMatchObject({ suggested: 'Rawalpindi', region: 'PB' });
    expect(run('اسلام آباد میں الیکٹریشن').city).toMatchObject({ suggested: 'Islamabad', region: 'ICT' });
  });

  test('a longer city name wins: Mirpur Khas is not also Mirpur', () => {
    expect(findCity(jobTokens('mirpur khas mein kaam'))).toMatchObject({ suggested: 'Mirpur Khas', region: 'SD', conflict: false });
  });

  test('everyday words that are also city spellings do not suggest a city', () => {
    expect(run('pipe mein kuch atak gaya hai').city.suggested).toBeNull();
    expect(run('wah kya kaam hai, plumber chahiye').city.suggested).toBeNull();
    expect(run('Attock mein plumber chahiye').city.suggested).toBe('Attock');
    // review finding 2 (Batch 8A): the Urdu spelling of "stuck" is the same word as the city's Urdu name
    expect(run('پائپ میں کچھ اٹک گیا ہے، پلمبر چاہیے').city.suggested).toBeNull();
    expect(run('نالی میں کچرا اٹک گیا، کراچی').city).toMatchObject({ suggested: 'Karachi', conflict: false });
  });

  test('an unknown place gives no city (never a guess)', () => {
    expect(run('Chak 45 mein plumber chahiye').city).toMatchObject({ suggested: null, conflict: false });
  });

  test('day words; two different day words give no suggestion; night has no slot', () => {
    expect(run('parson aa jayen').when).toMatchObject({ suggested: 'day_after', date: '2026-11-26' });
    expect(run('aaj ya kal').when.suggested).toBeNull();
    expect(run('raat ko aana').timeSlot.suggested).toBeNull();
    expect(run('subah ya shaam').timeSlot.suggested).toBeNull();
    expect(run('dopehar ko').timeSlot.suggested).toBe('afternoon');
  });

  test('the Pakistan date, not the server date (late at night in Pakistan)', () => {
    const late = new Date('2026-11-24T23:30:00+05:00'); // 18:30 UTC
    expect(analyzeJob('kal aa jayen', { now: late }).when.date).toBe('2026-11-25');
  });

  test('urgency words in three scripts', () => {
    expect(run('foran aa jayen').urgent.suggested).toBe(true);
    expect(run('فوراً آ جائیں').urgent.suggested).toBe(true);
    expect(run('emergency hai').urgent.suggested).toBe(true);
  });
});

describe('budget (raw text)', () => {
  const b = (text) => findBudget(text).suggested;
  test('money words, multipliers, separators, Urdu digits and the /- sign', () => {
    expect(b('budget 15,000 rupay')).toEqual({ amount: 15000, unit: 'job' });
    expect(b('Rs 2 hazar per day')).toEqual({ amount: 2000, unit: 'day' });
    expect(b('1.5k mein ho jaye')).toEqual({ amount: 1500, unit: 'job' });
    expect(b('do hazar rupay')).toEqual({ amount: 2000, unit: 'job' });
    expect(b('dedh lakh ka kaam')).toEqual({ amount: 150000, unit: 'job' });
    expect(b('۲۵۰۰ روپے')).toEqual({ amount: 2500, unit: 'job' });
    expect(b('15000/- tak')).toEqual({ amount: 15000, unit: 'job' });
    expect(b('Rs. 1,50,000')).toEqual({ amount: 150000, unit: 'job' });
    expect(b('budget hai 5000')).toEqual({ amount: 5000, unit: 'job' });
    expect(b('800 rupay ghante ka')).toEqual({ amount: 800, unit: 'hour' });
    expect(b('روزانہ 1500 روپے')).toEqual({ amount: 1500, unit: 'day' });
  });

  test('numbers that are not money: counts, rooms, years, plain numbers', () => {
    expect(b('3 pankhay lagane hain')).toBeNull();
    expect(b('2 rooms paint karne hain')).toBeNull();
    expect(b('2026 mein ghar bana')).toBeNull();
    expect(b('5 saal purana AC')).toBeNull();
  });

  test('two different amounts, or day and hour words both near -> no suggestion', () => {
    expect(b('Rs 2000 ya Rs 3000')).toBeNull();
    expect(b('Rs 2000 rozana ya ghanta')).toBeNull();
    expect(b('Rs 2000 aur phir Rs 2000')).toEqual({ amount: 2000, unit: 'job' });
  });

  test('review finding 3: a free-standing "k" is "ke/ki", not a thousand; digit groups must end in three digits', () => {
    expect(b('Kal 3 k baad aa jayein, AC kharab hai')).toBeNull();
    expect(b('subah 10 k qareeb')).toBeNull();
    expect(b('5k rupay')).toEqual({ amount: 5000, unit: 'job' });
    expect(b('10,12 hazar mein')).toEqual({ amount: 12000, unit: 'job' }); // "10 or 12 thousand", never 1,012,000
    expect(b('Rs 1,000,000')).toEqual({ amount: 1000000, unit: 'job' });
    expect(b('Rs 12,00,000')).toEqual({ amount: 1200000, unit: 'job' });
  });

  test('a unit word far from the amount does not count', () => {
    expect(b('8 ghante ka kaam hai, poore kaam ka budget Rs 3000')).toEqual({ amount: 3000, unit: 'job' });
  });

  test('out of range or not whole rupees', () => {
    expect(findBudget('Rs 50')).toMatchObject({ suggested: null, outOfRange: true });
    expect(findBudget('Rs 90 lakh')).toMatchObject({ suggested: null, outOfRange: true });
    expect(findBudget('Rs 150.5')).toMatchObject({ suggested: null, outOfRange: true });
    expect(findBudget('')).toEqual({ suggested: null, matched: [], outOfRange: false });
  });
});

describe('address hint (never blocks)', () => {
  test('house, street and flat numbers; not other numbers', () => {
    for (const t of ['House no 12 mein', 'H#12 F-8', 'gali 5 mein', 'مکان نمبر 7', 'street 9', 'flat no 3']) expect([t, looksLikeAddress(jobTokens(t))]).toEqual([t, true]);
    for (const t of ['3 pankhay', 'house ki safai', 'gali mein pani']) expect([t, looksLikeAddress(jobTokens(t))]).toEqual([t, false]);
  });
});

describe('the word lists themselves', () => {
  test('phrases use known skill ids, lower case; every variant is one word; task lists are the TASK_TYPES', () => {
    for (const [id, terms] of Object.entries(SKILL_PHRASES)) {
      expect(SKILL_IDS).toContain(id);
      for (const t of terms) expect(t).toBe(t.toLowerCase());
    }
    for (const [spelling, variants] of Object.entries(SPELLING_VARIANTS)) {
      for (const v of [spelling, ...variants]) expect(v).toMatch(/^[a-z]+$/);
    }
    expect(TASK_TYPE_WORDS.map(([type]) => type).every((t) => TASK_TYPES.includes(t))).toBe(true);
    expect(VARIANT_MAP.get('nhi')).toBe('nahi');
  });

  test('the required problem phrases of 5.3 are in version 1', () => {
    const has = (skill, text) => SKILL_PHRASES[skill].some((t) => termMatches(jobTokens(text), compileTerm(t)));
    const required = [
      ['plumb_fixtures', 'nalka'], ['plumb_fixtures', 'nalkay'], ['plumb_fixtures', 'نلکا'], ['plumb_leak', 'tapak'], ['plumb_leak', 'ٹپک'],
      ['plumb_pump', 'pani nahi aa raha'], ['ac_gas', 'thanda nahi'], ['ac_gas', 'cooling nahi'], ['elec_general', 'bijli nahi aa rahi'],
      ['elec_general', 'light chali jati'], ['elec_db', 'short ho gaya'], ['elec_db', 'breaker gir'], ['mason_waterproof', 'seelan'],
      ['mason_waterproof', 'سیلن'], ['mason_plaster', 'darar deewar'], ['mason_plaster', 'crack deewar'], ['paint_interior', 'rang karwana'],
      ['paint_interior', 'paint karwana'], ['dom_cleaning', 'safai karwani'], ['move_shifting', 'shift karna'], ['dom_cooking', 'khana banane wali'],
    ];
    for (const [skill, text] of required) expect([skill, text, has(skill, text)]).toEqual([skill, text, true]);
  });

  test('the city reader knows every spelling of the city table (except the skipped everyday words)', () => {
    const skipped = new Set(['atak', 'اٹک', 'wah', 'mari', 'مری']);
    for (const { spelling, city } of CITY_SPELLINGS) {
      if (skipped.has(spelling)) continue;
      expect([spelling, findCity(jobTokens(spelling)).suggested]).toEqual([spelling, city]);
      expect(canonicalCity(spelling)).toBe(city);
    }
  });
});

describe('properties: nothing crashes, nothing invented', () => {
  const texts = [
    '', '   ', '!!! ??? ،،، ۔۔۔', '12345', 'a'.repeat(500), 'AC '.repeat(160), 'نلکا '.repeat(100),
    'Kal AC service, کراچی mein, Rs ۲۰۰۰, jaldi!!!', 'service AC ki karwani kal subah hai', '🙂🙂 plumber 🙂',
  ];
  test.each(texts.map((t) => [t.slice(0, 30), t]))('%s', (_label, text) => {
    const a = run(text);
    expect(a.method).toBe('rules');
    expect(Array.isArray(a.notes)).toBe(true);
    expect(a.missing).toContain('area');
    if (a.category.suggested) expect(CATEGORY_IDS).toContain(a.category.suggested);
    for (const s of a.skills) expect(skillById(s.skillId).category).toBe(s.category);
    if (a.taskType.suggested) expect(TASK_TYPES).toContain(a.taskType.suggested);
  });

  test('word order does not change the trade', () => {
    expect(run('service AC ki karwani hai').category.suggested).toBe(run('AC ki service karwani hai').category.suggested);
  });

  test('non-text input gives an empty analysis', () => {
    expect(analyzeRules(undefined, { now: NOW }).category.suggested).toBeNull();
    expect(analyzeRules(42, { now: NOW }).notes).toContain('no_trade_words');
  });
});

describe('npm run jobs:try (no database, nothing saved)', () => {
  test('prints the readable table for one text', async () => {
    const { execFileSync } = await import('node:child_process');
    const out = execFileSync(process.execPath, ['scripts/jobsTry.js', 'Kal subah AC ki service karwani hai', '--now', '2026-11-24T10:00:00+05:00'], { encoding: 'utf8' });
    expect(out).toMatch(/trade \(category\)\s+ac_appliance_repair\s+ac, service/);
    expect(out).toMatch(/day\s+tomorrow 2026-11-25\s+kal/);
    expect(out).toMatch(/Nothing was saved/);
  });
  test('without a text it explains how to use it', async () => {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, ['scripts/jobsTry.js'], { encoding: 'utf8' });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/Usage: npm run jobs:try/);
    expect(spawnSync(process.execPath, ['scripts/jobsTry.js', 'AC', '--now', 'yesterday'], { encoding: 'utf8' }).status).toBe(1);
  });
});

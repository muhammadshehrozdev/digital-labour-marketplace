// Module 2: rule-based skill extractor. Every case in "Phase 4 required regression tests"
// (project plan) is here, with the audit ID it covers.
import { describe, test, expect } from 'vitest';
import { extractSkills } from '../../services/skillExtractor/extractor.js';
import { extractExperience } from '../../services/skillExtractor/experience.js';
import { normalizeText, tokenize } from '../../services/skillExtractor/normalize.js';
import { SKILLS, CATEGORIES } from '../../config/skillTaxonomy.js';

const ids = (r) => r.skills.map((s) => s.skillId).sort();
const cats = (r) => r.categories.map((c) => c.id);

describe('normalize.js', () => {
  test('Urdu and Arabic digits become 0-9; Urdu punctuation becomes spaces', () => {
    expect(normalizeText('۵ سال، ٣ مہینے۔')).toBe('5 سال 3 مہینے');
  });
  test('Arabic letter variants become Urdu letters (ي ك ه -> ی ک ہ) and diacritics are removed', () => {
    expect(normalizeText('كام ي')).toBe('کام ی');
    expect(normalizeText('ه')).toBe('ہ');
    expect(normalizeText('مَیں')).toBe('میں');
  });
  test('lower case, punctuation removed, digit/letter split', () => {
    expect(tokenize('PPRC-pipe, 5saal!')).toEqual(['pprc', 'pipe', '5', 'saal']);
  });
});

describe('Phase 4 regression cases', () => {
  test('"Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon" -> plumbing, 5 years, PPRC fitting + geyser', () => {
    const r = extractSkills('Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon');
    expect(r.suggestedCategory).toBe('plumbing_sanitary');
    expect(ids(r)).toEqual(['plumb_general', 'plumb_geyser', 'plumb_pipe']);
    expect(r.experience).toEqual({ years: 5, months: 0 });
    expect(r.skills.find((s) => s.skillId === 'plumb_pipe').matched).toEqual(expect.arrayContaining(['pprc', 'pipe fitting']));
  });

  test('"میں دو سال سے وائرنگ کرتا ہوں" -> 2 years, wiring, NO painting skill (M2-5)', () => {
    const r = extractSkills('میں دو سال سے وائرنگ کرتا ہوں');
    expect(ids(r)).toEqual(['elec_wiring']);
    expect(cats(r)).not.toContain('painting_renovation');
    expect(r.experience).toEqual({ years: 2, months: 0 });
  });

  test('"۵ سال کا تجربہ" -> 5 years (M2-7)', () => {
    expect(extractExperience('۵ سال کا تجربہ').experience).toEqual({ years: 5, months: 0 });
  });

  test('"meri 30000 salary hai, plumbing karta hoon" -> years not detected, plumbing found (M2-7)', () => {
    const r = extractSkills('meri 30000 salary hai, plumbing karta hoon');
    expect(r.experience).toBeNull();
    expect(ids(r)).toEqual(['plumb_general']);
  });

  test('"6 mahine se wiring" -> { years: 0, months: 6 } (M2-7)', () => {
    const r = extractSkills('6 mahine se wiring');
    expect(r.experience).toEqual({ years: 0, months: 6 });
    expect(ids(r)).toEqual(['elec_wiring']);
  });

  test('"آج کی تاریخ اور ستارہ" -> no skill ("تار" inside "تاریخ" and "ستارہ" does not count) (M2-5)', () => {
    const r = extractSkills('آج کی تاریخ اور ستارہ');
    expect(r.skills).toEqual([]);
    expect(r.noSkillReason).toBe('no_trade_words');
  });

  test('"Shuru mein mujhe kuch nahi aata tha, ab 6 saal se wiring aur solar ka kaam karta hoon" -> wiring + solar, 6 years (M2-4)', () => {
    const r = extractSkills('Shuru mein mujhe kuch nahi aata tha, ab 6 saal se wiring aur solar ka kaam karta hoon');
    expect(ids(r)).toEqual(['elec_solar', 'elec_wiring']);
    expect(r.experience).toEqual({ years: 6, months: 0 });
    expect(r.noSkillReason).toBeNull();
  });

  test('"Nothing is impossible. I am a plumber with 10 years experience" -> plumbing, 10 years (M2-4)', () => {
    const r = extractSkills('Nothing is impossible. I am a plumber with 10 years experience');
    expect(r.suggestedCategory).toBe('plumbing_sanitary');
    expect(ids(r)).toEqual(['plumb_general']);
    expect(r.experience).toEqual({ years: 10, months: 0 });
  });

  test.each([
    'I am a big fan of cricket and I like light music',
    'I work as a software tester and fix network router issues',
    'Life has ups and downs',
    'I sit at the table and sleep on the bed',
    'Please tap the button and lock the phone',
  ])('everyday sentence "%s" -> no skills (M2-6)', (sentence) => {
    expect(extractSkills(sentence).skills).toEqual([]);
  });

  test('"hello" -> no skills', () => {
    const r = extractSkills('hello');
    expect(r.skills).toEqual([]);
    expect(r.noSkillReason).toBe('no_trade_words');
  });

  test('a negative phrase with no trade word is reported, not used to delete anything (M2-4)', () => {
    expect(extractSkills('mujhe kuch nahi aata').noSkillReason).toBe('negative_phrase');
  });
});

describe('more rules', () => {
  test('weak terms count when a strong term of the same trade is present', () => {
    const r = extractSkills('Electrician hoon, fan aur light lagata hoon');
    expect(ids(r)).toEqual(['elec_fittings', 'elec_general']);
  });

  test('accepted cost of the weak-term rule: "I install fans and lights" gives no skill', () => {
    expect(extractSkills('I install fans and lights').skills).toEqual([]);
  });

  test('mixed trades: all categories are returned; a tie is reported, not decided (M2-12)', () => {
    const r = extractSkills('Main wiring aur plumbing dono karta hoon');
    expect(cats(r).sort()).toEqual(['electrical_solar', 'plumbing_sanitary']);
    expect(r.categoryTie).toBe(true);
    expect(r.suggestedCategory).toBeNull();
    expect(r.suggestedOccupation).toBeNull();
  });

  test('mixed trades without a tie: the stronger one is suggested, the other still listed', () => {
    const r = extractSkills('wiring, solar, breaker aur kabhi plumbing');
    expect(r.suggestedCategory).toBe('electrical_solar');
    expect(cats(r)).toContain('plumbing_sanitary');
    expect(r.categoryTie).toBe(false);
  });

  test('domestic work is recognised (M2-14)', () => {
    const r = extractSkills('Main ghar ki safai aur khana pakana karti hoon, 3 saal se');
    expect(ids(r)).toEqual(['dom_cleaning', 'dom_cooking']);
    expect(r.suggestedCategory).toBe('domestic_work');
    expect(r.suggestedOccupation).toBe('Domestic worker');
  });

  test('Urdu domestic work: "میں گھر کی صفائی کرتی ہوں" -> house cleaning', () => {
    expect(ids(extractSkills('میں گھر کی صفائی کرتی ہوں'))).toEqual(['dom_cleaning']);
  });

  test('English plural: "I install geysers" -> geyser', () => {
    expect(ids(extractSkills('I install geysers'))).toEqual(['plumb_geyser']);
  });

  test('output has no confidence, level or score (M2-8)', () => {
    const r = extractSkills('5 saal se wiring');
    const text = JSON.stringify(r).toLowerCase();
    for (const word of ['confidence', 'level', 'score', 'percent', 'strength']) expect(text).not.toContain(word);
  });

  test('non-string input does not crash', () => {
    expect(extractSkills(undefined).noSkillReason).toBe('empty');
    expect(extractSkills({ text: 'wiring' }).skills).toEqual([]);
  });
});

describe('experience parser (M2-7)', () => {
  test.each([
    ['5 saal', { years: 5, months: 0 }],
    ['do saal se', { years: 2, months: 0 }],
    ['five years of experience', { years: 5, months: 0 }],
    ['2 saal 6 mahine', { years: 2, months: 6 }],
    ['2 years and 6 months', { years: 2, months: 6 }],
    ['18 mahine', { years: 1, months: 6 }],
    ['پانچ سال', { years: 5, months: 0 }],
    ['6 saal se wiring aur 2 saal se solar', { years: 6, months: 0 }],
  ])('"%s" -> %o', (text, expected) => {
    expect(extractExperience(text).experience).toEqual(expected);
  });

  test('over 60 years is ignored and reported as "please check"', () => {
    expect(extractExperience('70 saal ka tajurba')).toEqual({ experience: null, note: 'over_60' });
  });

  test('"do" or "ek" without a unit is not a number of years', () => {
    expect(extractExperience('I do wiring, ek din').experience).toBeNull();
  });
});

describe('taxonomy integrity', () => {
  test('unique skill ids; every skill is in a known category; every category has at least one skill', () => {
    const skillIds = SKILLS.map((s) => s.id);
    expect(new Set(skillIds).size).toBe(skillIds.length);
    const catIds = CATEGORIES.map((c) => c.id);
    for (const s of SKILLS) {
      expect(catIds).toContain(s.category);
      expect(s.strong.length).toBeGreaterThan(0);
    }
    for (const c of catIds) expect(SKILLS.some((s) => s.category === c)).toBe(true);
  });

  test('no term is both strong and weak, and no term repeats in two skills of the same category', () => {
    for (const c of CATEGORIES) {
      const seen = new Map();
      for (const s of SKILLS.filter((x) => x.category === c.id)) {
        for (const t of [...s.strong, ...s.weak].map(normalizeText)) {
          expect(seen.has(t), `"${t}" in ${seen.get(t)} and ${s.id}`).toBe(false);
          seen.set(t, s.id);
        }
      }
    }
  });
});

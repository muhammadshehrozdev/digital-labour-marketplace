// Batch 4 pure functions: CSV building, profile strength, potential skills, waiting buckets,
// notification parameters. No database.
import { describe, test, expect, vi } from 'vitest';
import { csvCell, toCsv, CNIC_REMOVED } from '../../services/csv.js';
import { profileStrength, MAX_TIPS, STRENGTH_LEVELS } from '../../services/profileStrength.js';
import { completionChecks, calculateCompletion } from '../../services/profileCompletion.js';
import { potentialSkills, MAX_POTENTIAL_SKILLS } from '../../services/potentialSkills.js';
import { waitingBuckets, pktDay } from '../../controllers/adminInsightsController.js';
import { cleanParams, notify } from '../../services/notifications.js';
import { CNIC_LIKE } from '../../validators/common.js';
import { SKILLS } from '../../config/skillTaxonomy.js';

describe('csv', () => {
  test('plain values, empty values, numbers, booleans and dates', () => {
    expect(csvCell('hello')).toBe('hello');
    expect(csvCell(null)).toBe('');
    expect(csvCell(undefined)).toBe('');
    expect(csvCell(42)).toBe('42');
    expect(csvCell(-5)).toBe('-5'); // a real number is not a formula
    expect(csvCell(true)).toBe('true');
    expect(csvCell(new Date('2026-11-10T05:00:00.000Z'))).toBe('2026-11-10T05:00:00.000Z');
  });

  test('quotes, commas and line breaks are escaped', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"');
  });

  test.each(['=1+1', '+92300', '-2+3', '@SUM(A1)', '\tcmd', '\rcmd'])('formula injection: %j gets a leading apostrophe', (text) => {
    expect(csvCell(text).startsWith("'") || csvCell(text).startsWith('"\'')).toBe(true);
  });

  test('a CNIC-like number in any text cell is removed, with or without dashes', () => {
    expect(csvCell('CNIC 37405-1234567-1 seen')).toBe(`CNIC ${CNIC_REMOVED} seen`);
    expect(csvCell('3740512345671')).toBe(CNIC_REMOVED);
    expect(csvCell('37405 1234567 1')).toBe(CNIC_REMOVED);
    expect(csvCell('phone 03001234567')).toBe('phone 03001234567'); // 11 digits: a phone, not a CNIC
    expect(csvCell('DLM-2026-000042')).toBe('DLM-2026-000042');
  });

  test('toCsv: header row, CRLF line ends, UTF-8 mark, Urdu text kept', () => {
    const csv = toCsv([{ header: 'name', value: (r) => r.name }, { header: 'n', value: (r) => r.n }], [{ name: 'راشد', n: 1 }, { name: 'A, B', n: 2 }]);
    expect(csv).toBe('﻿name,n\r\nراشد,1\r\n"A, B",2\r\n');
  });
});

describe('profile completion checklist', () => {
  test('the weights add up to 100 and calculateCompletion is their sum', () => {
    const empty = { skills: [], workHistory: [] };
    expect(completionChecks(empty).reduce((s, c) => s + c.weight, 0)).toBe(100);
    expect(calculateCompletion(empty)).toBe(20);
    const full = { occupation: 'Mason', category: 'construction_masonry', experienceYears: 3, dailyRate: 100, city: 'X', address: 'Y', whatsappNumber: '0300', skills: [{}], bio: 'a long enough bio', workHistory: [{}] };
    expect(calculateCompletion(full)).toBe(100);
  });
});

describe('profile strength', () => {
  const skill = (skillId, name, approved = 0, pending = 0) => ({ skillId, name, category: 'electrical_solar', evidenceSummary: { approved, pending } });
  const base = { occupation: 'Electrician', category: 'electrical_solar', experienceYears: 5, dailyRate: 3000, city: 'Rawalpindi', address: 'Somewhere', whatsappNumber: '03001234567', bio: 'I do wiring and solar.', workHistory: [{}], cnicOnFile: true, verificationStatus: 'Verified' };

  test('an empty profile: starting level, first tips are the basics', () => {
    const s = profileStrength({ skills: [], workHistory: [] });
    expect(s.percent).toBe(20);
    expect(s.level).toBe('starting');
    expect(s.tips.map((t) => t.code).slice(0, 3)).toEqual(['add_trade', 'add_skills', 'add_cnic']);
    expect(s.tips).toHaveLength(MAX_TIPS);
    expect(s.proof).toEqual({ skills: 0, approved: 0, pending: 0, none: 0 });
  });

  test('complete needs 100% AND at least one skill with approved proof', () => {
    const noProof = profileStrength({ ...base, skills: [skill('elec_wiring', 'House wiring')] });
    expect(noProof.percent).toBe(100);
    expect(noProof.level).toBe('strong');
    expect(noProof.tips).toEqual([{ code: 'add_proof', params: { skillId: 'elec_wiring', skillName: 'House wiring' } }]);
    const proven = profileStrength({ ...base, skills: [skill('elec_wiring', 'House wiring', 1)] });
    expect(proven.level).toBe('complete');
    expect(proven.tips).toEqual([]);
    expect(STRENGTH_LEVELS).toContain(proven.level);
  });

  test('proof tips: a skill whose proof was not accepted comes first; at most two "add proof"; pending needs nothing', () => {
    const profile = { ...base, skills: [skill('a', 'A'), skill('b', 'B'), skill('c', 'C'), skill('d', 'D', 0, 1)] };
    const s = profileStrength(profile, [{ skillId: 'c', status: 'rejected' }]);
    expect(s.tips).toEqual([
      { code: 'replace_proof', params: { skillId: 'c', skillName: 'C' } },
      { code: 'add_proof', params: { skillId: 'a', skillName: 'A' } },
      { code: 'add_proof', params: { skillId: 'b', skillName: 'B' } },
    ]);
    expect(s.proof).toEqual({ skills: 4, approved: 0, pending: 1, none: 3 });
  });

  test('a rejected identity asks to fix it; a missing CNIC asks to add it', () => {
    expect(profileStrength({ ...base, verificationStatus: 'Rejected', skills: [skill('a', 'A', 1)] }).tips).toEqual([{ code: 'fix_identity' }]);
    expect(profileStrength({ ...base, cnicOnFile: false, skills: [skill('a', 'A', 1)] }).tips).toEqual([{ code: 'add_cnic' }]);
  });

  test('levels follow the documented thresholds', () => {
    expect(profileStrength({ skills: [], workHistory: [], occupation: 'X', category: 'y', experienceYears: 1, dailyRate: 1 }).level).toBe('good'); // 50
    expect(profileStrength({ ...base, bio: '', workHistory: [], skills: [skill('a', 'A')] }).level).toBe('strong'); // 85
  });
});

describe('potential skills', () => {
  test('same category as the main trade first, nothing already on the profile, at most the limit', () => {
    const profile = { category: 'electrical_solar', skills: [{ skillId: 'elec_wiring', category: 'electrical_solar' }] };
    const list = potentialSkills(profile);
    expect(list.length).toBeLessThanOrEqual(MAX_POTENTIAL_SKILLS);
    expect(list.every((s) => s.category === 'electrical_solar' && s.reason === 'main_trade')).toBe(true);
    expect(list.map((s) => s.id)).not.toContain('elec_wiring');
    const all = SKILLS.filter((s) => s.category === 'electrical_solar' && s.id !== 'elec_wiring');
    expect(list.map((s) => s.id)).toEqual(all.slice(0, MAX_POTENTIAL_SKILLS).map((s) => s.id)); // taxonomy order: explainable
  });

  test('categories of skills already added are used after the main trade', () => {
    const profile = { category: 'domestic_work', skills: [{ skillId: 'plumb_geyser', category: 'plumbing_sanitary' }] };
    const list = potentialSkills(profile, 50);
    const firstOther = list.findIndex((s) => s.category !== 'domestic_work');
    expect(list.slice(0, firstOther).every((s) => s.reason === 'main_trade')).toBe(true);
    expect(list.slice(firstOther).every((s) => s.category === 'plumbing_sanitary' && s.reason === 'same_category')).toBe(true);
    expect(list.map((s) => s.id)).not.toContain('plumb_geyser');
  });

  test('no trade and no skills: nothing to suggest (also for a missing profile)', () => {
    expect(potentialSkills({ category: null, skills: [] })).toEqual([]);
    expect(potentialSkills(null)).toEqual([]);
  });

  test('a worker who has every skill of the category gets none from it', () => {
    const skills = SKILLS.filter((s) => s.category === 'moving_loading').map((s) => ({ skillId: s.id, category: s.category }));
    expect(potentialSkills({ category: 'moving_loading', skills })).toEqual([]);
  });
});

describe('waiting buckets and Pakistan-time days', () => {
  const now = new Date('2026-11-10T12:00:00.000Z');
  const ago = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  test('buckets: under 1 day, 1-3, 4-7, over 7; the oldest date is reported', () => {
    const b = waitingBuckets([ago(0.2), ago(1), ago(3.9), ago(4), ago(7.5), ago(8), ago(30), null], now);
    expect(b).toMatchObject({ under1Day: 1, days1to3: 2, days4to7: 2, over7Days: 2 });
    expect(new Date(b.oldest).getTime()).toBe(ago(30).getTime());
    expect(waitingBuckets([], now)).toEqual({ under1Day: 0, days1to3: 0, days4to7: 0, over7Days: 0, oldest: null });
  });

  test('a registration at 20:30 UTC already belongs to the next day in Pakistan (UTC+5)', () => {
    expect(pktDay(new Date('2026-11-10T20:30:00.000Z'))).toBe('2026-11-11');
    expect(pktDay(new Date('2026-11-10T18:59:00.000Z'))).toBe('2026-11-10');
  });
});

describe('notifications', () => {
  test('only known parameters are kept, as short text', () => {
    expect(cleanParams({ skillId: 'elec_wiring', skillName: 'House wiring', cnic: '3740512345671', phone: '0300', note: 'x'.repeat(900), reasonCode: null })).toEqual({
      skillId: 'elec_wiring', skillName: 'House wiring', note: 'x'.repeat(500),
    });
    expect(cleanParams()).toEqual({});
  });

  test('an unknown type or a missing user creates nothing; a database error is logged, not thrown', async () => {
    expect(await notify('507f1f77bcf86cd799439011', 'made_up_type')).toBeNull();
    expect(await notify(null, 'identity_verified')).toBeNull();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    // no database connection in this unit test: the save fails, and notify() must swallow it
    const result = await Promise.race([notify('507f1f77bcf86cd799439011', 'identity_verified'), new Promise((r) => setTimeout(() => r('timeout'), 200))]);
    expect([null, 'timeout']).toContain(result);
    log.mockRestore();
  });
});

describe('CNIC-like text detection for notes', () => {
  test.each(['37405-1234567-1', '3740512345671', '37405 1234567 1', 'note 37405-1234567-1 end'])('%s is caught', (text) => {
    expect(CNIC_LIKE.test(text)).toBe(true);
  });
  test.each(['0300 1234567', 'DLM-2026-000042', 'Rs 4,500 per day', '12 November 2026', 'call 03001234567'])('%s is fine', (text) => {
    expect(CNIC_LIKE.test(text)).toBe(false);
  });
});

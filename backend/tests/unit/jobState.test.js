// Module 6 (Batch 8A): the job's derived state and actions (4.4), the reservation rule (D-082), the stored analysis
// flags (4.2), the use statistics (4.10) and the matching-query contract for Module 7 (4.11). Pure functions.
import { describe, test, expect } from 'vitest';
import mongoose from 'mongoose';
import { jobState, jobActions, canJob, reservationIsFree, openUntil } from '../../services/jobs/state.js';
import { suggestedFrom, changedFor, analysisRecord, keptSkills } from '../../services/jobs/analysis.js';
import { keptStats } from '../../services/jobs/stats.js';
import { toMatchingQuery } from '../../services/jobs/matchingQuery.js';
import { analyzeJob } from '../../services/jobAnalyzer/index.js';
import { JOB_RULES } from '../../config/jobRules.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-11-24T10:00:00+05:00');
const job = (extra = {}) => ({ status: 'open', createdAt: new Date(NOW.getTime() - DAY), ...extra });
const b = (status) => ({ status });

describe('jobState: the rules in their order', () => {
  test.each([
    ['closed wins over everything', job({ status: 'closed' }), [b('completed'), b('accepted')], 'closed'],
    ['a completed booking -> done (even with others)', job(), [b('declined'), b('completed'), b('requested')], 'done'],
    ['an accepted booking -> accepted', job(), [b('expired'), b('accepted')], 'accepted'],
    ['a requested booking -> requested', job(), [b('cancelled'), b('requested')], 'requested'],
    ['only closed bookings -> open', job(), [b('declined'), b('expired'), b('cancelled')], 'open'],
    ['no bookings -> open', job(), [], 'open'],
    ['old and no activity -> expired', job({ createdAt: new Date(NOW.getTime() - 31 * DAY) }), [], 'expired'],
    ['old but requested -> requested (activity comes first)', job({ createdAt: new Date(NOW.getTime() - 40 * DAY) }), [b('requested')], 'requested'],
    ['old and closed -> closed', job({ status: 'closed', createdAt: new Date(NOW.getTime() - 40 * DAY) }), [], 'closed'],
  ])('%s', (_name, j, bookings, state) => expect(jobState(j, bookings, NOW)).toBe(state));

  test('the 30-day boundary: exactly 30 days is still open, one millisecond more is expired', () => {
    expect(JOB_RULES.OPEN_DAYS).toBe(30);
    expect(jobState(job({ createdAt: new Date(NOW.getTime() - 30 * DAY) }), [], NOW)).toBe('open');
    expect(jobState(job({ createdAt: new Date(NOW.getTime() - 30 * DAY - 1) }), [], NOW)).toBe('expired');
    expect(openUntil(job({ createdAt: NOW })).getTime()).toBe(NOW.getTime() + 30 * DAY);
  });
});

describe('what each state allows (the table of 4.4)', () => {
  test.each([
    ['open', false, ['edit', 'find_workers', 'request', 'close', 'delete']],
    ['open', true, ['edit', 'find_workers', 'request', 'close']],
    ['requested', true, ['find_workers', 'close']],
    ['accepted', true, ['find_workers', 'close']],
    ['done', true, ['close']],
    ['expired', false, ['close', 'delete']],
    ['expired', true, ['close']],
    ['closed', false, ['delete']],
    ['closed', true, []],
  ])('%s (has bookings: %s)', (state, hasBookings, actions) => {
    expect(jobActions(state, { hasBookings })).toEqual(actions);
    for (const a of ['edit', 'find_workers', 'request', 'close', 'delete']) expect(canJob(a, state, { hasBookings })).toBe(actions.includes(a));
  });
  test('an unknown state allows nothing', () => expect(jobActions('magic')).toEqual([]));
});

describe('the one-request reservation (D-082)', () => {
  const id = new mongoose.Types.ObjectId();
  test('free: nothing reserved, or a closed booking', () => {
    expect(reservationIsFree(null, null, NOW)).toBe(true);
    for (const s of ['declined', 'expired', 'cancelled', 'completed']) expect(reservationIsFree(id, { status: s }, NOW)).toBe(true);
  });
  test('taken: an open booking', () => {
    for (const s of ['requested', 'accepted']) expect(reservationIsFree(id, { status: s }, NOW)).toBe(false);
  });
  test('a reservation without its booking: taken while fresh, free after 60 seconds (a crashed request)', () => {
    const fresh = mongoose.Types.ObjectId.createFromTime(Math.floor(NOW.getTime() / 1000) - 10);
    const stale = mongoose.Types.ObjectId.createFromTime(Math.floor(NOW.getTime() / 1000) - 61);
    expect(reservationIsFree(fresh, null, NOW)).toBe(false);
    expect(reservationIsFree(stale, null, NOW)).toBe(true);
    expect(reservationIsFree('not-an-object-id', null, NOW)).toBe(false);
  });
});

describe('the stored analysis: suggested and changed (4.2)', () => {
  const output = analyzeJob('Kal subah AC ki service karwani hai, Rawalpindi mein, budget Rs 3000, jaldi', { now: NOW });
  const s = suggestedFrom(output);
  test('suggested holds ids and values only (no text)', () => {
    expect(s).toEqual({
      category: 'ac_appliance_repair', categoryTie: [], skills: ['ac_general', 'ac_service'], taskType: 'service', city: 'Rawalpindi',
      preferredDate: '2026-11-25', timeSlot: 'morning', urgent: true, budget: { amount: 3000, unit: 'job' }, notes: [],
    });
  });
  test('kept everything -> every flag false; "Pindi" counts as the same city', () => {
    const kept = { category: 'ac_appliance_repair', skills: [{ skillId: 'ac_service' }, { skillId: 'ac_general' }], taskType: 'service', city: 'Pindi', preferredDate: '2026-11-25', timeSlot: 'morning', urgent: true, budget: { amount: 3000, unit: 'job' } };
    expect(Object.values(changedFor(s, kept)).every((v) => v === false)).toBe(true);
  });
  test('changed everything -> every flag true', () => {
    const other = { category: 'electrical_solar', skills: [], taskType: 'repair', city: 'Lahore', preferredDate: null, timeSlot: 'evening', urgent: false, budget: { amount: 3000, unit: 'day' } };
    const c = changedFor(s, other);
    expect(c).toMatchObject({ category: true, taskType: true, city: true, preferredDate: true, timeSlot: true, urgent: true, budget: true });
    expect(c.skills).toBeNull(); // no suggested skill is in the electrical trade: nothing was suggested for it
  });
  test('nothing suggested -> null flags', () => {
    const empty = suggestedFrom(analyzeJob('Hello, kya haal hai', { now: NOW }));
    expect(Object.values(changedFor(empty, { category: 'domestic_work', skills: [], city: 'Lahore', urgent: false })).every((v) => v === null)).toBe(true);
  });
  test('a tie is stored with the tied trades; the record names the method and versions', () => {
    const r = analysisRecord(analyzeJob('electrician aur plumber chahiye', { now: NOW }), { category: 'plumbing_sanitary', skills: [{ skillId: 'plumb_general' }], city: 'Lahore' }, NOW);
    expect(r.suggested.categoryTie).toEqual(['electrical_solar', 'plumbing_sanitary']);
    expect(r.changed.category).toBeNull();
    expect(r.changed.skills).toBe(false);
    expect(r).toMatchObject({ method: 'rules', analyzedAt: NOW, versions: { analyzer: 'job-rules-1' } });
  });
});

describe('review finding 7: more suggested skills than a job may hold', () => {
  const seven = ['plumb_general', 'plumb_pipe', 'plumb_leak', 'plumb_fixtures', 'plumb_geyser', 'plumb_pump', 'plumb_drain'];
  const s = { skills: seven };
  test('saving 5 of 7 suggested skills is kept; a skill that was not suggested, or fewer than 5, is changed', () => {
    expect(keptSkills(seven, seven.slice(0, 5))).toBe(true);
    expect(changedFor(s, { category: 'plumbing_sanitary', skills: seven.slice(2).map((skillId) => ({ skillId })) }).skills).toBe(false);
    expect(changedFor(s, { category: 'plumbing_sanitary', skills: [...seven.slice(0, 4), 'elec_wiring'].map((skillId) => ({ skillId })) }).skills).toBe(true); // one not suggested
    expect(changedFor(s, { category: 'plumbing_sanitary', skills: seven.slice(0, 3).map((skillId) => ({ skillId })) }).skills).toBe(true);
    expect(keptSkills(['a', 'b'], ['b', 'a'])).toBe(true);
  });
  test('the statistics count only the skills the customer removed by choice', () => {
    const job = (saved) => ({ category: 'plumbing_sanitary', inputMode: 'text', skills: saved.map((skillId) => ({ skillId })), analysis: { method: 'rules', suggested: s, changed: {} } });
    expect(keptStats([job(seven.slice(0, 5))]).fields.skills).toMatchObject({ added: 0, removed: 0 }); // 2 could not fit
    expect(keptStats([job(seven.slice(0, 3))]).fields.skills).toMatchObject({ added: 0, removed: 2 }); // 4 left out, 2 had to be
  });
});

describe('use statistics: kept / changed / not suggested (4.10; use, not accuracy)', () => {
  const j = (category, skills, changed, suggestedSkills, extra = {}) => ({
    category, inputMode: 'text', skills: skills.map((skillId) => ({ skillId })), analysis: { method: 'rules', suggested: { skills: suggestedSkills }, changed }, ...extra,
  });
  test('hand-made jobs', () => {
    const jobs = [
      j('ac_appliance_repair', ['ac_general', 'ac_service'], { category: false, skills: false, city: false, urgent: null }, ['ac_general', 'ac_service']),
      j('ac_appliance_repair', ['ac_gas'], { category: false, skills: true, city: null, urgent: true }, ['ac_general', 'ac_service', 'elec_db']),
      j('plumbing_sanitary', [], { category: true, skills: null, city: true }, [], { inputMode: 'voice' }),
    ];
    const r = keptStats(jobs);
    expect(r.jobs).toBe(3);
    expect(r.byMethod).toEqual({ rules: 3 });
    expect(r.byInputMode).toEqual({ text: 2, voice: 1 });
    expect(r.fields.category).toEqual({ kept: 2, changed: 1, notSuggested: 0 });
    expect(r.fields.city).toEqual({ kept: 1, changed: 1, notSuggested: 1 });
    expect(r.fields.urgent).toEqual({ kept: 0, changed: 1, notSuggested: 2 });
    // job 2: ac_gas added; ac_general and ac_service removed (elec_db is another trade: not counted)
    expect(r.fields.skills).toEqual({ kept: 1, changed: 1, notSuggested: 1, added: 1, removed: 2 });
    expect(r.note).toMatch(/use, not correctness/);
    expect(JSON.stringify(r)).not.toMatch(/description|ac_general/);
  });
  test('no jobs', () => expect(keptStats([])).toMatchObject({ jobs: 0, byMethod: {}, byInputMode: {} }));
});

describe('the contract for Module 7 (4.11)', () => {
  test('the documented fields only; never the budget or the description', () => {
    const q = toMatchingQuery({
      category: 'plumbing_sanitary', skills: [{ skillId: 'plumb_leak', name: 'x' }], taskType: 'repair', city: 'Pindi', region: 'PB',
      preferredDate: '2026-11-25', timeSlot: 'morning', urgent: true, budget: { amount: 5000, unit: 'job' }, description: 'secret words', area: 'G-9',
    });
    expect(Object.keys(q)).toEqual(['category', 'skillIds', 'taskType', 'city', 'marketCity', 'region', 'preferredDate', 'timeSlot', 'urgent']);
    expect(q).toEqual({ category: 'plumbing_sanitary', skillIds: ['plumb_leak'], taskType: 'repair', city: 'Pindi', marketCity: 'Rawalpindi', region: 'PB', preferredDate: '2026-11-25', timeSlot: 'morning', urgent: true });
    expect(toMatchingQuery({ category: 'domestic_work', city: 'Chak 5' })).toMatchObject({ skillIds: [], taskType: null, region: null, urgent: false, marketCity: 'chak5' });
  });
});

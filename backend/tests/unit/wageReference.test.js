// Module 5 (Batch 7): regions (§4.1) and the minimum wage reference (§4.6). Pure functions, no database,
// no real clock (`now` is always passed in).
import { describe, test, expect } from 'vitest';
import { CITY_REGIONS, REGIONS, REGION_CODES, canonicalCity, marketCity, regionOf } from '../../config/regions.js';
import { GENERAL_SOURCE, WAGE_CHECKED_ON, WAGE_REFERENCES } from '../../config/wageReferences.js';
import { dailyFromMonthly, hourlyFromMonthly, referenceAge, roundHalfUp, wageReferenceFor, wageReferenceTable } from '../../services/wage/wageReference.js';

describe('regionOf: a city to its region (never a guess)', () => {
  test.each([
    ['Islamabad', 'ICT'],
    [' islamabad ', 'ICT'],
    ['اسلام آباد', 'ICT'],
    ['اسلام‌آباد', 'ICT'], // with an invisible joiner instead of the space
    ['Rawalpindi', 'PB'],
    ['pindi', 'PB'],
    ['راولپنڈی', 'PB'],
    ['RAWAL   PINDI', 'PB'],
    ['Karachi', 'SD'],
    ['کراچی', 'SD'],
    ['Peshawar', 'KP'],
    ['Quetta', 'BA'],
    ['Gilgit', 'GB'],
    ['Muzaffarabad', 'AJK'],
    ['Mirpur', 'AJK'],
    ['Mirpur Khas', 'SD'],
    ['Nawabshah', 'SD'],
    ['Shaheed Benazirabad', 'SD'],
    ['D.G. Khan', 'PB'],
    ['Wah Cantt.', 'PB'],
    ['Mingora', 'KP'],
    ['Swat', 'KP'],
  ])('%s -> %s', (city, region) => {
    expect(regionOf(city)).toBe(region);
  });

  test.each([['Chak 45'], [''], ['   '], [null], [undefined], ['London']])('%s -> null', (city) => {
    expect(regionOf(city)).toBeNull();
  });

  test('Arabic letter variants are read as the Urdu letters (ك -> ک, ي -> ی)', () => {
    expect(regionOf('كراچی')).toBe('SD');
  });

  test('every city of the prompt list is in the table, and every region has names in three languages', () => {
    const needed = ['Islamabad', 'Rawalpindi', 'Lahore', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Gujrat', 'Jhelum',
      'Sahiwal', 'Okara', 'Kasur', 'Rahim Yar Khan', 'Dera Ghazi Khan', 'Attock', 'Chakwal', 'Wah Cantt', 'Taxila', 'Murree', 'Karachi', 'Hyderabad', 'Sukkur', 'Larkana',
      'Nawabshah', 'Mirpur Khas', 'Peshawar', 'Mardan', 'Abbottabad', 'Mingora', 'Kohat', 'Dera Ismail Khan', 'Nowshera', 'Mansehra', 'Haripur', 'Bannu', 'Quetta', 'Gwadar',
      'Turbat', 'Khuzdar', 'Gilgit', 'Skardu', 'Muzaffarabad', 'Mirpur'];
    const listed = CITY_REGIONS.map((c) => c.city);
    for (const city of needed) expect(listed, city).toContain(city);
    for (const c of CITY_REGIONS) expect(regionOf(c.ur), c.ur).toBe(c.region);
    expect(REGION_CODES).toEqual(['ICT', 'PB', 'SD', 'KP', 'BA', 'GB', 'AJK']);
    for (const code of REGION_CODES) for (const lang of ['en', 'ur', 'ur-Latn']) expect(REGIONS[code][lang]).toBeTruthy();
  });

  test('canonicalCity and marketCity: "Pindi" and "Rawalpindi" are the same market; an unknown city keeps its own form', () => {
    expect(canonicalCity('pindi')).toBe('Rawalpindi');
    expect(marketCity('Pindi')).toBe(marketCity('راولپنڈی'));
    expect(canonicalCity('Chak 45')).toBeNull();
    expect(marketCity(' Chak  45 ')).toBe(marketCity('chak 45'));
  });
});

describe('the minimum wage references (§4.6): exactly the team\'s figures', () => {
  test('the config holds exactly the table of §4.6, each with sources and checkedOn 2026-11-19', () => {
    const table = Object.fromEntries(Object.entries(WAGE_REFERENCES).map(([k, r]) => [k, [r.monthly, r.effectiveFrom, r.status, r.statusDate]]));
    expect(table).toEqual({
      ICT: [40700, '2026-07-01', 'notified', '2026-08-19'],
      SD: [43000, '2026-07-01', 'notified', '2026-08-17'],
      PB: [40000, '2025-07-01', 'notified', '2025-09-08'],
      KP: [45000, '2026-07-01', 'announced', '2026-06-19'],
      BA: [40000, null, 'announced', null],
      GB: [null, null, 'none', null],
      AJK: [null, null, 'none', null],
    });
    expect(WAGE_REFERENCES.KP.notifiedFound).toEqual({ monthly: 40000, effectiveFrom: '2025-07-01' });
    expect(WAGE_REFERENCES.BA.notifiedFound).toEqual({ monthly: 37000, effectiveFrom: '2024-07-01' });
    for (const code of ['ICT', 'SD', 'PB', 'KP', 'BA']) {
      const r = WAGE_REFERENCES[code];
      expect(r.region).toBe(code);
      expect(r.checkedOn).toBe('2026-11-19');
      expect(r.sources.length).toBeGreaterThanOrEqual(2);
      for (const s of r.sources) {
        expect(s.title.length).toBeGreaterThan(5);
        expect(s.url).toMatch(/^https:\/\//);
      }
    }
    expect(WAGE_CHECKED_ON).toBe('2026-11-19');
    expect(GENERAL_SOURCE.url).toBe('https://fafen.org/minimum-wage-in-pakistan-laws-process-and-current-rates/');
    expect(Object.isFrozen(WAGE_REFERENCES.ICT.sources)).toBe(true);
  });

  // daily = round(monthly / 26), hourly = round(monthly / 26 / 8), halves up:
  //   ICT 40700 / 26 = 1565.38 -> 1565;  40700 / 208 = 195.67 -> 196
  //   PB  40000 / 26 = 1538.46 -> 1538;  40000 / 208 = 192.31 -> 192
  //   SD  43000 / 26 = 1653.85 -> 1654;  43000 / 208 = 206.73 -> 207
  //   KP  45000 / 26 = 1730.77 -> 1731;  45000 / 208 = 216.35 -> 216
  //   BA  40000 as PB
  test.each([
    ['ICT', 40700, 1565, 196],
    ['PB', 40000, 1538, 192],
    ['SD', 43000, 1654, 207],
    ['KP', 45000, 1731, 216],
    ['BA', 40000, 1538, 192],
  ])('%s: Rs %i a month -> Rs %i a day, Rs %i an hour', (region, monthly, daily, hourly) => {
    expect(dailyFromMonthly(monthly)).toBe(daily);
    expect(hourlyFromMonthly(monthly)).toBe(hourly);
    expect(wageReferenceFor(region)).toMatchObject({ region, monthly, daily, hourly });
  });

  test('the Punjab and Sindh 2025 notifications state Rs 1,538 a day and Rs 192 an hour for Rs 40,000 (the rule matches)', () => {
    expect([dailyFromMonthly(40000), hourlyFromMonthly(40000)]).toEqual([1538, 192]);
  });

  test('halves up: 2.5 -> 3, 2.4999 -> 2; GB, AJK, an unknown region and null have no reference', () => {
    expect(roundHalfUp(2.5)).toBe(3);
    expect(roundHalfUp(2.4999)).toBe(2);
    expect(wageReferenceFor('GB')).toBeNull();
    expect(wageReferenceFor('AJK')).toBeNull();
    expect(wageReferenceFor('XX')).toBeNull();
    expect(wageReferenceFor(null)).toBeNull();
  });
});

describe('referenceAge: the age of a figure is visible, with an injected `now`', () => {
  const ref = { checkedOn: '2026-11-19' };
  test('the same day: 0 days, not stale; 365 days later: not stale; 366 days later: stale', () => {
    expect(referenceAge(ref, new Date('2026-11-19T10:00:00Z'))).toEqual({ checkedOn: '2026-11-19', days: 0, stale: false });
    // 2026-11-19 00:00 Pakistan = 2026-11-18 19:00 UTC; + 365 days = 2027-11-18 19:00 UTC
    expect(referenceAge(ref, new Date('2027-11-18T19:00:00Z'))).toMatchObject({ days: 365, stale: false });
    expect(referenceAge(ref, new Date('2027-11-19T19:00:00Z'))).toMatchObject({ days: 366, stale: true });
  });
  test('a custom limit, a missing date counts as stale, and `now` is required', () => {
    expect(referenceAge(ref, new Date('2026-12-20T12:00:00Z'), 30)).toMatchObject({ days: 31, stale: true });
    expect(referenceAge({ checkedOn: null }, new Date('2026-11-19T10:00:00Z')).stale).toBe(true);
    expect(() => referenceAge(ref)).toThrow(/now/);
    expect(() => referenceAge(ref, new Date('nope'))).toThrow(/now/);
  });
  test('wageReferenceTable: every region in order, "none" for GB and AJK, the age at `now`, anyStale', () => {
    const fresh = wageReferenceTable(new Date('2026-11-20T12:00:00Z'));
    expect(fresh.regions.map((r) => [r.region, r.status, r.daily])).toEqual([
      ['ICT', 'notified', 1565], ['PB', 'notified', 1538], ['SD', 'notified', 1654], ['KP', 'announced', 1731], ['BA', 'announced', 1538], ['GB', 'none', null], ['AJK', 'none', null],
    ]);
    expect(fresh.anyStale).toBe(false);
    expect(fresh.regions.find((r) => r.region === 'KP').notifiedFound).toEqual({ monthly: 40000, effectiveFrom: '2025-07-01', daily: 1538, hourly: 192 });
    expect(fresh).toMatchObject({ checkedOn: '2026-11-19', workingDaysPerMonth: 26, hoursPerDay: 8, staleAfterDays: 365 });
    const old = wageReferenceTable(new Date('2028-01-01T12:00:00Z'));
    expect(old.anyStale).toBe(true);
    expect(old.regions.find((r) => r.region === 'GB').stale).toBe(false); // no figure: nothing to be stale
  });
});

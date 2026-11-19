// The government minimum wage as a reference (Module 5, decision D-068). PURE: no database, no clock
// (`now` is passed in), no randomness. The figures live only in config/wageReferences.js.
//
//   daily  = round(monthly / 26)       whole rupees, halves up
//   hourly = round(monthly / 26 / 8)   (the notifications count 26 working days and 8 hours a day)
import { GENERAL_SOURCE, HOURS_PER_DAY, WAGE_CHECKED_ON, WAGE_REFERENCES, WORKING_DAYS_PER_MONTH } from '../../config/wageReferences.js';
import { WAGE_RULES } from '../../config/wageRules.js';
import { REGION_CODES } from '../../config/regions.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Whole rupees, halves up (for positive amounts). The tiny epsilon keeps x.5 that floating point stores
// as x.4999999 rounding up, as a person would.
export const roundHalfUp = (x) => Math.floor(x + 0.5 + 1e-9);
export const dailyFromMonthly = (monthly) => roundHalfUp(monthly / WORKING_DAYS_PER_MONTH);
export const hourlyFromMonthly = (monthly) => roundHalfUp(monthly / WORKING_DAYS_PER_MONTH / HOURS_PER_DAY);

// The reference for a region code, with the daily and hourly values, or null (unknown region, or a region
// with no figure: then there is no minimum-wage check at all).
export function wageReferenceFor(region, refs = WAGE_REFERENCES) {
  const ref = region ? refs[region] : null;
  if (!ref || ref.status === 'none' || !Number.isFinite(ref.monthly)) return null;
  return {
    region: ref.region ?? region,
    monthly: ref.monthly,
    daily: dailyFromMonthly(ref.monthly),
    hourly: hourlyFromMonthly(ref.monthly),
    status: ref.status,
    effectiveFrom: ref.effectiveFrom ?? null,
    statusDate: ref.statusDate ?? null,
    statusNote: ref.statusNote ?? null,
    notifiedFound: ref.notifiedFound ?? null,
    checkedOn: ref.checkedOn,
    workingDaysPerMonth: WORKING_DAYS_PER_MONTH,
    hoursPerDay: HOURS_PER_DAY,
  };
}

// How old a figure is: { checkedOn, days, stale }. `now` must be passed in (tests never use the real date).
export function referenceAge(ref, now, staleAfterDays = WAGE_RULES.WAGE_REFERENCE_STALE_DAYS) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new Error('pass `now` as a valid Date');
  const checked = Date.parse(`${ref.checkedOn}T00:00:00+05:00`); // the day in Pakistan
  if (Number.isNaN(checked)) return { checkedOn: ref.checkedOn ?? null, days: null, stale: true };
  const days = Math.floor((now.getTime() - checked) / DAY_MS);
  return { checkedOn: ref.checkedOn, days, stale: days > staleAfterDays };
}

// The whole table for GET /api/meta/wage-references: every region (with "none" for no figure), the
// sources, and the age of the figures at `now`.
export function wageReferenceTable(now, refs = WAGE_REFERENCES) {
  const regions = REGION_CODES.map((code) => {
    const raw = refs[code];
    const ref = wageReferenceFor(code, refs);
    const age = raw ? referenceAge(raw, now) : { checkedOn: null, days: null, stale: false };
    return {
      region: code,
      status: raw?.status ?? 'none',
      monthly: ref?.monthly ?? null,
      daily: ref?.daily ?? null,
      hourly: ref?.hourly ?? null,
      effectiveFrom: raw?.effectiveFrom ?? null,
      statusDate: raw?.statusDate ?? null,
      statusNote: raw?.statusNote ?? null,
      notifiedFound: raw?.notifiedFound
        ? { ...raw.notifiedFound, daily: dailyFromMonthly(raw.notifiedFound.monthly), hourly: hourlyFromMonthly(raw.notifiedFound.monthly) }
        : null,
      sources: raw?.sources ?? [],
      checkedOn: raw?.checkedOn ?? null,
      ageDays: age.days,
      stale: raw?.status !== 'none' && age.stale,
    };
  });
  return {
    checkedOn: WAGE_CHECKED_ON,
    workingDaysPerMonth: WORKING_DAYS_PER_MONTH,
    hoursPerDay: HOURS_PER_DAY,
    staleAfterDays: WAGE_RULES.WAGE_REFERENCE_STALE_DAYS,
    anyStale: regions.some((r) => r.stale),
    generalSource: GENERAL_SOURCE,
    regions,
  };
}

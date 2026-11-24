// Government minimum wage references (Module 5, decisions D-067 and D-068). DATA ONLY.
//
// What these figures are: the MONTHLY minimum wage for adult UNSKILLED workers that the federal government
// (Islamabad Capital Territory) and the provinces notify for industrial and commercial establishments. A
// household hiring a plumber for a day may not be covered by these laws, so the app shows a figure as a
// REFERENCE ("a day's work should not be paid less than this"), never as a legal requirement and never as
// legal advice. The notifications count 26 working days a month and 8 hours a day (FAFEN, below).
//
// YEARLY UPDATE (every July, when the new budgets take effect): the team checks each provincial labour
// department's notification and the federal notification for Islamabad, then updates `monthly`,
// `effectiveFrom`, `status`, `statusDate`, `sources` and `checkedOn` here, and commits. The Help Centre shows
// "checked on <date>" and the admin Overview shows a banner when a figure is older than
// WAGE_RULES.WAGE_REFERENCE_STALE_DAYS (services/wage/wageReference.js, referenceAge). Before going live the
// team checks every figure against the official notification (docs/MODULE-5-MANUAL-TEST.md, first section).
// If a figure differs, the TEAM changes it here.
//
// Figures as given by the team (Batch 7 plan, §4.6), checked on 19 Nov 2026. The team checked Balochistan and
// Khyber Pakhtunkhwa again on 23 Nov 2026 and corrected them to the NOTIFIED figures (data correction; those two
// entries carry their own `checkedOn`). Region codes are object keys (see config/regions.js for why).

export const WORKING_DAYS_PER_MONTH = 26; // the notifications' convention (FAFEN)
export const HOURS_PER_DAY = 8; // the notifications' convention (FAFEN)
// the date of the OLDEST check (shown in the Help Centre as "checked on"); an entry checked later has its own checkedOn
export const WAGE_CHECKED_ON = '2026-11-19';

// notified  = an official notification was found;
// announced = announced in the budget, the official notification was not found yet;
// none      = no figure (Gilgit-Baltistan, Azad Jammu and Kashmir).
export const WAGE_STATUSES = Object.freeze(['notified', 'announced', 'none']);

// The general source for the laws and the 26-day and 8-hour convention.
export const GENERAL_SOURCE = Object.freeze({
  title: 'FAFEN, "Minimum Wage in Pakistan: Laws, Process and Current Rates"',
  url: 'https://fafen.org/minimum-wage-in-pakistan-laws-process-and-current-rates/',
});

const ARY_2026 = { title: 'ARY News, 19 Jun 2026', url: 'https://arynews.tv/kp-takes-lead-in-raising-minimum-wage' };

const RAW = {
  ICT: {
    monthly: 40700,
    effectiveFrom: '2026-07-01',
    status: 'notified',
    statusDate: '2026-08-19',
    statusNote: null,
    notifiedFound: null,
    sources: [
      { title: 'WageIndicator, "Minimum Wage Increased in Islamabad, Pakistan from 01 July 2026"', url: 'https://wageindicator.org/ai/work/minimum-wage/updates/2026/minimum-wage-increased-in-islamabad-pakistan-from-01-july-2026-august-20-2026/' },
      { title: 'The News, "Public voices concern over 10pc raise in minimum wage"', url: 'https://www.thenews.pk/print/1420647-public-voices-concern-over-10pc-raise-in-minimum-wage' },
    ],
  },
  SD: {
    monthly: 43000,
    effectiveFrom: '2026-07-01',
    status: 'notified',
    statusDate: '2026-08-17',
    statusNote: null,
    notifiedFound: null,
    sources: [
      { title: 'WageIndicator, "Minimum Wage Increased in Sindh, Pakistan from 1 July 2026"', url: 'https://wageindicator.org/ai/work/minimum-wage/updates/2026/minimum-wage-increased-in-sindh-pakistan-from-1-july-2026-august-19-2026/' },
      { title: 'Express Tribune, 6 Aug 2026', url: 'https://tribune.com.pk/story/2622332/sindh-cabinet-okays-wheat-import-raises-minimum-wage-to-rs43000' },
    ],
  },
  PB: {
    monthly: 40000,
    effectiveFrom: '2025-07-01',
    status: 'notified',
    statusDate: '2025-09-08',
    statusNote: 'reported_unchanged_2026_27',
    notifiedFound: null,
    sources: [
      { title: 'Business Recorder, 10 Sep 2025', url: 'https://www.brecorder.com/news/40382017' },
      { title: 'WageIndicator, Punjab page', url: 'https://wageindicator.org/en-pk/work-in-pakistan/minimum-wage/168-punjab' },
      ARY_2026,
    ],
  },
  KP: {
    monthly: 40000,
    effectiveFrom: '2025-07-01',
    status: 'notified',
    statusDate: null, // no notification date confirmed
    // a note only (not shown as a figure; the app uses the notified Rs 40,000 above)
    statusNote: 'Rs 45,000 announced in the 2026-27 budget; notification not found (checked 23 Nov 2026)',
    notifiedFound: null,
    sources: [
      { title: 'Profit, KP notification of Rs 40,000', url: 'https://profit.pakistantoday.com.pk/2025/09/10/kp-govt-notifies-rs40000-minimum-monthly-wage-for-workers' },
    ],
    checkedOn: '2026-11-23',
  },
  BA: {
    monthly: 37000,
    effectiveFrom: '2024-07-01',
    status: 'notified',
    statusDate: null, // no notification date confirmed
    statusNote: null,
    notifiedFound: null,
    sources: [
      { title: 'WageIndicator, Balochistan page: "Unskilled Workers Minimum wage with effect from July 1, 2024: PKR 37,000"', url: 'https://wageindicator.org/salary/minimum-wage/pakistan/162-balochistan' },
    ],
    checkedOn: '2026-11-23',
  },
  GB: { monthly: null, effectiveFrom: null, status: 'none', statusDate: null, statusNote: null, notifiedFound: null, sources: [] },
  AJK: { monthly: null, effectiveFrom: null, status: 'none', statusDate: null, statusNote: null, notifiedFound: null, sources: [] },
};

const freezeDeep = (value) => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
};

// region code -> { region, monthly, effectiveFrom, status, statusDate, statusNote, notifiedFound, sources, checkedOn }
export const WAGE_REFERENCES = freezeDeep(
  Object.fromEntries(Object.entries(RAW).map(([region, entry]) => [region, { region, ...entry, checkedOn: entry.checkedOn ?? WAGE_CHECKED_ON }]))
);

import { formatRupees, plainNumber } from '../../utils/masks';

// Values, checks and request body for "Your work" (same rules as the server).
// parts: 'work' (trade, experience, rates, availability, bio) and/or 'history' (past jobs).
// The profile editor saves them as separate sections; onboarding saves both at once.
// Checks return dictionary keys (translated where they are shown).
// Rates are shown grouped ("4,500") and sent as plain numbers.
const numberText = (v) => (v === null || v === undefined || v === 0 ? '' : formatRupees(v));
export const ALL_PARTS = ['work', 'history'];

export function workValuesFrom(profile) {
  return {
    occupation: profile?.occupation ?? '',
    category: profile?.category ?? '',
    experienceYears: profile?.experienceYears ?? '',
    hourlyRate: numberText(profile?.hourlyRate),
    dailyRate: numberText(profile?.dailyRate),
    availability: profile?.availability ?? 'Available',
    bio: profile?.bio ?? '',
    workHistory: (profile?.workHistory ?? []).map(({ jobTitle, clientOrEmployer, duration, description }) => ({
      jobTitle, clientOrEmployer: clientOrEmployer ?? '', duration: duration ?? '', description: description ?? '',
    })),
  };
}

const toNumber = (v) => (plainNumber(v).trim() === '' ? 0 : Number(plainNumber(v)));

export function validateWork(v, parts = ALL_PARTS) {
  const e = {};
  if (parts.includes('work')) {
    if (v.occupation.trim().length < 2) e.occupation = 'validation.occupation';
    if (!v.category) e.category = 'validation.category';
    const years = String(v.experienceYears).trim();
    if (years === '' || !/^\d{1,2}$/.test(years) || Number(years) > 60) e.experienceYears = 'validation.experience';
    for (const key of ['hourlyRate', 'dailyRate']) {
      const raw = plainNumber(v[key]).trim();
      if (raw && (!/^\d+(\.\d+)?$/.test(raw) || Number(raw) > 1000000)) e[key] = 'validation.rate';
    }
    if (!e.hourlyRate && !e.dailyRate && toNumber(v.hourlyRate) <= 0 && toNumber(v.dailyRate) <= 0) {
      e.dailyRate = 'validation.rateNeeded';
    }
  }
  if (parts.includes('history')) {
    v.workHistory.forEach((w, i) => {
      if (w.jobTitle.trim().length < 2) e[`job${i}`] = 'validation.jobTitle';
    });
  }
  return e;
}

export function workPayload(v, parts = ALL_PARTS) {
  const payload = {};
  if (parts.includes('work')) {
    Object.assign(payload, {
      occupation: v.occupation.trim(),
      category: v.category,
      experienceYears: Number(v.experienceYears),
      hourlyRate: toNumber(v.hourlyRate),
      dailyRate: toNumber(v.dailyRate),
      availability: v.availability,
      bio: v.bio.trim(),
    });
  }
  if (parts.includes('history')) {
    payload.workHistory = v.workHistory.map((w) => ({
      jobTitle: w.jobTitle.trim(), clientOrEmployer: w.clientOrEmployer.trim(), duration: w.duration.trim(), description: w.description.trim(),
    }));
  }
  return payload;
}

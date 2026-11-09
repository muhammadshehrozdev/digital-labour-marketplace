// Values, checks and request body for the "Your work" form (same rules as the server).
const numberText = (v) => (v === null || v === undefined || v === 0 ? '' : String(v));

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

const toNumber = (v) => (String(v).trim() === '' ? 0 : Number(v));

export function validateWork(v) {
  const e = {};
  if (v.occupation.trim().length < 2) e.occupation = 'Please write your occupation, e.g. Electrician.';
  if (!v.category) e.category = 'Please choose your main trade.';
  const years = String(v.experienceYears).trim();
  if (years === '' || !/^\d{1,2}$/.test(years) || Number(years) > 60) e.experienceYears = 'Write your years of experience as a whole number from 0 to 60.';
  for (const key of ['hourlyRate', 'dailyRate']) {
    const raw = String(v[key]).trim();
    if (raw && (!/^\d+(\.\d+)?$/.test(raw) || Number(raw) > 1000000)) e[key] = 'Write an amount in rupees, e.g. 800.';
  }
  if (!e.hourlyRate && !e.dailyRate && toNumber(v.hourlyRate) <= 0 && toNumber(v.dailyRate) <= 0) {
    e.dailyRate = 'Please give at least one rate (per hour or per day).';
  }
  v.workHistory.forEach((w, i) => {
    if (w.jobTitle.trim().length < 2) e[`job${i}`] = 'Each past job needs a title (at least 2 letters).';
  });
  return e;
}

export function workPayload(v) {
  return {
    occupation: v.occupation.trim(),
    category: v.category,
    experienceYears: Number(v.experienceYears),
    hourlyRate: toNumber(v.hourlyRate),
    dailyRate: toNumber(v.dailyRate),
    availability: v.availability,
    bio: v.bio.trim(),
    workHistory: v.workHistory.map((w) => ({
      jobTitle: w.jobTitle.trim(), clientOrEmployer: w.clientOrEmployer.trim(), duration: w.duration.trim(), description: w.description.trim(),
    })),
  };
}

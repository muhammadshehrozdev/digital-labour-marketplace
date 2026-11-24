// Module 6 (Batch 8B, the re-check rule): what happens to the form when the customer's words are checked (again).
// PURE: plain data in, plain data out (unit tested in src/test/module6.test.jsx).
//
//   - A field the person has NOT touched always shows the newest suggestion (also "nothing" when the new words
//     suggest nothing for it).
//   - A field the person HAS touched keeps the person's value. When the new suggestion is different and not empty,
//     it is offered: "New suggestion: X — use it?" (offers[field]).
//   - Skills follow the final trade: untouched skills = the suggested skills of that trade (at most maxSkills);
//     touched skills keep only the ones of that trade (the others are listed in removedSkills, so the screen can
//     say so).
// Every suggestion is the analyzer's (POST /api/job-requests/analyze); nothing here guesses.

export const SUGGESTED_FIELDS = Object.freeze(['category', 'skills', 'taskType', 'city', 'day', 'timeSlot', 'urgent', 'budget']);

const NO_BUDGET = Object.freeze({ amount: '', unit: null });

// The analyzer's answer in the form's shape. formatAmount turns 15000 into what the rupees box shows ("15,000").
export function suggestionsOf(analysis, { formatAmount = String } = {}) {
  const day = analysis?.when?.suggested ?? null;
  const budget = analysis?.budget?.suggested ?? null;
  return {
    category: analysis?.category?.suggested ?? null,
    taskType: analysis?.taskType?.suggested ?? null,
    city: analysis?.city?.suggested ?? '',
    day: day === 'today' || day === 'tomorrow' ? { day, date: '' } : day ? { day: 'pick', date: analysis.when.date ?? '' } : { day: 'none', date: '' },
    timeSlot: analysis?.timeSlot?.suggested ?? null,
    urgent: analysis?.urgent?.suggested === true, // false = "no urgency word found", never a suggestion of "not urgent"
    budget: budget ? { amount: formatAmount(String(budget.amount)), unit: budget.unit } : { ...NO_BUDGET },
  };
}

// The suggested skills of one trade, in the analyzer's order, at most `max`.
export const suggestedSkills = (analysis, category, max = 5) => (category
  ? (analysis?.skills ?? []).filter((s) => s.category === category).map((s) => s.skillId).slice(0, max)
  : []);

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

export function isEmptyValue(field, v) {
  if (field === 'day') return v.day === 'none';
  if (field === 'budget') return !v.amount && !v.unit;
  if (field === 'skills') return v.length === 0;
  if (field === 'urgent') return v !== true;
  if (field === 'city') return !String(v ?? '').trim();
  return v === null || v === undefined;
}

export function sameValue(field, a, b) {
  if (field === 'day') return a.day === b.day && (a.day !== 'pick' || a.date === b.date);
  if (field === 'budget') return (a.amount ?? '') === (b.amount ?? '') && (a.unit ?? null) === (b.unit ?? null);
  if (field === 'skills') return sameSet(a, b);
  if (field === 'city') return String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();
  return a === b;
}

// The form's value of one field (the day is two keys: day and date).
export const valueOf = (form, field) => (field === 'day' ? { day: form.day, date: form.date } : form[field]);

// form: the current form; touched: a Set of field names the person changed; analysis: the analyzer's answer.
// options.skillCategory(skillId) -> the skill's trade (from the taxonomy), for touched skills.
export function mergeSuggestions(form, touched, analysis, { maxSkills = 5, skillCategory = () => null, formatAmount = String } = {}) {
  const s = suggestionsOf(analysis, { formatAmount });
  const next = { ...form };
  const offers = {};
  for (const field of ['category', 'taskType', 'city', 'day', 'timeSlot', 'urgent', 'budget']) {
    const value = s[field];
    if (!touched.has(field)) {
      if (field === 'day') Object.assign(next, value);
      else next[field] = value;
    } else if (!isEmptyValue(field, value) && !sameValue(field, value, valueOf(form, field))) {
      offers[field] = value;
    }
  }
  const skills = suggestedSkills(analysis, next.category, maxSkills);
  let removedSkills = [];
  if (!touched.has('skills')) {
    next.skills = skills;
  } else {
    next.skills = form.skills.filter((id) => skillCategory(id) === next.category);
    removedSkills = form.skills.filter((id) => !next.skills.includes(id));
    if (skills.length && !sameSet(skills, next.skills)) offers.skills = skills;
  }
  return { form: next, offers, removedSkills };
}

// "Use it": the field takes the offered suggestion and follows the suggestions again (it counts as untouched).
export function takeOffer(form, touched, offers, field) {
  if (!(field in offers)) return { form, touched, offers };
  const value = offers[field];
  const next = field === 'day' ? { ...form, ...value } : { ...form, [field]: value };
  const nextTouched = new Set(touched);
  nextTouched.delete(field);
  const { [field]: _used, ...rest } = offers;
  return { form: next, touched: nextTouched, offers: rest };
}

// The words to show next to a field when its value IS the suggestion ("Suggested from your words: ac, service").
// Returns null when the value is not the suggestion (the person chose something else) or nothing was suggested.
export function suggestionWords(field, form, analysis, { formatAmount = String } = {}) {
  if (!analysis) return null;
  const s = suggestionsOf(analysis, { formatAmount });
  if (field === 'skills' || isEmptyValue(field, s[field]) || !sameValue(field, s[field], valueOf(form, field))) return null;
  const words = {
    category: analysis.category?.matched,
    taskType: analysis.taskType?.matched,
    city: analysis.city?.matched,
    day: analysis.when?.matched,
    timeSlot: analysis.timeSlot?.matched,
    urgent: analysis.urgent?.matched,
    budget: analysis.budget?.matched,
  }[field] ?? [];
  if (field === 'taskType' && analysis.taskType?.fromCategory) return { fromCategory: true, words: [] };
  return { fromCategory: false, words };
}

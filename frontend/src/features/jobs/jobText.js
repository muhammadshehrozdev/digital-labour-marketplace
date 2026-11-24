// Module 6 (Batch 8B): the pictures and words of a job request, and the request bodies. PURE helpers: the server
// decides every state and every button (job.actions); these only choose icons and words, and build EXACTLY the
// documented request bodies (docs/API.md, "Module 6"): never `analysis`, `customer`, `code` or `status`.
import {
  Archive, CircleCheck, CircleHelp, CircleSlash, Ellipsis, FolderOpen, Hammer, HandHeart, Handshake, Hourglass, PlugZap,
  Settings2, SprayCan, TimerOff, Truck, UserCheck, Wrench,
} from 'lucide-react';
import { addDays } from '../booking/bookingText';
import { amountOf } from '../wage/wageLogic';

export const TASK_TYPES = Object.freeze(['install', 'repair', 'service', 'new_work', 'cleaning', 'moving', 'household_help']);
// "none" is the screen's "Not sure" (taskType null)
export const TASK_ICONS = Object.freeze({
  install: PlugZap, repair: Wrench, service: Settings2, new_work: Hammer, cleaning: SprayCan, moving: Truck, household_help: HandHeart, none: CircleHelp,
});

export const JOB_STATES = Object.freeze(['open', 'requested', 'accepted', 'done', 'expired', 'closed']);
export const STATE_LOOK = Object.freeze({
  open: { tone: 'primary', icon: FolderOpen },
  requested: { tone: 'warning', icon: Hourglass },
  accepted: { tone: 'primary', icon: Handshake },
  done: { tone: 'success', icon: CircleCheck },
  expired: { tone: 'neutral', icon: TimerOff },
  closed: { tone: 'neutral', icon: Archive },
});

export const CLOSE_REASONS = Object.freeze(['work_done', 'not_needed', 'found_elsewhere', 'other']);
export const CLOSE_ICONS = Object.freeze({ work_done: CircleCheck, not_needed: CircleSlash, found_elsewhere: UserCheck, other: Ellipsis });

// The screen's day choice: today / tomorrow / pick (a date) / none ("Not decided").
export const DAY_CHOICES = Object.freeze(['today', 'tomorrow', 'pick', 'none']);
// The time of day: the booking slots plus "none" ("Not decided", timeSlot null).
export const TIME_CHOICES = Object.freeze(['morning', 'afternoon', 'evening', 'any', 'none']);
export const BUDGET_UNITS = Object.freeze(['job', 'day', 'hour']);

// A saved date -> the day choice of the form.
export function dayChoiceOf(preferredDate, today) {
  if (!preferredDate) return { day: 'none', date: '' };
  if (preferredDate === today) return { day: 'today', date: '' };
  if (preferredDate === addDays(today, 1)) return { day: 'tomorrow', date: '' };
  return { day: 'pick', date: preferredDate };
}

// The form's day choice -> YYYY-MM-DD or null.
export function dateOf(day, date, today) {
  if (day === 'today') return today;
  if (day === 'tomorrow') return addDays(today, 1);
  if (day === 'pick') return date || null;
  return null;
}

// Every word that led to a suggestion (the union of the "matched" lists), for "Words we found: …".
export function wordsFound(analysis) {
  if (!analysis) return [];
  const lists = [
    analysis.category?.matched, ...(analysis.skills ?? []).map((s) => s.matched), analysis.taskType?.matched, analysis.city?.matched,
    analysis.when?.matched, analysis.timeSlot?.matched, analysis.urgent?.matched, analysis.budget?.matched,
  ];
  return [...new Set(lists.flatMap((l) => l ?? []))];
}

// The budget part of the form -> the body value: both or neither (the server answers JOB_BUDGET_INCOMPLETE otherwise).
export function budgetOf(budget) {
  const amount = amountOf(budget?.amount ?? '');
  if (!amount && !budget?.unit) return null;
  return { amount: amount || null, unit: budget?.unit ?? null };
}

// POST /api/job-requests — exactly the documented fields.
export function createBody({ text, inputMode, form, today }) {
  return {
    description: text.trim(),
    inputMode,
    category: form.category,
    skills: [...form.skills],
    taskType: form.taskType ?? null,
    city: form.city.trim(),
    area: form.area.trim(),
    preferredDate: dateOf(form.day, form.date, today),
    timeSlot: form.timeSlot ?? null,
    urgent: form.urgent === true,
    budget: budgetOf(form.budget),
  };
}

const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const sameBudget = (a, b) => (a === null && b === null) || (a !== null && b !== null && a.amount === b.amount && a.unit === b.unit);

// PATCH /api/job-requests/:id — baseVersion and only the fields that changed (an unchanged field is not sent).
export function editBody({ job, text, inputMode, form, today }) {
  const next = createBody({ text, inputMode, form, today });
  const body = { baseVersion: job.version };
  if (next.description !== job.description) {
    body.description = next.description;
    body.inputMode = inputMode;
  }
  if (next.category !== job.category) body.category = next.category;
  if (!sameList(next.skills, (job.skills ?? []).map((s) => s.skillId))) body.skills = next.skills;
  if (next.taskType !== (job.taskType ?? null)) body.taskType = next.taskType;
  if (next.city !== job.city) body.city = next.city;
  if (next.area !== job.area) body.area = next.area;
  if (next.preferredDate !== (job.preferredDate ?? null)) body.preferredDate = next.preferredDate;
  if (next.timeSlot !== (job.timeSlot ?? null)) body.timeSlot = next.timeSlot;
  if (next.urgent !== (job.urgent === true)) body.urgent = next.urgent;
  if (!sameBudget(next.budget, job.budget ?? null)) body.budget = next.budget;
  return body;
}

// The form of a saved job (the edit page).
export function formOf(job, today, formatAmount) {
  return {
    category: job.category,
    skills: (job.skills ?? []).map((s) => s.skillId),
    taskType: job.taskType ?? null,
    city: job.city ?? '',
    area: job.area ?? '',
    ...dayChoiceOf(job.preferredDate, today),
    timeSlot: job.timeSlot ?? null,
    urgent: job.urgent === true,
    budget: job.budget ? { amount: formatAmount(String(job.budget.amount)), unit: job.budget.unit } : { amount: '', unit: null },
  };
}

export const EMPTY_FORM = Object.freeze({
  category: null, skills: [], taskType: null, city: '', area: '', day: 'none', date: '', timeSlot: null, urgent: false, budget: { amount: '', unit: null },
});

// Client checks before saving (the server checks everything again). Keys are dictionary keys or server codes.
export function checkForm(form, today, maxDays = 30) {
  const errors = {};
  if (!form.category) errors.category = 'jobs.form.needTrade';
  if (form.city.trim().length < 2) errors.city = 'jobs.form.needCity';
  if (form.area.trim().length < 2) errors.area = 'jobs.form.needArea';
  if (form.day === 'pick') {
    if (!form.date) errors.date = 'jobs.form.needDate';
    else if (form.date < today || form.date > addDays(today, maxDays)) errors.date = { code: 'BOOKING_DATE_RANGE', params: { max: maxDays } };
  }
  const amount = amountOf(form.budget?.amount ?? '');
  if (Boolean(amount) !== Boolean(form.budget?.unit)) errors.budget = { code: 'JOB_BUDGET_INCOMPLETE' };
  return errors;
}

// "Budget: Rs 2,000 for the whole job" (money(n) formats the amount), or "No budget written".
export function budgetLine(t, money, budget) {
  return budget ? t(`jobs.budget.line.${budget.unit}`, { amount: money(budget.amount) }) : t('jobs.budget.none');
}

// The one waiting or accepted booking of a job (for "This job is already with a worker" and its link).
export const openBookingOf = (job) => (job?.bookings ?? []).find((b) => b.status === 'requested' || b.status === 'accepted') ?? null;

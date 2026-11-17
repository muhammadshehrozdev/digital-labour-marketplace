// Module 4 display rules (Batch 6, section 4.9). Every number shown comes from the server's
// reputation.public (built from stored reviews and bookings); nothing here invents a rating.
//   - a percentage only when its denominator is 5 or more, otherwise "x of y";
//   - every number has words next to it; status is never shown by colour alone;
//   - the numbers expected / uncertainty / cautious are never shown to customers.
export const PERCENT_MIN = 5;

// "9 of 10" or "90%" (from 5 answers up).
export function shareText(t, yes, total) {
  if (!total) return t('reputation.noAnswers');
  if (total >= PERCENT_MIN) return t('reputation.percent', { percent: Math.round((100 * yes) / total) });
  return t('reputation.xOfY', { yes, total });
}

// One decimal, Western digits in every language (i18n/languages.js).
export const oneDecimal = (n) => (Number.isFinite(n) ? n.toFixed(1) : '');

// A worker with no reviews (or no snapshot at all) is "new on this platform".
export const depthOf = (pub) => (pub && pub.reviewCount > 0 ? pub.depth : 'none');
export const hasJobs = (pub) => Boolean(pub && pub.completedJobs > 0);

export const QUICK_QUESTIONS = Object.freeze(['onTime', 'workQuality', 'polite', 'priceAsAgreed']);
export const REASON_CODES = Object.freeze(['counted_fully', 'weeks_old', 'months_old', 'older_than_a_year', 'auto_completed', 'new_reviewer', 'repeat_reviewer', 'new_reviewer_budget', 'burst']);

// Batch 6B (rep-2): the two new per-review reasons have their own texts; `budget` is B from the rules.
const NEW_REASONS = { new_reviewer_budget: 'b6b.reputation.reason.newReviewerBudget', burst: 'b6b.reputation.reason.burst' };
export function reasonText(t, code, { budget = 1 } = {}) {
  return NEW_REASONS[code] ? t(NEW_REASONS[code], { count: budget }) : t(`reputation.reason.${code}`);
}

// The rules of the live engine come from the server (services/reputation/rules.js) as ids and numbers.
// rep-1 ids keep their Batch 6 texts; the rep-2 ids have new ones. Returns the title and text keys and values.
const OLD_RULES = ['onlyCustomers', 'newerCount', 'sameCustomer', 'hiredOthers'];
export function ruleText(item) {
  const base = OLD_RULES.includes(item.id) ? `reputation.mine.rules.${item.id}` : `b6b.reputation.rules.${item.id}`;
  const values = item.id === 'newAccounts' ? { count: item.values.budget } : item.values ?? {};
  return { titleKey: `${base}.title`, textKey: `${base}.text`, values };
}
// One short line per rule for the Help Centre guide.
export const guideLine = (t, item) => t(`b6b.reputation.guide.${item.id}`, item.id === 'newAccounts' ? { count: item.values.budget } : item.values ?? {});

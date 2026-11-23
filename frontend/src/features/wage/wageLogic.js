// Module 5 (Batch 7): plain helpers shared by the wage components and pages. No components live here, so the
// component files export only components (fast refresh). No price, range or minimum-wage amount is written in
// this file: every amount comes from the API.
import { plainNumber } from '../../utils/masks';
import { regionName } from './wageText';

// "2,500" -> 2500, "" -> null
export const amountOf = (text) => {
  const n = Number(plainNumber(text));
  return text && Number.isFinite(n) && n > 0 ? n : null;
};

// A proposal in the server's shape (null = not answered yet). Only the conditions the category asks are sent.
export function draftOf(price, cond, conditions) {
  const asks = (c) => conditions.includes(c);
  const unit = price.unit;
  return {
    amount: amountOf(price.amount),
    unit,
    quantity: unit === 'job' ? 1 : price.quantity || 1,
    duration: unit === 'job' ? price.duration ?? null : null,
    materials: asks('materials') ? cond.materials ?? null : null,
    advance: asks('advance') ? (cond.advanceChoice === 'none' ? 0 : cond.advanceChoice === 'some' ? amountOf(cond.advanceAmount) : null) : null,
    paymentTiming: asks('paymentTiming') ? cond.paymentTiming ?? null : null,
    paymentMethod: asks('paymentMethod') ? cond.paymentMethod ?? null : null,
    visitCharge: asks('visitCharge') ? cond.visitCharge ?? null : null,
  };
}

// "Agreed Rs 2,500 · Confirmed paid Rs 2,500 · Nothing left to pay"
export function summaryLine(t, money, s) {
  const parts = [];
  if (s.agreedTotal !== null) parts.push(t('wage.pay.agreed', { amount: money(s.agreedTotal) }));
  parts.push(t('wage.pay.confirmed', { amount: money(s.confirmedPaid) }));
  if (s.balance !== null) parts.push(s.balance > 0 ? t('wage.pay.left', { amount: money(s.balance) }) : s.balance === 0 ? t('wage.pay.nothingLeft') : t('wage.pay.more', { amount: money(-s.balance) }));
  return parts.join(' · ');
}

// The minimum wage reference for the voice (amounts as plain numbers, so the voice says them in words).
export function spokenReference(spokenT, lang, r) {
  if (!r) return '';
  return spokenT('wage.spoken.ref', { region: regionName(r.names, lang === 'ur' ? 'ur' : 'en'), daily: r.daily, hours: r.hoursPerDay });
}

// The words of one rule-based check. money(n) writes an amount; names = the region's names (from the API).
export function checkText(t, money, check, { names, lang, viewer } = {}) {
  const p = check.params ?? {};
  const region = names ? regionName(names, lang) : '';
  let text;
  switch (check.id) {
    case 'below_minimum_day':
    case 'below_minimum_hour':
      text = t(`wage.check.${check.id}`, { region, reference: money(p.reference) });
      break;
    case 'below_minimum_job':
      text = t(p.days === 2 ? 'wage.check.below_minimum_job_two' : 'wage.check.below_minimum_job_one', { region, reference: money(p.reference) });
      break;
    case 'missing_condition':
      text = t('wage.check.missing_condition', { condition: t(`wage.condition.${p.condition}`) });
      break;
    case 'below_platform_range':
      text = t('wage.check.below_platform_range', { low: money(p.low) });
      break;
    default:
      text = t(`wage.check.${check.id}`);
  }
  // a note addressed to the other person says whom it is for
  if (check.audience !== 'both' && viewer && check.audience !== viewer) text = t(`wage.check.for.${check.audience}`, { text });
  return text;
}

// Work-protection tips (§4.8)
export const WORKER_TIPS = Object.freeze(['agree_first', 'materials', 'extra_work', 'record_payments', 'safety', 'emergency']);
export const CUSTOMER_TIPS = Object.freeze(['agree_first', 'advance', 'pay_on_time', 'safe_workplace', 'minimum_wage']);

// Which general safety advice fits a trade category.
export function safetyKinds(category) {
  switch (category) {
    case 'electrical_solar':
    case 'ac_appliance_repair':
      return ['electrical', 'height'];
    case 'painting_renovation':
    case 'construction_masonry':
      return ['height', 'chemicals'];
    case 'plumbing_sanitary':
      return ['tanks', 'chemicals'];
    case 'domestic_work':
      return ['chemicals'];
    case 'moving_loading':
    case 'carpentry_woodwork':
    case 'home_maintenance':
      return ['height'];
    default:
      return ['electrical', 'height', 'chemicals', 'tanks'];
  }
}

// The text of a tip (used by the cards, the Help Centre guide and the voice).
export function tipText(t, audience, tip, category) {
  if (tip === 'safety') return [...safetyKinds(category).map((k) => t(`wage.protect.safety.${k}`)), t('wage.protect.safety.general')].join(' ');
  return t(`wage.protect.${audience}.${tip}`);
}

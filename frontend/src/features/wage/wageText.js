// Module 5 (Batch 7) display helpers: pictures and words for the price terms, the conditions and the payment
// records. The server decides every rule and every number (GET /api/meta/work-terms, /api/prices/*,
// /api/bookings/:id); these helpers only choose icons and dictionary keys. No price, range or minimum-wage
// amount is ever written here: every amount comes from the API.
import {
  AlertTriangle, Ban, Banknote, BadgeCheck, CalendarClock, CalendarDays, CalendarRange, CircleAlert, CircleCheck, CircleDashed, CircleHelp, Clock, Clock3,
  Coins, CreditCard, HandCoins, Hourglass, Info, Landmark, Package, PackageCheck, ShoppingCart, Smartphone, Sun, Timer, Truck, Wallet, Wrench,
} from 'lucide-react';

export const UNIT_ICONS = Object.freeze({ job: Wrench, day: Sun, hour: Clock });
export const DURATION_ICONS = Object.freeze({ few_hours: Clock3, one_day: Sun, two_three_days: CalendarDays, longer: CalendarRange });
export const MATERIALS_ICONS = Object.freeze({ customer_buys: ShoppingCart, included_in_price: PackageCheck, worker_buys_customer_pays: Truck });
export const TIMING_ICONS = Object.freeze({ after_work: CircleCheck, daily: CalendarClock, part_before_rest_after: HandCoins });
export const METHOD_ICONS = Object.freeze({ cash: Banknote, easypaisa: Smartphone, jazzcash: Smartphone, bank: Landmark, other: Wallet });
export const VISIT_ICONS = Object.freeze({ none: Ban, included: PackageCheck, separate: Coins });
export const KIND_ICONS = Object.freeze({ advance: HandCoins, part: Coins, final: Banknote, materials: Package, extra_work: Wrench });
export const ADVANCE_ICONS = Object.freeze({ none: Ban, some: HandCoins });
export const REASON_ICONS = Object.freeze({ not_received: CircleAlert, wrong_amount: CircleHelp, other: Info });

// payment record status and payment state: tone + icon + words (never colour alone)
export const RECORD_LOOK = Object.freeze({
  awaiting_confirmation: { tone: 'warning', icon: Hourglass },
  confirmed: { tone: 'success', icon: BadgeCheck },
  disputed: { tone: 'danger', icon: AlertTriangle },
});
export const STATE_LOOK = Object.freeze({
  no_price: { tone: 'neutral', icon: CircleDashed },
  not_paid: { tone: 'warning', icon: Timer },
  part_paid: { tone: 'primary', icon: Coins },
  paid: { tone: 'success', icon: CircleCheck },
  has_dispute: { tone: 'danger', icon: AlertTriangle },
});
export const CHECK_ICONS = Object.freeze({ warning: AlertTriangle, info: Info });
export const PAY_ICON = CreditCard;

// The order of the condition questions on the form (the server says which ones a category asks).
export const CONDITION_ORDER = Object.freeze(['materials', 'advance', 'paymentTiming', 'paymentMethod', 'visitCharge']);

// "Rs 2,500" in the website language (digits stay Western, as everywhere in the app).
export const rupees = (t, formatNumber, n) => t('common.rupees', { amount: formatNumber(n) });
// The same amount for the VOICE: "2500 rupees", so a device voice says it in words.
export const spokenRupees = (spokenT) => (n) => spokenT('wage.spoken.rupees', { amount: n });

// One line for a price: "Rs 2,500 for the whole job", "Rs 1,600 a day × 3 = Rs 4,800".
// `money(n)` writes one amount: rupees() on the screen, spokenRupees() for the voice. `prefix` chooses the
// key group: 'wage.price' (screen) or 'wage.spoken.price' (voice).
export function priceLine(t, money, p, prefix = 'wage.price') {
  if (!p || !Number.isFinite(p.amount)) return '';
  const amount = money(p.amount);
  if (p.unit === 'job') return t(`${prefix}.job`, { amount });
  const per = t(`${prefix}.${p.unit}`, { amount });
  return p.quantity > 1 ? t(`${prefix}.times.${p.unit}`, { per, count: p.quantity, total: money(p.total ?? p.amount * p.quantity) }) : per;
}

const materialsWhat = (category) => (category === 'domestic_work' ? 'cleaning_supplies' : category === 'moving_loading' ? 'packing_material' : 'materials');

// The conditions of a version as short sentences, for the summary and the read-back (also spoken).
export function conditionWords(t, money, p, { category } = {}) {
  if (!p) return [];
  const words = [];
  if (p.unit === 'job' && p.duration) words.push(t(`wage.duration.say.${p.duration}`));
  if (p.materials) words.push(t(`wage.materials.say.${p.materials}`, { what: t(`wage.materialsKind.${materialsWhat(category)}`) }));
  if (p.advance === 0) words.push(t('wage.advance.say.none'));
  else if (Number.isFinite(p.advance)) words.push(t('wage.advance.say.amount', { amount: money(p.advance) }));
  if (p.paymentTiming || p.paymentMethod) {
    const method = p.paymentMethod ? t(`wage.method.name.${p.paymentMethod}`) : null;
    const timing = p.paymentTiming ? t(`wage.timing.say.${p.paymentTiming}`) : null;
    words.push(method && timing ? t('wage.payment.say.both', { method, timing }) : method ? t('wage.payment.say.method', { method }) : t('wage.payment.say.timing', { timing }));
  }
  if (p.visitCharge) words.push(t(`wage.visit.say.${p.visitCharge}`));
  return words;
}
export { materialsWhat };

// The read-back of a proposal: "You propose: Rs 2,500 for the whole job. The customer buys the materials. ..."
export function readBack(t, money, p, { category, prefix = 'wage.price', intro = 'wage.readBack.you' } = {}) {
  return [t(intro, { price: priceLine(t, money, p, prefix) }), ...conditionWords(t, money, p, { category })].join(' ');
}

// The region's name from the names the API sent ({ en, ur, 'ur-Latn', short? }).
export const regionName = (names, lang) => (names ? names.short?.[lang] ?? names[lang] ?? names.en : '');

// 'YYYY-MM-DD' -> a date in words (the day in Pakistan, shown at noon so no time zone moves it).
export const dayDate = (formatDate, day) => formatDate(`${day}T12:00:00Z`, { day: 'numeric', month: 'long', year: 'numeric' });
// 'YYYY-MM' -> "November 2026"
export const monthWords = (formatDate, month) => formatDate(`${month}-15T12:00:00Z`, { month: 'long', year: 'numeric' });

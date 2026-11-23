// Input masks with live checks (Batch 4, feature 7). Pure functions: text in, formatted text out,
// plus a small "how is it going" answer for the hint under the field.
//   CNIC    12345-1234567-1   (13 digits)
//   mobile  0300-1234567      (11 digits, starts with 03; +92 300... is rewritten to 0300...)
//   rupees  4,500             (whole rupees, grouped; at most 1,000,000)
const digits = (text) => String(text ?? '').replace(/\D/g, '');

export function formatCnic(text) {
  const d = digits(text).slice(0, 13);
  return [d.slice(0, 5), d.slice(5, 12), d.slice(12)].filter(Boolean).join('-');
}

export function formatMobile(text) {
  let d = digits(text);
  if (d.startsWith('0092')) d = `0${d.slice(4)}`;
  else if (d.startsWith('92') && d.length > 10) d = `0${d.slice(2)}`;
  else if (d.startsWith('3')) d = `0${d}`; // "300 1234567" typed without the zero
  d = d.slice(0, 11);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

export const MAX_RUPEES = 1000000;
export function formatRupees(text) {
  const d = digits(String(text ?? '').split('.')[0]).replace(/^0+(?=\d)/, '').slice(0, 7);
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// Urdu (۰-۹) and Arabic (٠-٩) digits typed on a phone keypad -> 0-9, so the rupees mask keeps them (Batch 7).
export const westernDigits = (text) => String(text ?? '').replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
// "4,500" -> "4500" (what the forms validate and send)
export const plainNumber = (text) => String(text ?? '').replace(/,/g, '');

// state: 'empty' | 'typing' | 'ok' | 'problem'; message: a dictionary key (+ params) or null.
export function maskStatus(mask, value, { max = MAX_RUPEES } = {}) {
  const d = digits(value);
  if (d.length === 0) return { state: 'empty', message: null };
  if (mask === 'cnic') {
    return d.length === 13 ? { state: 'ok', message: 'workerx.masks.cnicOk' } : { state: 'typing', message: 'workerx.masks.cnicMore', params: { count: 13 - d.length } };
  }
  if (mask === 'mobile') {
    if (!'03'.startsWith(d.slice(0, 2)) && !d.startsWith('03')) return { state: 'problem', message: 'workerx.masks.mobileStart' };
    return d.length === 11 ? { state: 'ok', message: 'workerx.masks.mobileOk' } : { state: 'typing', message: 'workerx.masks.mobileMore', params: { count: 11 - d.length } };
  }
  if (mask === 'rupees') {
    const amount = Number(d);
    // max (Batch 7): a price may go up to Rs 5,000,000; the Module 1 rates keep their Rs 1,000,000 limit
    if (amount > max) return max === MAX_RUPEES ? { state: 'problem', message: 'workerx.masks.rupeesMax' } : { state: 'problem', message: 'wage.form.amountMax', params: { max: formatRupees(String(max)) } };
    return { state: 'ok', message: 'workerx.masks.rupees', params: { amount: formatRupees(d) } };
  }
  return { state: 'empty', message: null };
}

export const MASKS = { cnic: formatCnic, mobile: formatMobile, rupees: formatRupees };

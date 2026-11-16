// The contact-info check (Module 4, decision D-041). PURE.
// Booking descriptions, review comments and worker replies may not contain contact details, so nobody
// can pass a phone number before a booking is accepted (that would get around decision D-002).
// Rejected: an email address, a web link, a CNIC-like number (#####-#######-#), or 10 or more digits
// once spaces, dots, dashes and similar separators are removed. Western, Urdu and Arabic digits all count.
// Known limit (documented): numbers written as words ("zero three zero zero ...") are not caught.
import { toWesternDigits } from '../skillExtractor/normalize.js';

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/u;
const LINK = /(?:https?:\/\/|www\.|wa\.me\/|\b[a-z0-9-]+\.(?:com|net|org|pk|io|co|me|info|biz|app|link|ly|site|online|store|xyz)\b)/iu;
const CNIC_LIKE = /\d{5}\s*[-‐-―]?\s*\d{7}\s*[-‐-―]?\s*\d/u;
// separators people put between digits: spaces (any kind), dots, dashes, brackets, slashes, plus, commas
const SEPARATORS = /[\s.\-‐-―_()[\]{}/\\+,،·٫٬]/gu;
const LONG_DIGITS = /\d{10,}/u;

// Returns the kind of contact detail found ('email' | 'link' | 'cnic' | 'number'), or null.
export function findContactInfo(text) {
  if (typeof text !== 'string' || text.trim() === '') return null;
  const plain = toWesternDigits(text.normalize('NFKC'));
  if (EMAIL.test(plain)) return 'email';
  if (LINK.test(plain)) return 'link';
  if (CNIC_LIKE.test(plain)) return 'cnic';
  if (LONG_DIGITS.test(plain.replace(SEPARATORS, ''))) return 'number';
  return null;
}

export const hasContactInfo = (text) => findContactInfo(text) !== null;

// A phone number in one form for comparison (BOOKING_SELF): digits only, +92 / 0092 / 92 -> 0.
export function normalizePhone(value) {
  const digits = toWesternDigits(String(value ?? '')).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0092')) return `0${digits.slice(4)}`;
  if (digits.startsWith('92') && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}

// wa.me link from a stored Pakistani number (03XXXXXXXXX -> 923XXXXXXXXX).
export function whatsappLink(value) {
  const phone = normalizePhone(value);
  if (!/^03\d{9}$/.test(phone)) return null;
  return `https://wa.me/92${phone.slice(1)}`;
}

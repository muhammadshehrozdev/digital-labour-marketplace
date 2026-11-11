// Splits a text into parts that match the search words and parts that do not (Batch 4, feature 21).
// The words are escaped before they become a pattern, so typing "(" or "*" cannot break the page.
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function splitMatches(text, query) {
  const words = String(query ?? '').trim().split(/\s+/).filter((w) => w.length >= 2).map(escape);
  if (!text || words.length === 0) return [{ text: String(text ?? ''), match: false }];
  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  return String(text).split(pattern).filter((part) => part !== '').map((part, i) => ({ text: part, match: i % 2 === 1 }));
}

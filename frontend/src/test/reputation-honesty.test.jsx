// Batch 6, section 10 (the honesty test change, D-056): stars are allowed only in src/features/reputation/,
// and NO rating is ever invented: the landing page, the Help Centre and the dictionaries show no example
// rating (no star sign, no average like "4.8 stars", no "(120 reviews)").
import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import en from '../i18n/dictionaries/en';
import ur from '../i18n/dictionaries/ur';
import urLatn from '../i18n/dictionaries/ur-Latn';
import { flattenKeys, lookup, isPluralObject } from '../i18n/translate';
import { mockApi } from './mockApi';
import { renderAt } from './renderApp';

// an average next to a star word, or a review count written as a number (placeholders are fine)
const EXAMPLE_RATING = /★|\b\d[.,]\d\s*(?:\/\s*5\s*)?(?:stars?|ستار|sitaar)|\(\s*\d+\s*(?:reviews?|ریویو)\s*\)|\b\d+\s+(?:reviews|ریویو)\b/i;
const texts = (dict) => flattenKeys(dict).flatMap((k) => {
  const v = lookup(dict, k);
  return isPluralObject(v) ? Object.values(v) : [v];
});

describe('no invented ratings', () => {
  test.each([['en', en], ['ur', ur], ['ur-Latn', urLatn]])('%s dictionary: no example rating anywhere', (_lang, dict) => {
    const bad = texts(dict).filter((t) => typeof t === 'string' && EXAMPLE_RATING.test(t));
    expect(bad).toEqual([]);
  });

  test.each([['/', 'the landing page'], ['/help', 'the Help Centre']])('%s (%s) shows no example rating', async (path) => {
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt(path);
    await screen.findAllByRole('heading', { level: 1 });
    expect(document.body.textContent).not.toMatch(EXAMPLE_RATING);
  });

  test('the pattern itself catches the kinds of invented rating it is meant to catch', () => {
    for (const fake of ['★ 4.8', '4.8 stars', '4,9/5 stars', '(120 reviews)', '120 reviews', '4.7 ستارے']) expect(fake).toMatch(EXAMPLE_RATING);
    for (const fine of ['{count} reviews', 'Five stars: very good work.', '5 mein se {count} sitaaray', 'Choose from 1 to 5 stars']) expect(fine).not.toMatch(EXAMPLE_RATING);
  });
});

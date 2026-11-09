// M1-16: one category list, including domestic work, served by the API.
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { CATEGORY_IDS, categoryIdFrom, publicTaxonomy } from '../../config/skillTaxonomy.js';
import { createApp } from '../../app.js';

describe('skill taxonomy (M1-16)', () => {
  test('has all 8 old UI categories plus Domestic Work, with unique ids', () => {
    const labels = publicTaxonomy().categories.map((c) => c.label);
    for (const old of [
      'Home Maintenance', 'Electrical & Solar', 'Plumbing & Sanitary', 'Construction & Masonry',
      'Carpentry & Woodwork', 'Painting & Renovation', 'AC & Appliance Repair', 'Cleaning & Shifting',
    ]) {
      expect(labels).toContain(old);
    }
    expect(labels).toContain('Domestic Work');
    expect(new Set(CATEGORY_IDS).size).toBe(CATEGORY_IDS.length);
  });

  test('every category the old profiler can output maps to a taxonomy id', () => {
    for (const label of [
      'Electrical & Solar', 'Plumbing & Sanitary', 'Carpentry & Woodwork',
      'Construction & Masonry', 'AC & Appliance Repair', 'Painting & Renovation',
    ]) {
      expect(CATEGORY_IDS).toContain(categoryIdFrom(label));
    }
    expect(categoryIdFrom('None')).toBeNull();
    expect(categoryIdFrom({ $ne: 'x' })).toBeNull();
  });

  test('no ISCO code is filled in without being checked (all null for now)', () => {
    expect(publicTaxonomy().categories.every((c) => c.iscoCode === null)).toBe(true);
  });

  test('GET /api/meta/taxonomy serves the same list without login or database', async () => {
    const res = await request(createApp()).get('/api/meta/taxonomy');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('provisional');
    expect(res.body.categories.map((c) => c.id)).toEqual([...CATEGORY_IDS]);
    expect(res.body.availability).toEqual(['Available', 'Busy', 'Offline']);
  });
});

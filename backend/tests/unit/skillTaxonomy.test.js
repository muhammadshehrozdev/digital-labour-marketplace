// M1-16 / D-012: one category list, served by the API.
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { CATEGORY_IDS, SKILL_IDS, categoryIdFrom, publicTaxonomy } from '../../config/skillTaxonomy.js';
import { createApp } from '../../app.js';

describe('skill taxonomy (M1-16, D-012)', () => {
  test('9 categories: no "Cleaning & Shifting" overlap; Domestic Work and Moving & Loading exist', () => {
    const labels = publicTaxonomy().categories.map((c) => c.label);
    expect(labels).toEqual([
      'Electrical & Solar', 'Plumbing & Sanitary', 'Construction & Masonry', 'Carpentry & Woodwork',
      'Painting & Renovation', 'AC & Appliance Repair', 'Home Maintenance', 'Domestic Work', 'Moving & Loading',
    ]);
    expect(new Set(CATEGORY_IDS).size).toBe(CATEGORY_IDS.length);
  });

  test('old labels and ids still map (old profiler labels, "Cleaning & Shifting" -> Domestic Work)', () => {
    for (const label of ['Electrical & Solar', 'Plumbing & Sanitary', 'Carpentry & Woodwork',
      'Construction & Masonry', 'AC & Appliance Repair', 'Painting & Renovation']) {
      expect(CATEGORY_IDS).toContain(categoryIdFrom(label));
    }
    expect(categoryIdFrom('Cleaning & Shifting')).toBe('domestic_work');
    expect(categoryIdFrom('cleaning_shifting')).toBe('domestic_work');
    expect(categoryIdFrom('None')).toBeNull();
    expect(categoryIdFrom({ $ne: 'x' })).toBeNull();
  });

  test('no ISCO code is filled in without being checked (all null)', () => {
    expect(publicTaxonomy().categories.every((c) => c.iscoCode === null)).toBe(true);
  });

  test('GET /api/meta/taxonomy serves categories and skills (without matching terms), no login needed', async () => {
    const res = await request(createApp()).get('/api/meta/taxonomy');
    expect(res.status).toBe(200);
    expect(res.body.categories.map((c) => c.id)).toEqual([...CATEGORY_IDS]);
    expect(res.body.skills.map((s) => s.id)).toEqual([...SKILL_IDS]);
    expect(res.body.skills[0]).toEqual({ id: expect.any(String), name: expect.any(String), category: expect.any(String) });
    expect(res.body.availability).toEqual(['Available', 'Busy', 'Offline']);
  });
});

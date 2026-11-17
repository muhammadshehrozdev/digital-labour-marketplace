// Batch 6B: the reputation rules are generated from the parameters (services/reputation/rules.js), so the worker
// page and the Help Centre say what the live engine does; and they are served without login or database.
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { reputationRules } from '../../services/reputation/rules.js';
import { LIVE_ENGINE, REP1_PARAMS, rep2Params } from '../../config/reputationParams.js';

describe('reputation rules from the parameters', () => {
  test('rep-1: the four Batch 6 rules, with the half-life', () => {
    const r = reputationRules(REP1_PARAMS);
    expect(r).toMatchObject({ engineVersion: 'rep-1', rankBy: 'cautious', newReviewerBudget: null, burstCheck: false, halfLifeDays: 365, lateCancelHours: 24 });
    expect(r.items.map((i) => i.id)).toEqual(['onlyCustomers', 'newerCount', 'sameCustomer', 'hiredOthers']);
  });

  test('rep-2: no "newer reviews count more"; the budget B in the words; the burst rule only when it is on; late cancellation', () => {
    const off = reputationRules(rep2Params({ newReviewerBudget: 3, burst: false }));
    expect(off).toMatchObject({ engineVersion: 'rep-2', rankBy: 'expected', newReviewerBudget: 3, burstCheck: false, halfLifeDays: null });
    expect(off.items).toEqual([
      { id: 'onlyCustomers', values: {} },
      { id: 'sameCustomer', values: {} },
      { id: 'newAccounts', values: { budget: 3 } },
      { id: 'lateCancel', values: { hours: 24 } },
    ]);
    const on = reputationRules(rep2Params({ newReviewerBudget: 1, burst: true }));
    expect(on.items.map((i) => i.id)).toEqual(['onlyCustomers', 'sameCustomer', 'newAccounts', 'burst', 'lateCancel']);
    expect(on.items.find((i) => i.id === 'burst').values).toEqual({ days: 14, count: 4 });
  });

  test('GET /api/meta/reputation-rules: public, the live engine, ids and numbers only', async () => {
    const res = await request(createApp()).get('/api/meta/reputation-rules');
    expect(res.status).toBe(200);
    expect(res.body.engineVersion).toBe(LIVE_ENGINE);
    expect(Object.keys(res.body).sort()).toEqual(['burstCheck', 'engineVersion', 'halfLifeDays', 'items', 'lateCancelHours', 'newReviewerBudget', 'rankBy']);
    expect(JSON.stringify(res.body)).not.toMatch(/"(expected|cautious|uncertainty|r|s|paramsHash)":/); // no score numbers
  });
});

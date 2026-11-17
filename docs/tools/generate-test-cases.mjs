// Builds docs/TEST-CASES.md from REAL Vitest JSON reports (no hand-written results).
// Usage (from the repository root):
//   cd backend;  npx vitest run --reporter=json --outputFile=../.local/test-backend.json;  cd ..
//   cd frontend; npx vitest run --reporter=json --outputFile=../.local/test-frontend.json; cd ..
//   node docs/tools/generate-test-cases.mjs .local/test-backend.json .local/test-frontend.json
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const [backendFile, frontendFile] = process.argv.slice(2);
if (!backendFile || !frontendFile) {
  console.error('Usage: node docs/tools/generate-test-cases.mjs <backend.json> <frontend.json>');
  process.exit(1);
}

const MODULE = {
  // backend
  'setup.test.js': 'Infrastructure', 'foundation.test.js': 'Infrastructure', 'db-down.test.js': 'Infrastructure',
  'model-hooks.test.js': 'Infrastructure', 'multer-express5.test.js': 'Infrastructure',
  'auth.test.js': 'Module 1', 'auth-rate-limit.test.js': 'Module 1', 'hotfix-critical.test.js': 'Module 1',
  'workers-profile.test.js': 'Module 1', 'directory.test.js': 'Module 1', 'admin.test.js': 'Module 1',
  'migrations.test.js': 'Module 1', 'cnic.test.js': 'Module 1',
  'skillTaxonomy.test.js': 'Module 2', 'skillExtractor.test.js': 'Module 2', 'evaluationMetrics.test.js': 'Module 2',
  'skills.test.js': 'Module 1–2', 'honesty.test.js': 'Module 2',
  'skillConfidence.test.js': 'Module 3', 'evidence.test.js': 'Module 3',
  // frontend
  'contrast.test.js': 'UI', 'components.test.jsx': 'UI', 'auth.test.jsx': 'Module 1 (UI)', 'pages.test.jsx': 'Module 1 (UI)',
  'onboarding.test.jsx': 'Module 1–2 (UI)', 'evidence.test.jsx': 'Module 3 (UI)',
  // Batch 3
  'errorCatalog.test.js': 'Languages (API error codes)', 'preferences.test.js': 'Module 1',
  'i18n.test.jsx': 'Languages (UI)', 'voice.test.jsx': 'Module 2 (UI)',
  // Batch 4
  'batch4-features.test.js': 'Batch 4 features', 'batch4-admin.test.js': 'Admin (Batch 4)',
  'batch4-services.test.js': 'Batch 4 features', 'indexes.test.js': 'Infrastructure', 'middleware.test.js': 'Infrastructure',
  'brand.test.jsx': 'UI (logo)', 'theme.test.jsx': 'UI (dark mode)', 'design.test.jsx': 'UI (design v3)',
  'admin-batch4.test.jsx': 'Admin (Batch 4, UI)', 'customer-batch4.test.jsx': 'Customer (Batch 4, UI)',
  'worker-batch4.test.jsx': 'Worker (Batch 4, UI)', 'app-batch4.test.jsx': 'App-wide (Batch 4, UI)',
  // go-live kit (D-032)
  'create-indexes.test.js': 'Infrastructure', 'demo-reset.test.js': 'Infrastructure', 'deploy-config.test.js': 'Deployment', 'health-client-ip.test.js': 'Deployment',
  // Batch 5: Listen, Speak, See
  'assist.test.jsx': 'Batch 5 easy mode (UI)', 'assist-pictures.test.jsx': 'Batch 5 easy mode (UI)', 'assist-pages.test.jsx': 'Batch 5 easy mode (UI)',
  'assistCoverage.test.jsx': 'Batch 5 easy mode (UI)', 'assistClips.test.js': 'Batch 5 easy mode (UI)', 'spokenNumbers.test.js': 'Batch 5 easy mode (UI)',
  // Batch 6: Module 4
  'reputationEngine.test.js': 'Module 4', 'reliabilityEngine.test.js': 'Module 4', 'reputationSensitivity.test.js': 'Module 4',
  'reputationEvaluation.test.js': 'Module 4 (evaluation)', 'bookingRules.test.js': 'Module 4', 'module4-config.test.js': 'Deployment',
  'bookings.test.js': 'Module 4', 'reviews-reputation.test.js': 'Module 4', 'demo-module4.test.js': 'Infrastructure',
  'module4.test.jsx': 'Module 4 (UI)', 'module4-lists.test.jsx': 'Module 4 (UI)', 'admin-module4.test.jsx': 'Admin (Module 4, UI)', 'reputation-honesty.test.jsx': 'Module 4 (UI honesty)',
};

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();

function rows(report, prefix, side) {
  const out = [];
  let n = 0;
  for (const file of report.testResults) {
    const name = basename(file.name);
    const module = side === 'frontend' && name === 'honesty.test.js' ? 'Module 2 (UI)' : MODULE[name] ?? 'Other';
    const scans = file.assertionResults.filter((t) => t.ancestorTitles.some((a) => /honest wording/.test(a)) && /has no|no "AI"/.test(t.title));
    for (const t of file.assertionResults) {
      if (scans.includes(t)) continue;
      const [before, ...after] = t.title.split(' -> ');
      const where = t.ancestorTitles.join(' › ');
      n += 1;
      out.push({
        id: `${prefix}-${String(n).padStart(3, '0')}`,
        module,
        description: esc(t.title),
        steps: esc(`${side}/${name}: ${where}${after.length ? ` — ${before}` : ''}`),
        expected: esc(after.length ? after.join(' -> ') : t.title),
        actual: t.status === 'passed' ? 'As expected' : esc((t.failureMessages?.[0] ?? 'failed').split('\n')[0]),
        result: t.status === 'passed' ? 'Pass' : t.status === 'failed' ? 'Fail' : t.status,
      });
    }
    if (scans.length) {
      n += 1;
      const failed = scans.filter((t) => t.status !== 'passed').length;
      out.push({
        id: `${prefix}-${String(n).padStart(3, '0')}`,
        module,
        description: `Honesty scan of ${scans.length} source files (no "AI" label, no confidence score)`,
        steps: esc(`${side}/${name}: read every source file`),
        expected: 'No file contains the banned wording',
        actual: failed ? `${failed} file(s) failed` : 'As expected',
        result: failed ? 'Fail' : 'Pass',
      });
    }
  }
  return out;
}

const backend = JSON.parse(readFileSync(backendFile, 'utf8'));
const frontend = JSON.parse(readFileSync(frontendFile, 'utf8'));
const all = [...rows(backend, 'TC-BE', 'backend'), ...rows(frontend, 'TC-FE', 'frontend')];
const date = new Date(Math.max(backend.startTime, frontend.startTime)).toISOString().slice(0, 16).replace('T', ' ');
const summary = (r) => `${r.numPassedTests}/${r.numTotalTests} passed, ${r.numFailedTests} failed, ${r.testResults.length} files`;

const byModule = {};
for (const r of all) {
  byModule[r.module] ??= { total: 0, pass: 0 };
  byModule[r.module].total += 1;
  if (r.result === 'Pass') byModule[r.module].pass += 1;
}

const md = [
  '# Test cases (generated from the real test run)',
  '',
  `Generated by \`docs/tools/generate-test-cases.mjs\` from Vitest JSON reports of the run on **${date} UTC**.`,
  'Every row is an automated test in the repository; "Actual" and "Result" come from that run, not from hand.',
  '',
  `- Backend (\`backend/tests\`): ${summary(backend)}`,
  `- Frontend (\`frontend/src\`): ${summary(frontend)}`,
  '- The file-by-file honesty scans are shown as one row per side (all files listed in the test output).',
  '',
  '| Module | Rows | Pass |',
  '|---|---|---|',
  ...Object.entries(byModule).map(([m, v]) => `| ${m} | ${v.total} | ${v.pass} |`),
  '',
  '| ID | Module | Description | Steps (where) | Expected result | Actual result | Pass/Fail |',
  '|---|---|---|---|---|---|---|',
  ...all.map((r) => `| ${r.id} | ${r.module} | ${r.description} | ${r.steps} | ${r.expected} | ${r.actual} | ${r.result} |`),
  '',
].join('\n');
writeFileSync(new URL('../TEST-CASES.md', import.meta.url), md);
console.log(`Wrote docs/TEST-CASES.md: ${all.length} rows (${backend.numTotalTests + frontend.numTotalTests} tests).`);

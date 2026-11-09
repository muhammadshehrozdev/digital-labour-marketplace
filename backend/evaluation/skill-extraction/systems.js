// The systems compared in the evaluation. Each takes a text and returns
// { skills: Set<skillId>, category: id|null, experience: {years, months}|null }.
import { extractSkills } from '../../services/skillExtractor/extractor.js';
import { SKILLS, categoryIdFrom } from '../../config/skillTaxonomy.js';
import { runLegacyProfiler } from '../baselines/legacyProfiler.js';
import { mapLegacySkillName } from '../../scripts/lib/migrations.js';

const fromExtractor = (options) => (text) => {
  const r = extractSkills(text, options);
  return { skills: new Set(r.skills.map((s) => s.skillId)), category: r.suggestedCategory, experience: r.experience };
};

// Naive baseline: English only, single words, exact match, no weak-term rule, no normalisation.
const ENGLISH_SINGLE = SKILLS.flatMap((s) =>
  [...s.strong, ...s.weak].filter((t) => /^[a-z0-9]+$/.test(t)).map((t) => [t, s.id])
);
function naiveEnglish(text) {
  const words = new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const skills = new Set(ENGLISH_SINGLE.filter(([t]) => words.has(t)).map(([, id]) => id));
  return { skills, category: null, experience: null };
}

// The old profiler (moved to baselines/), with its skill names mapped to taxonomy ids.
function legacy(text) {
  const r = runLegacyProfiler({ rawExperienceText: text });
  const skills = new Set(
    (r.categorizedSkills || [])
      .map((c) => mapLegacySkillName(c.skillName, c.category))
      .filter((m) => m && !m.custom)
      .map((m) => m.skillId)
  );
  const years = Number(r.detectedYears) || 0;
  return { skills, category: categoryIdFrom(r.detectedCategory), experience: years > 0 ? { years, months: 0 } : null };
}

// Ablation order (C5): dictionary only -> + normalisation -> + Urdu-script terms -> + weak-term rule.
export const SYSTEMS = {
  extractor: fromExtractor({}),
  ablation_1_dictionary_only: fromExtractor({ normalize: false, urduTerms: false, weakRule: false }),
  ablation_2_plus_normalisation: fromExtractor({ normalize: true, urduTerms: false, weakRule: false }),
  ablation_3_plus_urdu_terms: fromExtractor({ normalize: true, urduTerms: true, weakRule: false }),
  baseline_legacy_profiler: legacy,
  baseline_naive_english: naiveEnglish,
};

// "You may also do..." (Batch 4, feature 11; proposal Module 2: "identification of potential
// skills that can be added to the worker profile"). Rule-based and explainable: a potential skill
// is a taxonomy skill from the SAME category as the worker's main trade, or as a skill already on
// the profile, that is not on the profile yet. No learning, no scores. The worker confirms each
// one with one tap (POST /api/workers/me/skills, addedVia "related").
import { SKILLS, DISPLAY_NAMES } from '../config/skillTaxonomy.js';

export const MAX_POTENTIAL_SKILLS = 8;

export function potentialSkills(profile, limit = MAX_POTENTIAL_SKILLS) {
  const mine = profile?.skills ?? [];
  const have = new Set(mine.map((s) => s.skillId));
  // Categories in order: the main trade first, then the categories of the skills already added
  // (the one with the most skills first).
  const counts = new Map();
  for (const s of mine) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  const fromSkills = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category);
  const categories = [...new Set([profile?.category, ...fromSkills].filter(Boolean))];

  const suggestions = [];
  for (const category of categories) {
    for (const skill of SKILLS) {
      if (skill.category !== category || have.has(skill.id)) continue;
      suggestions.push({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        i18n: { ...DISPLAY_NAMES.skills[skill.id] },
        // why it is suggested, in words the website translates
        reason: category === profile?.category ? 'main_trade' : 'same_category',
      });
    }
  }
  return suggestions.slice(0, limit);
}

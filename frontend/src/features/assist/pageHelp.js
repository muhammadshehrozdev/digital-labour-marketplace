// Which page help (help.screen.<name>) belongs to a page (Batch 5). Admin and developer pages have
// none: they are out of scope, so the page help button is not shown there.
const EXACT = {
  '/': 'landing',
  '/login': 'login',
  '/register': 'register',
  '/help': 'helpCentre',
  '/voice-check': 'voiceCheck',
  '/onboarding/about': 'onboardingAbout',
  '/onboarding/work': 'onboardingWork',
  '/onboarding/skills': 'onboardingSkills',
  '/onboarding/proof': 'onboardingProof',
  '/onboarding/done': 'onboardingDone',
  '/worker': 'dashboard',
  '/worker/profile': 'profile',
  '/worker/profile/edit': 'profileEdit',
  '/notifications': 'notifications',
  '/find': 'find',
  '/saved': 'saved',
  '/compare': 'compare',
};

export const PAGE_HELP_NAMES = [...new Set([...Object.values(EXACT), 'workerProfile'])];

export function pageHelpName(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (EXACT[path]) return EXACT[path];
  if (/^\/workers\/[^/]+$/.test(path)) return 'workerProfile';
  return null;
}

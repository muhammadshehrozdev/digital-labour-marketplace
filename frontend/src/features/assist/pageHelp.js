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
  // Module 4 (Batch 6)
  '/bookings': 'myBookings',
  '/worker/requests': 'requests',
  '/worker/jobs': 'myJobs',
  '/worker/reviews': 'myReviews',
  '/worker/reputation': 'myReputation',
};

// Pages with an id in the address (Module 4 adds four).
const PATTERNS = [
  [/^\/workers\/[^/]+\/request$/, 'requestWorker'],
  [/^\/workers\/[^/]+$/, 'workerProfile'],
  [/^\/bookings\/[^/]+\/rate$/, 'rateWork'],
  [/^\/bookings\/[^/]+$/, 'bookingDetail'],
  [/^\/worker\/jobs\/[^/]+$/, 'bookingDetail'],
];

export const PAGE_HELP_NAMES = [...new Set([...Object.values(EXACT), ...PATTERNS.map(([, name]) => name)])];

export function pageHelpName(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (EXACT[path]) return EXACT[path];
  return PATTERNS.find(([pattern]) => pattern.test(path))?.[1] ?? null;
}

// Where each role goes after login. A worker who has not finished onboarding is sent on from
// /worker to the right onboarding step by the route guard (RequireOnboarding).
export function homePathFor(role) {
  if (role === 'worker') return '/worker';
  if (role === 'customer') return '/find';
  if (role === 'admin') return '/admin';
  return '/login';
}

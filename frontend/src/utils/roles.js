// Where each role goes after login.
export function homePathFor(role) {
  if (role === 'worker') return '/worker-profile';
  if (role === 'customer') return '/customer-dashboard';
  if (role === 'admin') return '/admin-dashboard';
  return '/login';
}

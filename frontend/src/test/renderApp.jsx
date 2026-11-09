import { useLayoutEffect } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppRoutes, Providers } from '../App';

let currentPath = '';
function LocationProbe() {
  const { pathname } = useLocation();
  // Layout effect: updated in the same commit as the new page, so tests never see a stale path.
  useLayoutEffect(() => {
    currentPath = pathname;
  }, [pathname]);
  return null;
}
export const pathname = () => currentPath;

export function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Providers>
        <AppRoutes />
        <LocationProbe />
      </Providers>
    </MemoryRouter>
  );
}

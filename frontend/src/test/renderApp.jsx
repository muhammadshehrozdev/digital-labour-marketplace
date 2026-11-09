import { useEffect } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppRoutes, Providers } from '../App';

let currentPath = '';
function LocationProbe() {
  const { pathname } = useLocation();
  useEffect(() => {
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

// Batch 6B, Part A: the header never cuts anything off. jsdom has no layout, so the widths are mocked:
// the header row "needs" a width that depends on the level written on <header> (data-fit), and the test
// checks the collapse ORDER and that collapsed things stay reachable (the real widths are checked by the
// Playwright test e2e/header-fit.e2e.js).
import { afterEach, describe, expect, test } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HEADER_LEVELS, fitLevel } from '../components/layout/headerFit';
import { mockApi, me } from './mockApi';
import { renderAt } from './renderApp';

// What each level needs (px, made up for the test); the row is `width` px wide.
const NEEDS = { full: 1400, noHint: 1340, noName: 1150, toolsInMenu: 950, toolsInMenuMark: 760, mobile: 700, mobileTools: 520, mobileMark: 330, mobileTight: 280,
  guestMark: 600, noCreate: 450, guestTight: 300 };

function fakeHeader(width) {
  const header = { dataset: {} };
  const row = { clientWidth: width, get scrollWidth() { return Math.max(width, NEEDS[header.dataset.fit]); } };
  return { header, row };
}

describe('collapse order (headerFit.js)', () => {
  test.each([
    [1500, 'full'], [1345, 'noHint'], [1200, 'noName'], [1000, 'toolsInMenu'], [800, 'toolsInMenuMark'], [720, 'mobile'], [600, 'mobileTools'], [400, 'mobileMark'], [300, 'mobileTight'],
    [100, 'mobileTight'], // nothing fits: the last level
  ])('logged in, row %i px -> %s', (width, want) => {
    const { header, row } = fakeHeader(width);
    expect(fitLevel(header, row, HEADER_LEVELS.user).name).toBe(want);
    expect(header.dataset.fit).toBe(want);
  });

  test('the flags only ever add up: each level keeps what the one before it hid (except the mobile switch)', () => {
    const user = HEADER_LEVELS.user.map((l) => l.name);
    // Batch 8B (D-101): toolsInMenuMark, the shield only while the links are still in the bar
    expect(user).toEqual(['full', 'noHint', 'noName', 'toolsInMenu', 'toolsInMenuMark', 'mobile', 'mobileTools', 'mobileMark', 'mobileTight']);
    expect(HEADER_LEVELS.guest.map((l) => l.name)).toEqual(['full', 'noHint', 'toolsInMenu', 'guestMark', 'noCreate', 'guestTight']);
    // the night-mode button is the very last thing to leave the bar (Batch 4: on every page)
    for (const levels of Object.values(HEADER_LEVELS)) {
      expect(levels.filter((l) => l.theme === 'menu').map((l) => l.name)).toEqual([levels.at(-1).name]);
    }
    const { header, row } = fakeHeader(1000);
    fitLevel(header, row, HEADER_LEVELS.user);
    expect(header.dataset).toMatchObject({ fit: 'toolsInMenu', fitHint: 'off', fitAccountName: 'off', fitTools: 'menu' });
    expect(header.dataset.fitNav).toBeUndefined(); // a flag of an earlier try is removed again
  });
});

describe('the header in the app', () => {
  let restore = null;
  // the row "needs" NEEDS[level]; it is `width` px wide
  function mockRowWidth(width) {
    const proto = window.HTMLElement.prototype;
    const sw = Object.getOwnPropertyDescriptor(proto, 'scrollWidth') ?? Object.getOwnPropertyDescriptor(window.Element.prototype, 'scrollWidth');
    const cw = Object.getOwnPropertyDescriptor(proto, 'clientWidth') ?? Object.getOwnPropertyDescriptor(window.Element.prototype, 'clientWidth');
    Object.defineProperty(proto, 'scrollWidth', { configurable: true, get() { return this.hasAttribute('data-header-row') ? Math.max(width, NEEDS[this.closest('header').dataset.fit] ?? 0) : 0; } });
    Object.defineProperty(proto, 'clientWidth', { configurable: true, get() { return this.hasAttribute('data-header-row') ? width : 0; } });
    restore = () => {
      if (sw) Object.defineProperty(proto, 'scrollWidth', sw); else delete proto.scrollWidth;
      if (cw) Object.defineProperty(proto, 'clientWidth', cw); else delete proto.clientWidth;
    };
  }
  afterEach(() => { restore?.(); restore = null; });

  const CUSTOMER = { 'GET /auth/me': me('customer', { name: 'Ayesha Siddiqui (synthetic)', email: 'a.very.long.address.for.the.menu@example.com' }), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } };

  test('no room for the name: initials stay, the name is still in the button for screen readers and in the menu', async () => {
    mockRowWidth(1200);
    mockApi(CUSTOMER);
    const user = userEvent.setup();
    renderAt('/find');
    const header = await screen.findByRole('banner');
    await waitFor(() => expect(header).toHaveAttribute('data-fit', 'noName'));
    const button = within(header).getByRole('button', { name: /Account menu/ });
    expect(button).toHaveAccessibleName('Ayesha Siddiqui (synthetic), Account menu'); // the same name as before the collapse
    expect(header).toHaveAttribute('data-fit-account-name', 'off'); // the CSS hides it on screen
    // Regression (found by the e2e test): React must not hide it too. A class from an earlier level made a
    // re-measure see a shorter row and settle on "full", and the name then overflowed the window.
    expect(within(button).getByText('Ayesha Siddiqui (synthetic)')).not.toHaveClass('visually-hidden');
    expect(button).toHaveAttribute('title', 'Ayesha Siddiqui (synthetic)');
    // Sound and language are still in the bar at this level
    expect(within(header).getByRole('button', { name: 'Sound settings' })).toBeInTheDocument();
    await user.click(button);
    const menu = header.querySelector('#account-menu');
    expect(within(menu).getByText('Ayesha Siddiqui (synthetic)')).toBeVisible();
    // the long email ends with "…" on screen; the whole address is in its title
    expect(within(menu).getByText('a.very.long.address.for.the.menu@example.com')).toHaveAttribute('title', 'a.very.long.address.for.the.menu@example.com');
    expect(within(menu).queryByRole('radiogroup', { name: 'Language' })).toBeNull();
  });

  test('less room: Sound and language move into the account menu with icons and words, and still work', async () => {
    mockRowWidth(1000);
    const calls = mockApi({ ...CUSTOMER, 'PATCH /users/me/preferences': { status: 200, data: {} } });
    const user = userEvent.setup();
    renderAt('/find');
    const header = await screen.findByRole('banner');
    await waitFor(() => expect(header).toHaveAttribute('data-fit', 'toolsInMenu'));
    await user.click(within(header).getByRole('button', { name: /Account menu/ }));
    const menu = header.querySelector('#account-menu');
    const languages = within(menu).getByRole('radiogroup', { name: 'Language' });
    expect(within(languages).getAllByRole('radio').map((r) => r.textContent)).toEqual(['English', 'اردو', 'Roman Urdu']);
    expect(within(menu).getByRole('group', { name: 'Sound and help' })).toBeInTheDocument();
    expect(within(menu).getByRole('switch', { name: /Show the Listen and Speak buttons/ })).toBeChecked();
    expect(within(menu).getByRole('radiogroup', { name: 'Text size' })).toBeInTheDocument();
    await user.click(within(languages).getByRole('radio', { name: 'Roman Urdu' }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('lang', 'ur-Latn'));
    await waitFor(() => expect(calls.some((c) => c.key === 'PATCH /users/me/preferences' && c.body.preferredLanguage === 'ur-Latn')).toBe(true));
  });

  // Batch 8B (D-101): with the customer's fifth link the row is too short for toolsInMenu in English; the words of the
  // logo go first, so the links stay in the bar and the account menu still holds Sound and language
  test('a little less room: only the shield stays, the links stay in the bar, Sound and language are in the account menu', async () => {
    mockRowWidth(800);
    mockApi(CUSTOMER);
    const user = userEvent.setup();
    renderAt('/find');
    const header = await screen.findByRole('banner');
    await waitFor(() => expect(header).toHaveAttribute('data-fit', 'toolsInMenuMark'));
    expect(header).toHaveAttribute('data-fit-brand', 'mark');
    expect(header).not.toHaveAttribute('data-fit-nav');
    expect(within(header).getByRole('link', { name: 'My job requests' })).toBeInTheDocument(); // the CSS shows the bar's links (no nav flag)
    await user.click(within(header).getByRole('button', { name: /Account menu/ }));
    const menu = header.querySelector('#account-menu');
    expect(within(menu).getByRole('radiogroup', { name: 'Language' })).toBeInTheDocument();
    expect(within(menu).getByRole('group', { name: 'Sound and help' })).toBeInTheDocument();
  });

  test('phone width: the links, the account and (when needed) Sound and language are in the mobile menu', async () => {
    mockRowWidth(500);
    mockApi(CUSTOMER);
    const user = userEvent.setup();
    renderAt('/find');
    const header = await screen.findByRole('banner');
    await waitFor(() => expect(header).toHaveAttribute('data-fit', 'mobileMark'));
    await user.click(within(header).getByRole('button', { name: 'Open menu' }));
    const mobile = header.querySelector('#mobile-menu');
    expect(within(mobile).getByRole('link', { name: 'My bookings' })).toBeInTheDocument();
    expect(within(mobile).getByRole('radiogroup', { name: 'Language' })).toBeInTheDocument();
    expect(within(mobile).getByRole('group', { name: 'Sound and help' })).toBeInTheDocument();
    expect(within(mobile).getByText('Ayesha Siddiqui (synthetic)')).toBeInTheDocument();
    // the night-mode button is still in the bar
    expect(within(header).getAllByRole('button', { name: /dark/i }).length).toBeGreaterThan(0);
  });

  test('visitors: a "More" menu holds language, sound and text size', async () => {
    mockRowWidth(1000);
    mockApi({ 'GET /auth/me': { status: 401, data: { message: 'no' } } });
    const user = userEvent.setup();
    renderAt('/login');
    const header = await screen.findByRole('banner');
    await waitFor(() => expect(header).toHaveAttribute('data-fit', 'toolsInMenu'));
    await user.click(within(header).getByRole('button', { name: 'More' }));
    const more = within(header).getByRole('group', { name: 'More settings: language, sound and text size' });
    expect(within(more).getByRole('radiogroup', { name: 'Language' })).toBeInTheDocument();
    expect(within(more).getByRole('radiogroup', { name: 'Text size' })).toBeInTheDocument();
    expect(within(more).getByRole('switch', { name: /Read aloud by itself/ })).not.toBeChecked();
    await user.keyboard('{Escape}');
    expect(within(header).queryByRole('group', { name: /More settings/ })).toBeNull();
    expect(within(header).getByRole('button', { name: 'More' })).toHaveFocus();
  });
});

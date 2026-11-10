// Design v3 (Batch 4, Part 2): the illustration system, the bento landing page, the 404 page.
import { describe, test, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SceneArt, TradeArt, SCENE_IDS, TRADE_ART_IDS } from '../components/illustrations';
import { EmptyState, TextField } from '../components/ui';
import { destinationsFor, searchDestinations } from '../features/navigation/destinations';
import { mockApi, me, TAXONOMY } from './mockApi';
import { renderAt } from './renderApp';

describe('illustration system', () => {
  test('one drawing per trade category of the taxonomy, each different', () => {
    const drawings = TRADE_ART_IDS.map((id) => render(<TradeArt category={id} />).container.querySelector('svg'));
    expect(new Set(drawings.map((svg) => svg.innerHTML)).size).toBe(TRADE_ART_IDS.length);
    for (const svg of drawings) {
      expect(svg).toHaveAttribute('viewBox', '0 0 96 96'); // one grid
      expect(svg).toHaveAttribute('aria-hidden', 'true'); // decorative: the trade name is written next to it
    }
  });

  test('every trade category the API sends has its own drawing (test taxonomy)', () => {
    for (const category of TAXONOMY.categories) expect(TRADE_ART_IDS).toContain(category.id);
  });

  test('an unknown category falls back to the toolbox instead of an empty box', () => {
    const { container } = render(<TradeArt category="future_trade" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-art', 'home_maintenance');
  });

  test('every scene draws something different; an unknown scene draws nothing', () => {
    const scenes = SCENE_IDS.map((id) => render(<SceneArt name={id} />).container.querySelector('svg'));
    expect(scenes.every(Boolean)).toBe(true);
    expect(new Set(scenes.map((svg) => svg.innerHTML)).size).toBe(SCENE_IDS.length);
    expect(render(<SceneArt name="nope" />).container.querySelector('svg')).toBeNull();
  });

  test('colours come only from theme tokens (so drawings work in light and dark mode)', () => {
    const html = [...TRADE_ART_IDS.map((id) => render(<TradeArt category={id} />).container.innerHTML), ...SCENE_IDS.map((id) => render(<SceneArt name={id} />).container.innerHTML)].join('');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    expect(html).not.toMatch(/rgb\(|oklch\(/);
  });

  test('a drawing with a title is exposed as an image with that name', () => {
    render(<SceneArt name="offline" title="You are offline" />);
    expect(screen.getByRole('img', { name: 'You are offline' })).toBeInTheDocument();
  });

  test('EmptyState shows a scene, a title, a description and an action', () => {
    const { container } = render(<EmptyState art="empty-search" title="No workers found" description="Try another trade." action={<button type="button">Clear filters</button>} />);
    expect(container.querySelector('svg[data-scene="empty-search"]')).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'No workers found' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });
});

describe('text field adornments', () => {
  test('a prefix such as "Rs" is decorative; the label still names the field', () => {
    render(<TextField label="Rate per day" prefix="Rs" suffix="/day" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Rate per day');
    expect(input).toBeInTheDocument();
    expect(screen.getByText('Rs')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('/day')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('landing page v3', () => {
  test('six "how it works" tiles, four trust cards, and one illustrated card per trade', async () => {
    mockApi({});
    const { container } = renderAt('/');
    expect(await screen.findByRole('heading', { level: 2, name: 'How it works' })).toBeInTheDocument();
    for (const title of ['Create your profile', 'Describe your skills', 'Add proof and get checked', 'Search by trade', 'Compare profiles', 'Choose with trust']) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    }
    for (const title of ['Identity checked by a person', 'Skills with proof', 'Every decision is recorded', 'Phone and CNIC stay private']) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    }
    const trades = await screen.findAllByRole('link', { name: /skills?\s*· Find a worker$/ });
    expect(trades).toHaveLength(TAXONOMY.categories.length);
    for (const link of trades) expect(link.querySelector('svg[data-art]')).not.toBeNull();
    // the explanation of the two skill badges uses the product's real status words
    expect(screen.getByText('An admin approved a photo as proof of this skill.')).toBeInTheDocument();
    expect(screen.getByText('The worker says so. No proof has been checked yet.')).toBeInTheDocument();
    // vignettes are decorative and never contain invented people, numbers or reviews
    for (const vignette of container.querySelectorAll('[aria-hidden="true"]')) expect(vignette.textContent).not.toMatch(/\d{2,}|★|rating|customer review|testimonial/i);
  });

  test('the example sentence marks the words the rule-based extractor would match', async () => {
    mockApi({});
    renderAt('/');
    const example = await screen.findByText('Example');
    const sentence = example.parentElement.querySelector('p');
    expect([...sentence.querySelectorAll('strong')].map((s) => s.textContent)).toEqual(['house wiring', 'solar panels']);
  });
});

describe('destinations and the page-not-found search (feature 49)', () => {
  const t = (key) => ({ 'nav.home': 'Home page', 'header.login': 'Log in', 'nav.myProfile': 'My profile', 'nav.dashboard': 'Dashboard' })[key] ?? key;

  test('destinations depend on the role; a visitor never gets an admin link', () => {
    const visitor = destinationsFor(undefined).map((d) => d.to);
    expect(visitor).toContain('/login');
    expect(visitor.some((to) => to.startsWith('/admin'))).toBe(false);
    expect(destinationsFor('customer').map((d) => d.to)).toContain('/find');
    expect(destinationsFor('worker').some((d) => d.to.startsWith('/admin'))).toBe(false);
    expect(destinationsFor('admin').map((d) => d.to)).toContain('/admin/users');
  });

  test('search matches every typed word, in any letter case', () => {
    const list = destinationsFor('worker');
    expect(searchDestinations(list, 'PROFILE my', t).map((d) => d.id)).toEqual(['profile']);
    expect(searchDestinations(list, '', t)).toHaveLength(list.length);
    expect(searchDestinations(list, 'zzz', t)).toEqual([]);
  });

  test('404: drawing, warm text, a search box that filters the links, and a way home', async () => {
    mockApi({});
    const user = userEvent.setup();
    const { container } = renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(container.querySelector('svg[data-scene="not-found"]')).not.toBeNull();
    const list = screen.getByRole('list', { name: 'Pages you can open' });
    expect(within(list).getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    await user.type(screen.getByRole('searchbox', { name: 'Where do you want to go?' }), 'home');
    expect(within(list).getAllByRole('link')).toHaveLength(1);
    await user.type(screen.getByRole('searchbox'), 'zzz');
    expect(within(list).getByText('No page with that name. Try another word.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
  });

  test('404 for a logged-in worker offers the worker pages and goes "home" to the dashboard', async () => {
    mockApi({ 'GET /auth/me': me('worker') });
    renderAt('/no-such-page');
    const list = await screen.findByRole('list', { name: 'Pages you can open' });
    expect(within(list).getByRole('link', { name: 'My profile' })).toHaveAttribute('href', '/worker/profile');
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/worker');
  });
});

// Customer directory v3 (Batch 4). The server sends only public fields; no phone, WhatsApp, email,
// address or CNIC is ever rendered here (D-002).
// - The address bar is the single source of truth for search, filters, sort and page (feature 20):
//   a search can be bookmarked, shared and survives a reload.
// - Results follow the typing after a short pause (feature 21); matched words are marked.
// - Sort (22), saved workers (23), compare (24), recently viewed (25).
import { useEffect, useId, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownUp, LayoutGrid, MapPin, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Alert, Button, Drawer, EmptyState, PageHeader, Pagination, RadioCardGroup, Select, Skeleton, Switch, TextField, useToast } from '../../components/ui';
import { TradeArt } from '../../components/illustrations';
import { AVAILABILITY, AVAILABILITY_ICONS } from '../../features/profile/availability';
import CompareTray from '../../features/customer/CompareTray';
import RecentlyViewed from '../../features/customer/RecentlyViewed';
import WorkerCard from '../../features/customer/WorkerCard';
import { MAX_COMPARE, useCompare } from '../../features/customer/compareStore';
import { useSavedWorkers } from '../../features/customer/useSavedWorkers';
import { useSpotlight } from '../../components/motion/pointerEffects';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/customer/Customer.module.css';
import DescribeJobCard from '../../features/jobs/DescribeJobCard';

const PAGE_SIZE = 12;
const SORTS = ['updated', 'experience', 'evidence', 'track_record']; // track_record: Module 4
const sortLabel = (s) => (s === 'track_record' ? 'reputation.sortTrack' : `customerx.sort.${s}`);
export const SEARCH_DELAY_MS = 350;

// Batch 5: trade and availability are picture choices (each card can be heard), with "All" first.
// The filters can be on the page twice (side column and phone drawer): each copy has its own radio names.
function Filters({ value, set, categories, city, onCity }) {
  const { t } = useT();
  const uid = useId().replace(/:/g, '');
  return (
    <div className={styles.filterFields}>
      <RadioCardGroup
        legend={t('find.trade')}
        name={`trade${uid}`}
        layout="tiles"
        value={value.category}
        onChange={(category) => set({ category })}
        options={[
          { value: 'All', title: t('find.allTrades'), icon: LayoutGrid },
          ...categories.map((c) => ({ value: c.id, title: c.label, art: <TradeArt category={c.id} size={44} /> })),
        ]}
        assist="find.trade"
        listen="trade"
      />
      <TextField label={t('find.city')} placeholder={t('about.cityPlaceholder')} maxLength={50} value={city} onChange={(e) => onCity(e.target.value)} icon={MapPin} assist="find.city" />
      <RadioCardGroup
        legend={t('find.availability')}
        name={`availability${uid}`}
        layout="tiles"
        value={value.availability}
        onChange={(availability) => set({ availability })}
        options={[
          { value: 'All', title: t('find.any'), icon: LayoutGrid },
          ...AVAILABILITY.map((a) => ({ value: a, title: t(`status.availability.${a}`), icon: AVAILABILITY_ICONS[a] })),
        ]}
        assist="find.availability"
        listen="availability"
      />
      <Switch label={t('find.verifiedOnly')} checked={value.identity} onChange={(on) => set({ identity: on ? 'verified' : '' })} />
      <Switch label={t('find.verifiedSkills')} hint={t('find.verifiedSkillsHint')} checked={value.skills} onChange={(on) => set({ skills: on ? 'verified' : '' })} />
      <Switch label={t('reputation.hasJobs')} hint={t('reputation.hasJobsHint')} checked={value.hasJobs} onChange={(on) => set({ hasJobs: on ? 'true' : '' })} />
    </div>
  );
}

export default function FindWorkers() {
  const { t, te } = useT();
  useDocumentTitle(t('titles.find'));
  const toast = useToast();
  const { categories, categoryLabel } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const spotlight = useSpotlight();
  const saved = useSavedWorkers();
  const compare = useCompare();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ---- what the address bar says ----
  const value = {
    q: params.get('q') ?? '',
    city: params.get('city') ?? '',
    // a known trade; before the trade list has loaded, any id-like value (the server checks it too)
    category: (categories.length ? categories.some((c) => c.id === params.get('category')) : /^[a-z_]{2,40}$/.test(params.get('category') ?? '')) ? params.get('category') : 'All',
    availability: AVAILABILITY.includes(params.get('availability')) ? params.get('availability') : 'All',
    identity: params.get('identity') === 'verified',
    skills: params.get('skills') === 'verified',
    hasJobs: params.get('hasJobs') === 'true',
    sort: SORTS.includes(params.get('sort')) ? params.get('sort') : 'updated',
    page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
  };

  // Change some settings in the address (replace, so "Back" leaves the page instead of undoing
  // one letter). Any change except the page goes back to page 1.
  const set = (changes) => {
    const next = new URLSearchParams(params);
    if (!('page' in changes)) next.delete('page');
    for (const [key, v] of Object.entries(changes)) {
      if (v && v !== 'All' && !(key === 'sort' && v === 'updated') && !(key === 'page' && v === 1)) next.set(key, String(v)); else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  // ---- the two text boxes: typed at once, sent to the address after a short pause ----
  const [search, setSearch] = useState(value.q);
  const [city, setCity] = useState(value.city);
  const laterSearch = useDebouncedValue(search, SEARCH_DELAY_MS);
  const laterCity = useDebouncedValue(city, SEARCH_DELAY_MS);
  useEffect(() => {
    const q = laterSearch.trim();
    const c = laterCity.trim();
    if (q !== value.q || c !== value.city) set({ q, city: c });
    // only when the typed text settles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laterSearch, laterCity]);

  const query = { page: String(value.page), limit: String(PAGE_SIZE), category: value.category, availability: value.availability, sort: value.sort };
  if (value.q) query.search = value.q;
  if (value.city) query.city = value.city;
  if (value.identity) query.identity = 'verified';
  if (value.skills) query.skills = 'verified';
  if (value.hasJobs) query.hasJobs = 'true';
  const { data, error, stale, reload } = useApiQuery('/workers', query, { keepPrevious: true });

  const reset = () => {
    setSearch('');
    setCity('');
    setParams(new URLSearchParams(), { replace: true });
  };

  // ---- the filters in use, as chips that can be removed one by one ----
  const chips = [];
  if (value.q) chips.push({ key: 'q', label: t('customerx.chips.search', { value: value.q }), clear: () => { setSearch(''); set({ q: '' }); } });
  if (value.category !== 'All') chips.push({ key: 'category', label: categoryLabel(value.category), clear: () => set({ category: '' }) });
  if (value.city) chips.push({ key: 'city', label: t('customerx.chips.city', { value: value.city }), clear: () => { setCity(''); set({ city: '' }); } });
  if (value.availability !== 'All') chips.push({ key: 'availability', label: t(`status.availability.${value.availability}`), clear: () => set({ availability: '' }) });
  if (value.identity) chips.push({ key: 'identity', label: t('customerx.chips.identity'), clear: () => set({ identity: '' }) });
  if (value.skills) chips.push({ key: 'skills', label: t('customerx.chips.skills'), clear: () => set({ skills: '' }) });
  if (value.hasJobs) chips.push({ key: 'hasJobs', label: t('reputation.hasJobs'), clear: () => set({ hasJobs: '' }) });

  const toggleCompare = (w) => {
    const name = w.user?.name ?? t('common.worker');
    if (compare.has(w.workerIdCode)) compare.remove(w.workerIdCode);
    else if (!compare.add({ id: w.workerIdCode, name })) toast.show({ tone: 'info', title: t('customerx.compare.full') });
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const filters = <Filters value={value} set={set} categories={categories} city={city} onCity={setCity} />;

  return (
    <div className={styles.page}>
      <PageHeader title={t('find.title')} description={t('find.lead')} />
      {/* Module 6 (Batch 8B): describe the job in your own words instead of searching */}
      <DescribeJobCard />
      <form role="search" className={styles.searchBar} onSubmit={(e) => { e.preventDefault(); set({ q: search.trim(), city: city.trim() }); }}>
        <div className={styles.searchField}>
          <TextField label={t('find.searchLabel')} type="search" icon={Search} placeholder={t('find.searchPlaceholder')} maxLength={50} value={search} onChange={(e) => setSearch(e.target.value)} hint={t('customerx.instant')} assist="find.search" />
        </div>
        <div className={styles.sortField}>
          <Select label={t('customerx.sort.label')} value={value.sort} onChange={(e) => set({ sort: e.target.value })} options={SORTS.map((s) => ({ value: s, label: t(sortLabel(s)) }))} assist="find.sort" icon={ArrowDownUp} />
        </div>
        <Button variant="secondary" icon={SlidersHorizontal} className={styles.filterButton} onClick={() => setDrawerOpen(true)}>{t('find.filters')}</Button>
      </form>
      {value.sort === 'evidence' && <p className={styles.sortHint}>{t('customerx.sort.hint')}</p>}
      {/* Module 4: new workers have no track record yet, so they appear lower in this order (cold start, Module 7) */}
      {value.sort === 'track_record' && <p className={styles.sortHint} data-testid="track-note">{t('reputation.sortTrackNote')}</p>}

      {chips.length === 0 && <RecentlyViewed />}

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-labelledby="filters-title">
          <h2 id="filters-title" className={styles.sidebarTitle}>{t('find.filters')}</h2>
          {filters}
          {chips.length > 0 && <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset}>{t('common.clearAll')}</Button>}
        </aside>

        <section aria-labelledby="results-title" className={styles.results}>
          <h2 id="results-title" className={styles.resultsTitle} aria-live="polite">
            {data ? t('find.found', { count: data.total }) : t('find.searching')}
          </h2>
          {chips.length > 0 && (
            <ul className={styles.chips} aria-label={t('customerx.chips.label')}>
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button type="button" className={styles.chip} onClick={chip.clear} aria-label={t('customerx.chips.remove', { name: chip.label })}>
                    <span dir="auto">{chip.label}</span><X size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
          {!data && !error && (
            <div className={styles.cards} aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} variant="block" height={232} />)}
            </div>
          )}
          {data && data.workers.length === 0 && (
            <EmptyState
              art="empty-search"
              headingLevel={3}
              title={t('find.noneTitle')}
              description={t('find.noneText')}
              action={chips.length > 0 ? <Button variant="secondary" onClick={reset}>{t('find.clearSearch')}</Button> : null}
            />
          )}
          {data && data.workers.length > 0 && (
            <ul className={[styles.cards, stale && styles.stale].filter(Boolean).join(' ')} aria-busy={stale} onPointerMove={spotlight} data-spotlight-group>
              {data.workers.map((w, i) => (
                <WorkerCard
                  key={w.workerIdCode}
                  worker={w}
                  index={i}
                  query={value.q}
                  saved={saved.isSaved(w.workerIdCode)}
                  onToggleSave={saved.enabled ? () => saved.toggle(w.workerIdCode) : undefined}
                  compare={compare.has(w.workerIdCode)}
                  compareDisabled={compare.list.length >= MAX_COMPARE}
                  onToggleCompare={() => toggleCompare(w)}
                />
              ))}
            </ul>
          )}
          {data && <Pagination page={data.page} pages={pages} onChange={(p) => set({ page: p })} label={t('find.resultPages')} />}
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t('find.filters')}
        footer={
          <>
            <Button variant="secondary" onClick={() => { reset(); setDrawerOpen(false); }}>{t('common.clearAll')}</Button>
            <Button onClick={() => setDrawerOpen(false)}>{t('find.showWorkers')}</Button>
          </>
        }
      >
        {filters}
      </Drawer>
      <CompareTray />
    </div>
  );
}

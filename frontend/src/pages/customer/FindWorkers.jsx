import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { Alert, Avatar, Badge, Button, Drawer, EmptyState, PageHeader, Pagination, Select, Skeleton, StatusChip, Switch, TextField } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useApiQuery } from '../../hooks/useApiQuery';
import styles from './Customer.module.css';

const PAGE_SIZE = 12;
const EMPTY_FILTERS = { category: 'All', city: '', availability: 'All', verifiedOnly: false };

function Filters({ value, onChange, categories }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value }, key);
  return (
    <div className={styles.filterFields}>
      <Select label="Trade" value={value.category} onChange={set('category')} options={[{ value: 'All', label: 'All trades' }, ...categories.map((c) => ({ value: c.id, label: c.label }))]} />
      <TextField label="City" placeholder="Rawalpindi" maxLength={50} value={value.city} onChange={set('city')} hint="Applied when you press Search or Show workers." />
      <Select label="Availability" value={value.availability} onChange={set('availability')} options={[{ value: 'All', label: 'Any' }, ...['Available', 'Busy', 'Offline'].map((a) => ({ value: a, label: a }))]} />
      <Switch label="Identity verified only" checked={value.verifiedOnly} onChange={(on) => onChange({ ...value, verifiedOnly: on }, 'verifiedOnly')} />
    </div>
  );
}

// Customer directory. The server sends only public fields; no phone, WhatsApp, email, address or
// CNIC is ever rendered here (D-002).
export default function FindWorkers() {
  const { categories, categoryLabel } = useTaxonomy();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState({ search: '', ...EMPTY_FILTERS });

  const params = { page: String(page), limit: String(PAGE_SIZE), category: query.category, availability: query.availability };
  if (query.search.trim()) params.search = query.search.trim();
  if (query.city.trim()) params.city = query.city.trim();
  if (query.verifiedOnly) params.identity = 'verified';
  const { data, error, reload } = useApiQuery('/workers', params);

  const apply = (nextFilters = filters) => {
    setPage(1);
    setQuery({ search, ...nextFilters });
  };
  const reset = () => {
    setSearch('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setQuery({ search: '', ...EMPTY_FILTERS });
  };
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const active = query.search || query.city || query.category !== 'All' || query.availability !== 'All' || query.verifiedOnly;

  return (
    <div>
      <PageHeader
        title="Find workers"
        description={'"Identity verified" means an admin checked the worker\'s CNIC. Skills marked "Self-declared" have no checked proof yet.'}
      />
      <form role="search" className={styles.searchBar} onSubmit={(e) => { e.preventDefault(); apply(); }}>
        <div className={styles.searchField}>
          <TextField label="Search workers" hideLabel placeholder="Search: electrician, plumbing, geyser…" maxLength={50} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button type="submit" icon={Search}>Search</Button>
        <Button variant="secondary" icon={SlidersHorizontal} className={styles.filterButton} onClick={() => setDrawerOpen(true)}>Filters</Button>
      </form>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-labelledby="filters-title">
          <h2 id="filters-title" className={styles.sidebarTitle}>Filters</h2>
          <Filters
            value={filters}
            categories={categories}
            onChange={(f, key) => {
              setFilters(f);
              if (key !== 'city') apply(f); // city waits for the Search button
            }}
          />
          {active && <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset}>Clear all</Button>}
        </aside>

        <section aria-labelledby="results-title" className={styles.results}>
          <h2 id="results-title" className={styles.resultsTitle} aria-live="polite">
            {data ? `${data.total} worker${data.total === 1 ? '' : 's'} found` : 'Searching…'}
          </h2>
          {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>Try again</Button>}>{error}</Alert>}
          {!data && !error && (
            <div className={styles.cards} aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} variant="block" height={176} />)}
            </div>
          )}
          {data && data.workers.length === 0 && (
            <EmptyState
              icon={SearchX}
              headingLevel={3}
              title="No workers match"
              description="Try another word, or remove some filters."
              action={active ? <Button variant="secondary" onClick={reset}>Clear search and filters</Button> : null}
            />
          )}
          {data && data.workers.length > 0 && (
            <ul className={styles.cards}>
              {data.workers.map((w) => (
                <li key={w.workerIdCode} className={styles.card} data-testid="worker-card">
                  <div className={styles.cardTop}>
                    <Avatar name={w.user?.name ?? ''} />
                    <div className={styles.cardName}>
                      <h3 className={styles.name}><Link to={`/workers/${w.workerIdCode}`} className={styles.cardLink}>{w.user?.name ?? 'Worker'}</Link></h3>
                      <p className={styles.trade}>{w.occupation}</p>
                      <p className={styles.meta}>{categoryLabel(w.category)} · {w.city}</p>
                    </div>
                  </div>
                  <StatusChip kind="identity" status={w.verificationStatus} />
                  <dl className={styles.facts}>
                    <div><dt>Experience</dt><dd className="tabular">{w.experienceYears ?? 0} yrs</dd></div>
                    <div><dt>Per hour</dt><dd className="tabular">{w.hourlyRate ? `Rs ${w.hourlyRate.toLocaleString('en')}` : '—'}</dd></div>
                    <div><dt>Per day</dt><dd className="tabular">{w.dailyRate ? `Rs ${w.dailyRate.toLocaleString('en')}` : '—'}</dd></div>
                  </dl>
                  {w.skills?.length > 0 && (
                    <ul className={styles.skills} aria-label="Top skills">
                      {w.skills.slice(0, 3).map((s) => <li key={s.skillId}><Badge tone="primary">{s.name}</Badge></li>)}
                      {w.skills.length > 3 && <li><Badge>+{w.skills.length - 3} more</Badge></li>}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          {data && <Pagination page={data.page} pages={pages} onChange={setPage} label="Result pages" />}
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        footer={
          <>
            <Button variant="secondary" onClick={() => { reset(); setDrawerOpen(false); }}>Clear all</Button>
            <Button onClick={() => { apply(); setDrawerOpen(false); }}>Show workers</Button>
          </>
        }
      >
        <Filters value={filters} onChange={setFilters} categories={categories} />
      </Drawer>
    </div>
  );
}

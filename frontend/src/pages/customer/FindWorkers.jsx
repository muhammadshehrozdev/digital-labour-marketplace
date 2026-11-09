import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, RotateCcw, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { Alert, Avatar, Badge, Button, Drawer, EmptyState, PageHeader, Pagination, Select, Skeleton, StatusChip, Switch, TextField } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Customer.module.css';

const PAGE_SIZE = 12;
const EMPTY_FILTERS = { category: 'All', city: '', availability: 'All', verifiedOnly: false, verifiedSkills: false };

function Filters({ value, onChange, categories }) {
  const { t } = useT();
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value }, key);
  return (
    <div className={styles.filterFields}>
      <Select label={t('find.trade')} value={value.category} onChange={set('category')} options={[{ value: 'All', label: t('find.allTrades') }, ...categories.map((c) => ({ value: c.id, label: c.label }))]} />
      <TextField label={t('find.city')} placeholder={t('about.cityPlaceholder')} maxLength={50} value={value.city} onChange={set('city')} hint={t('find.cityHint')} />
      <Select label={t('find.availability')} value={value.availability} onChange={set('availability')} options={[{ value: 'All', label: t('find.any') }, ...['Available', 'Busy', 'Offline'].map((a) => ({ value: a, label: t(`status.availability.${a}`) }))]} />
      <Switch label={t('find.verifiedOnly')} checked={value.verifiedOnly} onChange={(on) => onChange({ ...value, verifiedOnly: on }, 'verifiedOnly')} />
      <Switch label={t('find.verifiedSkills')} hint={t('find.verifiedSkillsHint')} checked={value.verifiedSkills} onChange={(on) => onChange({ ...value, verifiedSkills: on }, 'verifiedSkills')} />
    </div>
  );
}

// Customer directory. The server sends only public fields; no phone, WhatsApp, email, address or
// CNIC is ever rendered here (D-002).
export default function FindWorkers() {
  const { t, te, formatNumber } = useT();
  useDocumentTitle(t('titles.find'));
  const { categories, categoryLabel, categoryOccupation, skillName } = useTaxonomy();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState({ search: '', ...EMPTY_FILTERS });

  const params = { page: String(page), limit: String(PAGE_SIZE), category: query.category, availability: query.availability };
  if (query.search.trim()) params.search = query.search.trim();
  if (query.city.trim()) params.city = query.city.trim();
  if (query.verifiedOnly) params.identity = 'verified';
  if (query.verifiedSkills) params.skills = 'verified';
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
  const active = query.search || query.city || query.category !== 'All' || query.availability !== 'All' || query.verifiedOnly || query.verifiedSkills;

  return (
    <div>
      <PageHeader title={t('find.title')} description={t('find.lead')} />
      <form role="search" className={styles.searchBar} onSubmit={(e) => { e.preventDefault(); apply(); }}>
        <div className={styles.searchField}>
          <TextField label={t('find.searchLabel')} hideLabel placeholder={t('find.searchPlaceholder')} maxLength={50} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button type="submit" icon={Search}>{t('common.search')}</Button>
        <Button variant="secondary" icon={SlidersHorizontal} className={styles.filterButton} onClick={() => setDrawerOpen(true)}>{t('find.filters')}</Button>
      </form>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-labelledby="filters-title">
          <h2 id="filters-title" className={styles.sidebarTitle}>{t('find.filters')}</h2>
          <Filters
            value={filters}
            categories={categories}
            onChange={(f, key) => {
              setFilters(f);
              if (key !== 'city') apply(f); // city waits for the Search button
            }}
          />
          {active && <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset}>{t('common.clearAll')}</Button>}
        </aside>

        <section aria-labelledby="results-title" className={styles.results}>
          <h2 id="results-title" className={styles.resultsTitle} aria-live="polite">
            {data ? t('find.found', { count: data.total }) : t('find.searching')}
          </h2>
          {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
          {!data && !error && (
            <div className={styles.cards} aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} variant="block" height={176} />)}
            </div>
          )}
          {data && data.workers.length === 0 && (
            <EmptyState
              icon={SearchX}
              headingLevel={3}
              title={t('find.noneTitle')}
              description={t('find.noneText')}
              action={active ? <Button variant="secondary" onClick={reset}>{t('find.clearSearch')}</Button> : null}
            />
          )}
          {data && data.workers.length > 0 && (
            <ul className={styles.cards}>
              {data.workers.map((w, i) => (
                <li key={w.workerIdCode} className={styles.card} data-testid="worker-card" style={{ '--i': i }}>
                  <div className={styles.cardTop}>
                    <Avatar name={w.user?.name ?? ''} />
                    <div className={styles.cardName}>
                      <h3 className={styles.name}><Link to={`/workers/${w.workerIdCode}`} className={styles.cardLink} viewTransition>{w.user?.name ?? t('common.worker')}</Link></h3>
                      <p className={styles.trade}>{categoryOccupation(w.category) || w.occupation}</p>
                      <p className={styles.meta}>{categoryLabel(w.category)} · {w.city}</p>
                    </div>
                  </div>
                  <StatusChip kind="identity" status={w.verificationStatus} />
                  <dl className={styles.facts}>
                    <div><dt>{t('find.experience')}</dt><dd className="tabular">{t('common.yearsShort', { count: w.experienceYears ?? 0 })}</dd></div>
                    <div><dt>{t('find.perHour')}</dt><dd className="tabular" dir="ltr">{w.hourlyRate ? t('common.rupees', { amount: formatNumber(w.hourlyRate) }) : t('common.empty')}</dd></div>
                    <div><dt>{t('find.perDay')}</dt><dd className="tabular" dir="ltr">{w.dailyRate ? t('common.rupees', { amount: formatNumber(w.dailyRate) }) : t('common.empty')}</dd></div>
                  </dl>
                  {w.skills?.length > 0 && (
                    <ul className={styles.skills} aria-label={t('find.topSkills')}>
                      {[...w.skills]
                        .sort((x, y) => (y.evidenceSummary?.status === 'verified') - (x.evidenceSummary?.status === 'verified'))
                        .slice(0, 3)
                        .map((s) => (
                          <li key={s.skillId}>
                            {s.evidenceSummary?.status === 'verified' ? (
                              <Badge tone="success" icon={BadgeCheck}>{skillName(s)}<span className="visually-hidden"> {t('find.verifiedSkill')}</span></Badge>
                            ) : (
                              <Badge tone="primary">{skillName(s)}</Badge>
                            )}
                          </li>
                        ))}
                      {w.skills.length > 3 && <li><Badge>{t('find.more', { count: w.skills.length - 3 })}</Badge></li>}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          {data && <Pagination page={data.page} pages={pages} onChange={setPage} label={t('find.resultPages')} />}
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t('find.filters')}
        footer={
          <>
            <Button variant="secondary" onClick={() => { reset(); setDrawerOpen(false); }}>{t('common.clearAll')}</Button>
            <Button onClick={() => { apply(); setDrawerOpen(false); }}>{t('find.showWorkers')}</Button>
          </>
        }
      >
        <Filters value={filters} onChange={setFilters} categories={categories} />
      </Drawer>
    </div>
  );
}

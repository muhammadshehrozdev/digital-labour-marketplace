import { useState, useEffect, useCallback } from 'react';
import API from '../api';
import { useTaxonomy } from '../hooks/useTaxonomy';

const PAGE_SIZE = 12;

// Customer directory. The server sends only public fields: no CNIC, email, address,
// emergency contact, phone or WhatsApp (decision D-002: phone only after an accepted
// booking, and there is no booking module yet).
export default function CustomerDashboard() {
  const { categories, labelFor } = useTaxonomy();
  const [workers, setWorkers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorkers = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = { category, page: String(pageToLoad), limit: String(PAGE_SIZE) };
        if (search.trim()) params.search = search.trim();
        if (verifiedOnly) params.identity = 'verified';
        const { data } = await API.get('/workers', { params });
        setWorkers(data.workers);
        setTotal(data.total);
        setPage(data.page);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load workers');
      } finally {
        setLoading(false);
      }
    },
    [category, search, verifiedOnly]
  );

  useEffect(() => {
    fetchWorkers(1);
    // Reload when a filter changes; the search box reloads on the Search button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, verifiedOnly]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="profile-dashboard">
      <div className="page-top-row">
        <div>
          <h1 className="profile-header-title">Find workers</h1>
          <p className="profile-header-subtitle">
            Browse worker profiles and rates. &quot;Identity verified&quot; means an admin checked the worker&apos;s CNIC.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchWorkers(1);
        }}
        style={{
          background: 'white',
          padding: '14px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 220px auto auto',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          aria-label="Search"
          placeholder="Search electrician, plumber, solar..."
          className="input-control"
          maxLength={50}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Category" className="input-control" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <label style={{ fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
          Identity verified only
        </label>
        <button
          type="submit"
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      {error && <div className="alert-message error">{error}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading workers...</p>
      ) : workers.length === 0 ? (
        <div style={{ background: 'white', padding: '36px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <h3>No Workers Found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(310px, 100%), 1fr))', gap: '18px' }}>
          {workers.map((w) => {
            const verified = w.verificationStatus === 'Verified';
            return (
              <div
                key={w._id}
                data-testid="worker-card"
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>{w.workerIdCode}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '99px',
                      background: verified ? '#dcfce7' : '#f1f5f9',
                      color: verified ? '#15803d' : '#64748b',
                    }}
                  >
                    {verified ? '✓ Identity verified' : 'Identity not verified'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div className="id-avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}>
                    {w.user?.name ? w.user.name[0].toUpperCase() : 'W'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{w.user?.name || 'Worker'}</h3>
                    <p style={{ fontSize: '0.84rem', color: '#4f46e5', fontWeight: '600' }}>{w.occupation}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {labelFor(w.category)} • {w.city}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    fontSize: '0.8rem',
                  }}
                >
                  <span><strong>Exp:</strong> {w.experienceYears} Yrs</span>
                  <span><strong>Hr:</strong> Rs.{w.hourlyRate}</span>
                  <span><strong>Day:</strong> Rs.{w.dailyRate || 0}</span>
                </div>

                {w.skills && w.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {w.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        style={{
                          background: '#eef2ff',
                          color: '#4f46e5',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span>Contact details are shared after a booking is accepted.</span>
                  <span>{w.availability}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
          <button type="button" disabled={page <= 1} onClick={() => fetchWorkers(page - 1)}>Previous</button>
          <span style={{ fontSize: '0.85rem' }}>Page {page} of {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => fetchWorkers(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

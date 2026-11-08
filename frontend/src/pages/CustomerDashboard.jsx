import { useState, useEffect } from 'react';
import API from '../api';

export default function CustomerDashboard() {
  const [workers, setWorkers] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/worker/all', {
        params: { category, search },
      });
      setWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [category]);

  return (
    <div className="profile-dashboard">
      <div className="page-top-row">
        <div>
          <h1 className="profile-header-title">Find Skilled Workers</h1>
          <p className="profile-header-subtitle">Browse verified worker profiles and rates</p>
        </div>
      </div>

      <div
        style={{
          background: 'white',
          padding: '14px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 220px auto',
          gap: '10px',
        }}
      >
        <input
          type="text"
          placeholder="Search electrician, plumber, solar..."
          className="input-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-control" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Electrical & Solar">Electrical & Solar</option>
          <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
          <option value="Construction & Masonry">Construction & Masonry</option>
          <option value="Carpentry & Woodwork">Carpentry & Woodwork</option>
          <option value="AC & Appliance Repair">AC & Appliance Repair</option>
          <option value="Painting & Renovation">Painting & Renovation</option>
          <option value="Home Maintenance">Home Maintenance</option>
          <option value="Cleaning & Shifting">Cleaning & Shifting</option>
        </select>
        <button
          onClick={fetchWorkers}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '0 20px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading workers...</p>
      ) : workers.length === 0 ? (
        <div style={{ background: 'white', padding: '36px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <h3>No Workers Found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
          {workers.map((w) => (
            <div
              key={w._id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>
                  {w.workerIdCode || 'DLM-WORKER'}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '99px',
                    background: w.verificationStatus === 'Verified' ? '#dcfce7' : '#f1f5f9',
                    color: w.verificationStatus === 'Verified' ? '#15803d' : '#64748b',
                  }}
                >
                  {w.verificationStatus === 'Verified' ? '✓ Verified' : 'Pending'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div className="id-avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}>
                  {w.user?.name ? w.user.name[0].toUpperCase() : 'W'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{w.user?.name || 'Worker'}</h3>
                  <p style={{ fontSize: '0.84rem', color: '#4f46e5', fontWeight: '600' }}>{w.occupation}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.city}</p>
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
                  {w.skills.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
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
                <span><strong>Phone:</strong> {w.user?.phone || 'N/A'}</span>
                <span>{w.availability}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
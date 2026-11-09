import { useState, useEffect } from 'react';
import API from '../api';
import { useTaxonomy } from '../hooks/useTaxonomy';

const STATUS_STYLE = {
  Verified: { background: '#dcfce7', color: '#15803d' },
  Rejected: { background: '#fee2e2', color: '#b91c1c' },
  Pending: { background: '#fef3c7', color: '#b45309' },
  Unverified: { background: '#f1f5f9', color: '#475569' },
};

// Identity decision for one worker (audit M1-9): status + a required note.
// The server writes every decision to the audit log.
export function IdentityDecisionForm({ worker, onDone }) {
  const [status, setStatus] = useState('Verified');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (note.trim().length < 5) {
      setError('Please write a note (at least 5 characters): how did you check the CNIC?');
      return;
    }
    setSaving(true);
    try {
      await API.patch(`/admin/workers/${worker._id}/identity`, { status, note: note.trim() });
      setNote('');
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the decision');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '6px', minWidth: '260px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <select aria-label="Identity decision" className="input-control" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Verified" disabled={!worker.cnicOnFile}>Verified</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="submit" disabled={saving} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <input
        aria-label="Decision note"
        className="input-control"
        placeholder="Note, e.g. Checked original CNIC on video call"
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <span role="alert" style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</span>}
    </form>
  );
}

// Full CNIC only on request; the server records every reveal in the audit log.
function CnicCell({ worker }) {
  const [cnic, setCnic] = useState('');
  const [error, setError] = useState('');
  if (!worker.cnicOnFile) return <span style={{ color: '#94a3b8' }}>Not saved</span>;
  if (cnic) {
    return (
      <span>
        <code>{cnic}</code>{' '}
        <button type="button" onClick={() => setCnic('')} style={{ fontSize: '0.7rem' }}>Hide</button>
      </span>
    );
  }
  const reveal = async () => {
    if (!window.confirm('Show the full CNIC? This is recorded in the audit log with your name.')) return;
    setError('');
    try {
      const { data } = await API.get(`/admin/workers/${worker._id}/cnic`);
      setCnic(data.cnic);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the CNIC');
    }
  };
  return (
    <span>
      <span style={{ letterSpacing: '1px' }}>•••••-•••••••-•</span>{' '}
      <button type="button" onClick={reveal} style={{ fontSize: '0.7rem' }}>Reveal</button>
      {error && <div style={{ color: '#dc2626', fontSize: '0.72rem' }}>{error}</div>}
    </span>
  );
}

export default function AdminDashboard() {
  const { labelFor } = useTaxonomy();
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async (status = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const [workersRes, usersRes] = await Promise.all([
        API.get('/admin/workers', { params: { status, limit: '100' } }),
        API.get('/admin/users'),
      ]);
      setWorkers(workersRes.data.workers);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div className="profile-dashboard">
      <div className="page-top-row">
        <div>
          <h1 className="profile-header-title">Admin Panel</h1>
          <p className="profile-header-subtitle">
            Identity verification: check the worker&apos;s original CNIC in person or by video call, then record your decision with a note.
          </p>
        </div>
      </div>

      {error && <div className="alert-message error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '22px' }}>
        <div style={{ background: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>TOTAL USERS</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginTop: '4px' }}>{users.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>WORKER PROFILES (THIS LIST)</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginTop: '4px', color: '#4f46e5' }}>{workers.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>IDENTITY VERIFIED (THIS LIST)</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginTop: '4px', color: '#16a34a' }}>
            {workers.filter((w) => w.verificationStatus === 'Verified').length}
          </h2>
        </div>
      </div>

      <div className="form-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Worker identity verification</h3>
          <select aria-label="Filter by identity status" className="input-control" style={{ maxWidth: '200px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['All', 'Pending', 'Unverified', 'Verified', 'Rejected'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px 8px' }}>ID</th>
                  <th style={{ padding: '10px 8px' }}>Name</th>
                  <th style={{ padding: '10px 8px' }}>Trade</th>
                  <th style={{ padding: '10px 8px' }}>CNIC</th>
                  <th style={{ padding: '10px 8px' }}>Identity</th>
                  <th style={{ padding: '10px 8px' }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w._id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '600', color: '#4f46e5' }}>{w.workerIdCode}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <strong>{w.user?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.user?.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.user?.email}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {w.occupation}
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{labelFor(w.category)}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}><CnicCell worker={w} /></td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700', ...STATUS_STYLE[w.verificationStatus] }}>
                        {w.verificationStatus}
                      </span>
                      {w.identityNote && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', maxWidth: '220px' }}>Note: {w.identityNote}</div>}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <IdentityDecisionForm worker={w} onDone={() => loadAdminData()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

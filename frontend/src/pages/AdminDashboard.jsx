import { useState, useEffect } from 'react';
import API from '../api';

export default function AdminDashboard() {
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [workersRes, usersRes] = await Promise.all([
        API.get('/worker/all'),
        API.get('/worker/admin/users'),
      ]);
      setWorkers(workersRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyToggle = async (workerId, currentStatus) => {
    const nextStatus = currentStatus === 'Verified' ? 'Pending' : 'Verified';
    try {
      await API.put(`/worker/verify/${workerId}`, { status: nextStatus });
      loadAdminData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="profile-dashboard">
      <div className="page-top-row">
        <div>
          <h1 className="profile-header-title">Admin Panel</h1>
          <p className="profile-header-subtitle">Verify worker accounts and manage users</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '22px' }}>
        <div style={{ background: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>TOTAL USERS</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginTop: '4px' }}>{users.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>WORKER PROFILES</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginTop: '4px', color: '#4f46e5' }}>{workers.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>VERIFIED</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', marginTop: '4px', color: '#16a34a' }}>
            {workers.filter((w) => w.verificationStatus === 'Verified').length}
          </h2>
        </div>
      </div>

      <div className="form-panel">
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '14px' }}>Worker Verification List</h3>

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
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '600', color: '#4f46e5' }}>{w.workerIdCode}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <strong>{w.user?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.user?.phone}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{w.occupation}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '99px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background: w.verificationStatus === 'Verified' ? '#dcfce7' : '#fef3c7',
                          color: w.verificationStatus === 'Verified' ? '#15803d' : '#b45309',
                        }}
                      >
                        {w.verificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleVerifyToggle(w._id, w.verificationStatus)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.76rem',
                          background: w.verificationStatus === 'Verified' ? '#fee2e2' : '#eef2ff',
                          color: w.verificationStatus === 'Verified' ? '#dc2626' : '#4f46e5',
                        }}
                      >
                        {w.verificationStatus === 'Verified' ? 'Unverify' : 'Verify'}
                      </button>
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

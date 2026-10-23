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
      alert('Failed to update verification status');
    }
  };

  return (
    <div className="profile-dashboard">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="profile-header-title">Administrator Governance Panel (Module 1)</h1>
        <p className="profile-header-subtitle">
          Verify worker digital identities, inspect profile completion, and monitor role-based platform accounts.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>TOTAL REGISTERED USERS</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px' }}>{users.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>DIGITAL WORKER PROFILES</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: '#2563eb' }}>{workers.length}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>VERIFIED WORKERS</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: '#16a34a' }}>
            {workers.filter((w) => w.verificationStatus === 'Verified').length}
          </h2>
        </div>
      </div>

      {/* Worker Identity Verification Table */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>
          Worker Digital Identity Verification Queue
        </h3>

        {loading ? (
          <p>Loading records...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 8px' }}>Worker ID</th>
                  <th style={{ padding: '12px 8px' }}>Name & Phone</th>
                  <th style={{ padding: '12px 8px' }}>Trade & Category</th>
                  <th style={{ padding: '12px 8px' }}>CNIC</th>
                  <th style={{ padding: '12px 8px' }}>Completion</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '700' }}>{w.workerIdCode}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div><strong>{w.user?.name}</strong></div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{w.user?.phone}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div>{w.occupation}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{w.category}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{w.cnicNumber || 'Not Provided'}</td>
                    <td style={{ padding: '12px 8px', fontWeight: '700' }}>{w.profileCompletion || 25}%</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: w.verificationStatus === 'Verified' ? '#dcfce7' : '#fef3c7',
                          color: w.verificationStatus === 'Verified' ? '#15803d' : '#b45309',
                        }}
                      >
                        {w.verificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => handleVerifyToggle(w._id, w.verificationStatus)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          background: w.verificationStatus === 'Verified' ? '#fee2e2' : '#2563eb',
                          color: w.verificationStatus === 'Verified' ? '#dc2626' : 'white',
                        }}
                      >
                        {w.verificationStatus === 'Verified' ? 'Revoke Verify' : 'Approve & Verify'}
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
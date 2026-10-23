import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'worker',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      if (data.role === 'worker') {
        navigate('/worker-profile');
      } else if (data.role === 'customer') {
        navigate('/customer-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Module 1: Digital Labour Marketplace Identity</p>
        </div>

        {error && <div className="alert-message error">{error}</div>}

        <div className="role-toggle">
          <button
            type="button"
            className={`role-toggle-btn ${formData.role === 'worker' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'worker' })}
          >
            Worker
          </button>
          <button
            type="button"
            className={`role-toggle-btn ${formData.role === 'customer' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'customer' })}
          >
            Customer
          </button>
          <button
            type="button"
            className={`role-toggle-btn ${formData.role === 'admin' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'admin' })}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Muhammad Ali"
              className="input-control"
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="input-control"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              className="input-control"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <input
              type="text"
              placeholder="0300 1234567"
              className="input-control"
              required
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-action-primary" disabled={loading}>
            {loading ? 'Creating Account...' : `Register as ${formData.role.toUpperCase()}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
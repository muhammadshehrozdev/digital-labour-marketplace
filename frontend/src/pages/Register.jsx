import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { homePathFor } from '../utils/roles';
import { passwordProblem } from '../utils/password';


export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
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
    const problem = passwordProblem(formData.password);
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    try {
      const user = await register(formData);
      navigate(homePathFor(user.role));
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
          <p>Select your role to get started</p>
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
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              placeholder="Muhammad Ali"
              className="input-control"
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="input-control"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

          <div className="input-group">
            <label className="input-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="At least 15 characters"
              className="input-control"
              aria-describedby="password-help"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <p id="password-help" style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
              At least 15 characters. Easy to remember: use 4 or more words with spaces, in Roman Urdu or English.
              No symbols needed.
            </p>
          </div>

          <button type="submit" className="btn-action-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

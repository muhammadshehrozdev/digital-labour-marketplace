import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import WorkerProfilePage from './pages/WorkerProfilePage';
import SkillProfilerPage from './pages/SkillProfilerPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="brand-dot">DL</span>
        <span>Digital Labour</span>
      </Link>

      {!token ? (
        <div className="nav-links-wrap">
          <Link to="/login" className={`nav-link-item ${location.pathname === '/login' ? 'active' : ''}`}>
            Sign In
          </Link>
          <Link
            to="/register"
            style={{
              textDecoration: 'none',
              background: '#4f46e5',
              color: 'white',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.86rem',
            }}
          >
            Create Account
          </Link>
        </div>
      ) : (
        <div className="nav-links-wrap">
          {user.role === 'worker' && (
            <>
              <Link
                to="/worker-profile"
                className={`nav-link-item ${location.pathname === '/worker-profile' ? 'active' : ''}`}
              >
                My Profile
              </Link>
              <Link
                to="/skill-profiler"
                className={`nav-link-item ${location.pathname === '/skill-profiler' ? 'active' : ''}`}
              >
                AI Skill Profiler
              </Link>
            </>
          )}
          {user.role === 'customer' && (
            <Link
              to="/customer-dashboard"
              className={`nav-link-item ${location.pathname === '/customer-dashboard' ? 'active' : ''}`}
            >
              Find Workers
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/admin-dashboard"
              className={`nav-link-item ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}
            >
              Admin Panel
            </Link>
          )}

          <span
            style={{
              fontSize: '0.8rem',
              background: '#f1f5f9',
              padding: '5px 12px',
              borderRadius: '99px',
              color: '#334155',
              fontWeight: '600',
            }}
          >
            {user.name} ({user.role})
          </span>

          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/worker-profile"
          element={
            <ProtectedRoute allowedRole="worker">
              <WorkerProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skill-profiler"
          element={
            <ProtectedRoute allowedRole="worker">
              <SkillProfilerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
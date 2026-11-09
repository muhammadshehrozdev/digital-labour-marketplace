import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

// Convenience only: the backend checks login and role on every request.
export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>Access Denied</h3>
        <p>Aapke paas is page ko dekhne ki ijazat nahi hai.</p>
      </div>
    );
  }

  return children;
}

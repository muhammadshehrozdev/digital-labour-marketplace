import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <h2>Page not found</h2>
      <p style={{ color: '#64748b', margin: '10px 0 18px' }}>Yeh page mojood nahi hai.</p>
      <Link to="/" style={{ color: '#4f46e5', fontWeight: 700 }}>Go to the home page</Link>
    </div>
  );
}

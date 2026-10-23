import { useState, useEffect } from 'react';
import API from '../api';

export default function WorkerProfilePage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState({
    occupation: '',
    category: 'Home Maintenance',
    experienceYears: '',
    hourlyRate: '',
    city: 'Islamabad',
    address: '',
    bio: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/worker/profile');
        if (data) setProfile(data);
      } catch (err) {
        console.log('No profile found yet');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await API.post('/worker/profile', profile);
      setMessage(data.message || 'Profile successfully updated!');
    } catch (err) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-dashboard">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a' }}>Worker Digital Identity</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Manage your verified trade qualifications and hourly wage details.
        </p>
      </div>

      {message && <div className="alert-message success">{message}</div>}

      <div className="profile-grid">
        {/* Left: Smart ID Preview */}
        <div className="digital-id-card">
          <div className="card-top-bar">
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px' }}>
              LABOUR IDENTITY CARD
            </span>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700' }}>
              ● ACTIVE
            </span>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <div className="chip-box"></div>
          </div>

          <div className="id-user-info">
            <div className="id-avatar">
              {user.name ? user.name[0].toUpperCase() : 'W'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{user.name || 'Worker'}</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{profile.occupation || 'Trade Not Added'}</p>
            </div>
          </div>

          <div className="stat-pills-row">
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>EXPERIENCE</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{profile.experienceYears || '0'} Years</span>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>HOURLY RATE</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>
                Rs. {profile.hourlyRate || '0'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <div><strong>Category:</strong> {profile.category}</div>
            <div><strong>Location:</strong> {profile.city || 'Islamabad'}</div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="form-panel">
          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">Occupation / Trade</label>
                <input
                  type="text"
                  name="occupation"
                  placeholder="e.g. Electrician"
                  className="input-control"
                  value={profile.occupation}
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <select name="category" className="input-control" value={profile.category} onChange={handleChange}>
                  <option value="Home Maintenance">Home Maintenance</option>
                  <option value="Construction & Masonry">Construction & Masonry</option>
                  <option value="Carpentry & Woodwork">Carpentry & Woodwork</option>
                  <option value="Painting & Renovation">Painting & Renovation</option>
                  <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">Years of Experience</label>
                <input
                  type="number"
                  name="experienceYears"
                  placeholder="e.g. 4"
                  className="input-control"
                  value={profile.experienceYears}
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Hourly Rate (PKR)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  placeholder="e.g. 1200"
                  className="input-control"
                  value={profile.hourlyRate}
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="input-control"
                  value={profile.city}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Area / Sector</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. Sector I-8"
                  className="input-control"
                  value={profile.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Short Bio</label>
              <textarea
                name="bio"
                rows="3"
                className="input-control"
                placeholder="Describe your trade background..."
                value={profile.bio}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-action-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save & Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/auth';
import { buildProfilePayload } from '../utils/profilePayload';
import { useTaxonomy } from '../hooks/useTaxonomy';

const IDENTITY_TEXT = {
  Unverified: 'Not verified yet. Save your CNIC so an admin can check it.',
  Pending: 'Waiting for an admin to check your CNIC (in person or by video call).',
  Verified: 'Identity verified by an admin.',
  Rejected: 'Identity check was not successful. Please contact the admin.',
};

export default function WorkerProfilePage() {
  const { user: storedUser, updateUser } = useAuth();
  const { categories, labelFor, error: taxonomyError } = useTaxonomy();

  const [profile, setProfile] = useState({
    name: storedUser?.name || '',
    phone: storedUser?.phone || '',
    workerIdCode: '',
    occupation: '',
    category: 'home_maintenance',
    skillsInput: '',
    skills: [],
    experienceYears: 0,
    hourlyRate: 0,
    dailyRate: 0,
    city: 'Islamabad',
    address: '',
    whatsappNumber: '',
    emergencyContact: '',
    cnicNumber: '',
    cnicOnFile: false,
    languagesInput: 'Urdu',
    availability: 'Available',
    verificationStatus: 'Unverified',
    bio: '',
    workHistory: [],
    profileCompletion: 25,
  });

  const [newJob, setNewJob] = useState({
    jobTitle: '',
    clientOrEmployer: '',
    duration: '',
    description: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/workers/me');
        if (data) {
          setProfile({
            ...data,
            cnicNumber: '',
            name: data.user?.name || storedUser?.name || '',
            phone: data.user?.phone || storedUser?.phone || '',
            skillsInput: (data.skills || []).join(', '),
            languagesInput: (data.languages || ['Urdu']).join(', '),
            workHistory: data.workHistory || [],
          });
        }
      } catch (err) {
        if (err.response?.status !== 404) setError(err.response?.data?.message || 'Could not load your profile');
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAddWorkHistory = () => {
    if (!newJob.jobTitle.trim()) return;
    setProfile({
      ...profile,
      workHistory: [...profile.workHistory, { ...newJob }],
    });
    setNewJob({ jobTitle: '', clientOrEmployer: '', duration: '', description: '' });
  };

  const handleRemoveWorkHistory = (index) => {
    const updated = profile.workHistory.filter((_, idx) => idx !== index);
    setProfile({ ...profile, workHistory: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await API.put('/workers/me', buildProfilePayload(profile));
      const saved = data.profile;

      updateUser({ name: saved.user?.name || profile.name, phone: saved.user?.phone || profile.phone });

      setProfile({
        ...saved,
        cnicNumber: '',
        name: saved.user?.name || profile.name,
        phone: saved.user?.phone || profile.phone,
        skillsInput: (saved.skills || []).join(', '),
        languagesInput: (saved.languages || []).join(', '),
        workHistory: saved.workHistory || [],
      });

      setMessage('Profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const skillTags = profile.skillsInput
    ? profile.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="profile-dashboard">
      <div className="page-top-row">
        <div>
          <h1 className="profile-header-title">Worker Digital Profile</h1>
          <p className="profile-header-subtitle">Personal info, trade category, rates & past jobs</p>
        </div>
      </div>

      {message && <div className="alert-message success">{message}</div>}
      {error && <div className="alert-message error">{error}</div>}
      {taxonomyError && <div className="alert-message error">{taxonomyError}</div>}

      <div className="profile-grid">
        {/* Left: Soft Light Digital ID Card */}
        <div className="digital-id-card">
          <div className="card-top-bar">
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#4f46e5' }}>
              {profile.workerIdCode || 'New profile'}
            </span>
            <span
              style={{
                background: profile.availability === 'Available' ? '#dcfce7' : '#fef3c7',
                color: profile.availability === 'Available' ? '#15803d' : '#b45309',
                padding: '3px 10px',
                borderRadius: '99px',
                fontSize: '0.72rem',
                fontWeight: '700',
              }}
            >
              {profile.availability}
            </span>
          </div>

          <div className="id-user-info">
            <div className="id-avatar">{profile.name ? profile.name[0].toUpperCase() : 'W'}</div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>
                {profile.name || 'Worker'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '600' }}>
                {profile.occupation || 'Trade Not Added'}
              </p>
              <p style={{ fontSize: '0.76rem', color: '#64748b' }}>{labelFor(profile.category)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px', color: '#475569' }}>
              <span>Profile Completion</span>
              <strong>{profile.profileCompletion || 25}%</strong>
            </div>
            <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${profile.profileCompletion || 25}%`,
                  height: '100%',
                  background: '#4f46e5',
                }}
              />
            </div>
          </div>

          <div className="stat-pills-row">
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>EXPERIENCE</span>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                {profile.experienceYears || 0} Years
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>RATES</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#4f46e5' }}>
                Rs.{profile.hourlyRate || 0}/hr • Rs.{profile.dailyRate || 0}/d
              </span>
            </div>
          </div>

          {skillTags.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skillTags.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#eef2ff',
                      color: '#4f46e5',
                      padding: '4px 9px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.7', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <div><strong>Phone:</strong> {profile.phone || 'N/A'}</div>
            <div><strong>Location:</strong> {profile.address ? `${profile.address}, ` : ''}{profile.city}</div>
            <div><strong>Identity:</strong> {profile.verificationStatus}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{IDENTITY_TEXT[profile.verificationStatus]}</div>
          </div>
        </div>

        {/* Right: Clean Form */}
        <div className="form-panel">
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '14px', color: '#1e293b' }}>
              Personal & Contact Info
            </h3>
            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" name="name" className="input-control" value={profile.name} required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="text" name="phone" className="input-control" value={profile.phone} required onChange={handleChange} />
              </div>
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">WhatsApp</label>
                <input type="text" name="whatsappNumber" placeholder="0300 1234567" className="input-control" value={profile.whatsappNumber} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="cnicNumber">CNIC Number</label>
                <input
                  id="cnicNumber"
                  type="text"
                  name="cnicNumber"
                  placeholder={profile.cnicOnFile ? 'Saved (hidden). Type only to change it' : '12345-1234567-1'}
                  className="input-control"
                  value={profile.cnicNumber}
                  autoComplete="off"
                  onChange={handleChange}
                />
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  {profile.cnicOnFile
                    ? 'Your CNIC is saved in encrypted form and is never shown. Only an admin can see it.'
                    : 'Stored encrypted. Only an admin can see it, to check your identity.'}
                </p>
              </div>
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label" htmlFor="emergencyContact">Emergency Contact</label>
                <input
                  id="emergencyContact"
                  type="text"
                  name="emergencyContact"
                  placeholder="Name and phone, e.g. Brother Ahmed 0300 1234567"
                  className="input-control"
                  value={profile.emergencyContact}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="languagesInput">Languages (comma separated)</label>
                <input
                  id="languagesInput"
                  type="text"
                  name="languagesInput"
                  placeholder="Urdu, Punjabi, Pashto"
                  className="input-control"
                  value={profile.languagesInput}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">City</label>
                <input type="text" name="city" className="input-control" value={profile.city} required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Area / Sector</label>
                <input type="text" name="address" placeholder="Sector G-10" className="input-control" value={profile.address} onChange={handleChange} />
              </div>
            </div>

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '14px', color: '#1e293b' }}>
              Trade, Skills & Rates
            </h3>
            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">Occupation</label>
                <input type="text" name="occupation" placeholder="e.g. Electrician, Plumber" className="input-control" value={profile.occupation} required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="category">Category</label>
                <select id="category" name="category" className="input-control" value={profile.category} onChange={handleChange}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Skills (Comma separated)</label>
              <input type="text" name="skillsInput" placeholder="House Wiring, Solar Panel, UPS Setup" className="input-control" value={profile.skillsInput} onChange={handleChange} />
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">Experience (Years)</label>
                <input type="number" min="0" max="60" step="1" name="experienceYears" className="input-control" value={profile.experienceYears} required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Availability</label>
                <select name="availability" className="input-control" value={profile.availability} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="input-group">
                <label className="input-label">Hourly Rate (PKR)</label>
                <input type="number" min="0" name="hourlyRate" className="input-control" value={profile.hourlyRate} required onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Daily Rate (PKR)</label>
                <input type="number" min="0" name="dailyRate" className="input-control" value={profile.dailyRate} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Short Bio</label>
              <textarea name="bio" rows="2" className="input-control" placeholder="Short description of your work..." value={profile.bio} onChange={handleChange} />
            </div>

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
              Past Work Records
            </h3>

            {profile.workHistory.length > 0 && (
              <div style={{ marginBottom: '14px', display: 'grid', gap: '8px' }}>
                {profile.workHistory.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.86rem' }}>
                      <strong>{item.jobTitle}</strong> {item.clientOrEmployer && `• ${item.clientOrEmployer}`} {item.duration && `(${item.duration})`}
                      {item.description && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.description}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkHistory(index)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <div className="form-row-2">
                <div className="input-group">
                  <input type="text" aria-label="Job title" placeholder="Job Title (e.g. House Wiring)" className="input-control" value={newJob.jobTitle} onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })} />
                </div>
                <div className="input-group">
                  <input type="text" placeholder="Location / Client" className="input-control" value={newJob.clientOrEmployer} onChange={(e) => setNewJob({ ...newJob, clientOrEmployer: e.target.value })} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="input-group">
                  <input type="text" aria-label="Job duration" placeholder="Duration (e.g. 2 weeks, 3 months)" className="input-control" value={newJob.duration} onChange={(e) => setNewJob({ ...newJob, duration: e.target.value })} />
                </div>
                <div className="input-group">
                  <input type="text" aria-label="Job description" placeholder="What did you do?" className="input-control" value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddWorkHistory}
                style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                + Add Record
              </button>
            </div>

            <button type="submit" className="btn-action-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

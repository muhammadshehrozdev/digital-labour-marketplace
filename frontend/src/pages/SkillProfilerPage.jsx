import { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useTaxonomy } from '../hooks/useTaxonomy';

export default function SkillProfilerPage() {
  const { labelFor } = useTaxonomy();
  const [profile, setProfile] = useState(null);
  const [voiceText, setVoiceText] = useState('');
  const [voiceLang, setVoiceLang] = useState('ur-PK');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/workers/me');
        if (data) {
          setProfile(data);
          setVoiceText(data.rawExperienceText || '');
        }
      } catch (err) {
        console.log('No profile yet');
      }
    };
    fetchProfile();
  }, []);

  const runAiAnalysis = async (textToAnalyze, fromVoice = false) => {
    const cleanText = (textToAnalyze ?? voiceText).trim();
    if (!cleanText) {
      setError('Please speak or write about your work first.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await API.post('/worker/ai-skill-profiler', {
        rawExperienceText: cleanText,
        isVoiceInput: fromVoice,
      });
      setProfile(data.profile);

      if (data.isCleared) {
        setError(data.message);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing input');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAiProfile = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await API.delete('/worker/ai-skill-profiler/reset');
      setProfile(data.profile);
      setVoiceText('');
      setMessage(data.message);
    } catch (err) {
      setError('Failed to reset');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Please use Google Chrome or Edge for voice input.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setError('');
    setMessage('Listening... Speak about your work now.');

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      const combined = (finalTranscript || interim).trim();
      if (combined) setVoiceText(combined);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError('Could not hear audio. Try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        runAiAnalysis(finalTranscript.trim(), true);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAcceptSkill = async (skillObj) => {
    setMessage('');
    setError('');
    try {
      const { data } = await API.post('/worker/add-recommended-skill', {
        skillName: skillObj.skillName,
        category: skillObj.category,
      });
      setProfile(data.profile);
      setMessage(data.message);
    } catch (err) {
      setError('Failed to add skill');
    }
  };

  const hasValidAiProfile = Boolean(
    profile?.lastAiProfiledAt &&
      profile?.category &&
      profile?.category !== 'None' &&
      (profile?.categorizedSkills?.length > 0 || profile?.aiSkillSummary)
  );

  const groupedSkills = hasValidAiProfile
    ? (profile?.categorizedSkills || []).reduce((acc, item) => {
        const cat = item.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {})
    : {};

  return (
    <div className="profile-dashboard">
      <div className="page-top-row">
        <div>
          <h1 className="profile-header-title">AI Skill Profiler</h1>
          <p className="profile-header-subtitle">Speak or write your experience to organize your skills</p>
        </div>

        <button
          type="button"
          onClick={handleResetAiProfile}
          style={{
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fee2e2',
            padding: '8px 14px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Clear Profile
        </button>
      </div>

      {message && <div className="alert-message success">{message}</div>}
      {error && <div className="alert-message error">{error}</div>}

      <div className="profile-grid">
        {/* Left: Soft Light Skill Summary Card */}
        <div className="digital-id-card">
          <div className="card-top-bar">
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#4f46e5' }}>
              SKILL SUMMARY
            </span>
            <span
              style={{
                background: hasValidAiProfile ? '#dcfce7' : '#f1f5f9',
                color: hasValidAiProfile ? '#15803d' : '#64748b',
                padding: '3px 10px',
                borderRadius: '99px',
                fontSize: '0.72rem',
                fontWeight: '700',
              }}
            >
              {hasValidAiProfile ? `${profile.skillStrengthScore}% Score` : '0% Score'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>
            {hasValidAiProfile ? profile.occupation : 'No Trade Detected'}
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#4f46e5', fontWeight: '600', marginBottom: '12px' }}>
            {hasValidAiProfile ? `${labelFor(profile.category)} • ${profile.experienceYears} Yrs` : 'Speak or type on the right'}
          </p>

          <div
            style={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '0.8rem',
              color: '#475569',
              lineHeight: '1.5',
              marginBottom: '14px',
            }}
          >
            {hasValidAiProfile ? profile.aiSkillSummary : 'Your extracted skill summary will appear here.'}
          </div>

          {hasValidAiProfile && profile?.toolsAndEquipment?.length > 0 && (
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                TOOLS
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.toolsAndEquipment.map((tool, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#eef2ff',
                      color: '#4f46e5',
                      padding: '4px 9px',
                      borderRadius: '8px',
                      fontSize: '0.73rem',
                      fontWeight: '600',
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Clean Voice & Skills Panels */}
        <div style={{ display: 'grid', gap: '20px' }}>
          <div className="form-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                1. Voice or Text Input
              </h3>
              <select
                className="input-control"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
              >
                <option value="ur-PK">Urdu (اردو)</option>
                <option value="en-US">English / Roman Urdu</option>
              </select>
            </div>

            <div
              style={{
                background: isListening ? '#fef2f2' : '#f8fafc',
                border: isListening ? '1px dashed #ef4444' : '1px dashed #cbd5e1',
                borderRadius: '14px',
                padding: '18px',
                textAlign: 'center',
                marginBottom: '14px',
              }}
            >
              <button
                type="button"
                onClick={handleToggleVoice}
                style={{
                  background: isListening ? '#dc2626' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '11px 24px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {isListening ? 'Stop Recording' : 'Tap to Speak'}
              </button>
            </div>

            <div className="input-group">
              <textarea
                rows="3"
                className="input-control"
                placeholder="Write or speak your experience (e.g. Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon)..."
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => runAiAnalysis(voiceText, false)}
              className="btn-action-primary"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Experience'}
            </button>
          </div>

          <div className="form-panel">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
              2. Extracted Skills by Category
            </h3>

            {Object.keys(groupedSkills).length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.86rem' }}>No skills extracted yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {Object.entries(groupedSkills).map(([catName, skillsList]) => (
                  <div key={catName} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.86rem', color: '#4f46e5', marginBottom: '8px' }}>
                      {catName}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {skillsList.map((sk, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            color: '#1e293b',
                          }}
                        >
                          {sk.skillName} • <span style={{ color: '#4f46e5' }}>{sk.level}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-panel">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
              3. Recommended Skills to Add
            </h3>

            {!hasValidAiProfile || !profile?.recommendedSkills || profile.recommendedSkills.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.86rem' }}>Analyze your experience above to see recommendations.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {profile.recommendedSkills.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontWeight: '600', fontSize: '0.84rem', color: '#1e293b' }}>{rec.skillName}</span>
                    <button
                      type="button"
                      onClick={() => handleAcceptSkill(rec)}
                      style={{
                        background: '#eef2ff',
                        color: '#4f46e5',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

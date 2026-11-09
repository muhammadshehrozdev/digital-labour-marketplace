import { useEffect, useMemo, useRef, useState } from 'react';
import { ListChecks, Mic, MicOff, Search, Trash2 } from 'lucide-react';
import API from '../../api';
import { Alert, Badge, Button, Card, Checkbox, Combobox, ConfirmDialog, EmptyState, IconButton, Section, Skeleton, StatusChip, TextArea, useToast } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiMessage } from '../../utils/apiErrors';
import { EXAMPLES, MAX_TEXT, NO_MATCH_TEXT, VOICE_NOTICE } from './skillsText';
import styles from './SkillsEditor.module.css';

function useSpeech() {
  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  return Recognition ?? null;
}

// Module 2 skill editor: describe your work -> suggestions (saves nothing) -> tick -> add.
// Nothing on the profile changes unless the worker clicks a save button (M2-2, M2-3).
export default function SkillsEditor({ onSkillsChange, onProfileSuggestionUsed }) {
  const toast = useToast();
  const { skills: allSkills, categories, categoryLabel } = useTaxonomy();
  const [saved, setSaved] = useState(null); // null = loading
  const [loadError, setLoadError] = useState('');
  const [text, setText] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(''); // 'extract' | 'add' | 'profile'
  const [error, setError] = useState('');
  const [toRemove, setToRemove] = useState(null);
  const [listening, setListening] = useState(false);
  const Recognition = useSpeech();
  const recognitionRef = useRef(null);

  // `onboarding` is the server's onboarding state returned with every skills response; the
  // wizard must use it (not a local guess), otherwise Continue can bounce back (Batch 3 fix).
  const update = (list, onboarding) => {
    setSaved(list);
    onSkillsChange?.(list, onboarding);
  };

  useEffect(() => {
    let active = true;
    API.get('/workers/me/skills')
      .then(({ data }) => active && update(data.skills, data.onboarding))
      .catch((err) => active && setLoadError(apiMessage(err, 'Could not load your skills.')));
    return () => {
      active = false;
      recognitionRef.current?.stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedIds = useMemo(() => new Set((saved ?? []).map((s) => s.skillId)), [saved]);

  const findSkills = async (e) => {
    e?.preventDefault();
    setError('');
    if (!text.trim()) {
      setError(NO_MATCH_TEXT.empty);
      return;
    }
    setBusy('extract');
    try {
      const { data } = await API.post('/workers/me/skills/extract', { text, inputMode });
      setResult(data);
      setSelected(new Set(data.skills.filter((s) => !s.alreadySaved).map((s) => s.skillId)));
    } catch (err) {
      setError(apiMessage(err, 'Could not read the text. Please try again.'));
    } finally {
      setBusy('');
    }
  };

  const addSelected = async () => {
    setBusy('add');
    setError('');
    try {
      const { data } = await API.post('/workers/me/skills', { skillIds: [...selected], addedVia: 'extractor', sourceText: text });
      update(data.skills, data.onboarding);
      setResult((r) => r && { ...r, skills: r.skills.map((s) => ({ ...s, alreadySaved: s.alreadySaved || selected.has(s.skillId) })) });
      toast.show({ title: `${selected.size} skill${selected.size === 1 ? '' : 's'} added`, message: 'They show as "Self-declared" until proof is checked.' });
      setSelected(new Set());
    } catch (err) {
      setError(apiMessage(err, 'Could not add the skills.'));
    } finally {
      setBusy('');
    }
  };

  const addManual = async (option) => {
    setError('');
    try {
      const { data } = await API.post('/workers/me/skills', { skillIds: [option.value], addedVia: 'manual' });
      update(data.skills, data.onboarding);
      toast.show({ title: `"${option.label}" added` });
    } catch (err) {
      setError(apiMessage(err, 'Could not add the skill.'));
    }
  };

  const remove = async () => {
    const skill = toRemove;
    setBusy('remove');
    try {
      const { data } = await API.delete(`/workers/me/skills/${encodeURIComponent(skill.skillId)}`);
      update(data.skills, data.onboarding);
      toast.show({ tone: 'info', title: `"${skill.name}" removed` });
    } catch (err) {
      setError(apiMessage(err, 'Could not remove the skill.'));
    } finally {
      setBusy('');
      setToRemove(null);
    }
  };

  // "Use these": copies the suggested trade and experience to the profile, only on this click.
  const useSuggestions = async () => {
    const payload = {};
    if (result.suggestedCategory) {
      payload.category = result.suggestedCategory;
      payload.occupation = result.suggestedOccupation;
    }
    if (result.experience) payload.experienceYears = result.experience.years;
    setBusy('profile');
    try {
      const { data } = await API.put('/workers/me', payload);
      toast.show({ title: 'Profile updated', message: 'Trade and experience were saved from your text.' });
      onProfileSuggestionUsed?.(data);
    } catch (err) {
      setError(apiMessage(err, 'Could not update the profile.'));
    } finally {
      setBusy('');
    }
  };

  const toggleVoice = () => {
    if (!Recognition) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'ur-PK';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const said = Array.from(event.results).map((r) => r[0].transcript).join(' ');
      setText((t) => `${t}${t.trim() ? ' ' : ''}${said}`.slice(0, MAX_TEXT));
      setInputMode('voice');
    };
    recognition.onerror = () => setError('Voice typing did not work. Please type instead.');
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const manualOptions = useMemo(
    () => allSkills.filter((s) => !savedIds.has(s.id)).map((s) => ({ value: s.id, label: s.name, group: categoryLabel(s.category) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSkills, savedIds, categories]
  );

  const grouped = result
    ? result.categories.map((c) => ({ ...c, items: result.skills.filter((s) => s.category === c.id) }))
    : [];
  const experienceText = result?.experience
    ? `${result.experience.years} year${result.experience.years === 1 ? '' : 's'}${result.experience.months ? ` ${result.experience.months} month${result.experience.months === 1 ? '' : 's'}` : ''}`
    : null;

  return (
    <div className={styles.editor}>
      {error && <Alert tone="danger">{error}</Alert>}

      <Card as="section" aria-labelledby="describe-title">
        <form className={styles.describe} onSubmit={findSkills}>
          <h2 id="describe-title" className={styles.h2}>Describe your work</h2>
          <TextArea
            label="In your own words: what work do you do, and for how long?"
            hint="Urdu, Roman Urdu or English are all fine."
            maxLength={MAX_TEXT}
            rows={5}
            urdu
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInputMode('text');
            }}
          />
          <div className={styles.examples}>
            <span className={styles.examplesLabel}>See an example:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex.id} type="button" className={styles.example} lang={ex.lang} onClick={() => { setText(ex.text); setInputMode('text'); }}>
                {ex.label}
              </button>
            ))}
          </div>
          {Recognition && (
            <div className={styles.voice}>
              <Button variant="secondary" size="sm" icon={listening ? MicOff : Mic} onClick={toggleVoice} aria-pressed={listening}>
                {listening ? 'Stop voice typing' : 'Use voice typing'}
              </Button>
              <p className={styles.voiceNotice}>{VOICE_NOTICE}</p>
            </div>
          )}
          <Button type="submit" icon={Search} loading={busy === 'extract'} className={styles.findButton}>Find my skills</Button>
        </form>
      </Card>

      {result && (
        <Card as="section" aria-labelledby="suggestions-title" aria-live="polite">
          <div className={styles.suggestions}>
            <div>
              <h2 id="suggestions-title" className={styles.h2}>Skill suggestions</h2>
              <p className={styles.honest}>Suggestions come from a word list. Please check them.</p>
            </div>

            {result.skills.length === 0 ? (
              <Alert tone="info">{NO_MATCH_TEXT[result.noSkillReason] ?? NO_MATCH_TEXT.no_trade_words}</Alert>
            ) : (
              <>
                {result.categoryTie && (
                  <Alert tone="info">Your text matches more than one trade equally. Choose your main trade on your profile.</Alert>
                )}
                {grouped.map((group) => (
                  <fieldset key={group.id} className={styles.group}>
                    <legend className={styles.groupTitle}>{group.label}</legend>
                    {group.items.map((s) => (
                      <Checkbox
                        key={s.skillId}
                        label={s.name}
                        checked={s.alreadySaved || selected.has(s.skillId)}
                        disabled={s.alreadySaved}
                        hint={s.alreadySaved ? 'Already on your profile' : undefined}
                        onChange={(on) => setSelected((prev) => {
                          const next = new Set(prev);
                          if (on) next.add(s.skillId); else next.delete(s.skillId);
                          return next;
                        })}
                      >
                        <span className={styles.matched}>
                          <span className="visually-hidden">Found because you wrote: </span>
                          {s.matched.map((w) => (
                            <span key={w} className={styles.word} dir="auto">{w}</span>
                          ))}
                        </span>
                      </Checkbox>
                    ))}
                  </fieldset>
                ))}
                <Button onClick={addSelected} disabled={selected.size === 0} loading={busy === 'add'}>
                  Add selected skills{selected.size ? ` (${selected.size})` : ''}
                </Button>
              </>
            )}

            {(experienceText || result.suggestedCategory || result.experienceNote) && (
              <div className={styles.useThese}>
                <div>
                  <p className={styles.useTitle}>Also found in your text</p>
                  <ul className={styles.facts}>
                    {result.suggestedCategory && <li>Trade: <strong>{result.suggestedOccupation}</strong> ({categoryLabel(result.suggestedCategory)})</li>}
                    {experienceText && (
                      <li>
                        Experience: <strong>{experienceText}</strong>
                        {result.experience.months > 0 && ` (your profile keeps whole years: ${result.experience.years})`}
                      </li>
                    )}
                    {result.experienceNote === 'over_60' && <li>A number of years over 60 was ignored. Please check your text.</li>}
                  </ul>
                </div>
                {(experienceText || result.suggestedCategory) && (
                  <Button variant="secondary" size="sm" loading={busy === 'profile'} onClick={useSuggestions}>Use these on my profile</Button>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      <Section
        title="Skills on your profile"
        id="saved-skills"
        description="Skills show as Self-declared until proof is checked (coming next)."
      >
        {loadError && <Alert tone="danger">{loadError}</Alert>}
        {saved === null && !loadError ? (
          <div aria-busy="true"><span className="visually-hidden" role="status">Loading…</span><Skeleton lines={3} /></div>
        ) : saved && saved.length === 0 ? (
          <EmptyState icon={ListChecks} headingLevel={3} title="No skills yet" description="Describe your work above, or pick a skill from the list below." />
        ) : (
          <ul className={styles.savedList}>
            {(saved ?? []).map((s) => (
              <li key={s.skillId} className={styles.savedItem}>
                <div className={styles.savedText}>
                  <span className={styles.savedName}>{s.name}</span>
                  <span className={styles.savedMeta}>
                    {categoryLabel(s.category)}
                    {s.custom && <Badge tone="neutral">Custom</Badge>}
                  </span>
                </div>
                <StatusChip kind="skill" status="self_declared" />
                <IconButton label={`Remove ${s.name}`} icon={Trash2} size="sm" onClick={() => setToRemove(s)} />
              </li>
            ))}
          </ul>
        )}
        <Combobox
          id="skill-search"
          label="Add a skill from the list"
          hint="Type to search, then press Enter or tap a skill."
          placeholder="e.g. Geyser installation"
          options={manualOptions}
          onSelect={addManual}
        />
      </Section>

      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Remove this skill?"
        message={toRemove ? `"${toRemove.name}" will be removed from your profile. You can add it again later.` : ''}
        confirmLabel="Remove skill"
        tone="danger"
        loading={busy === 'remove'}
        onConfirm={remove}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}

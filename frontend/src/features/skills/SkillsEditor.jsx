import { useEffect, useMemo, useState } from 'react';
import { Mic, MicOff, Search, Trash2 } from 'lucide-react';
import API from '../../api';
import { Alert, Badge, Button, Card, Checkbox, Combobox, ConfirmDialog, EmptyState, IconButton, Section, Skeleton, StatusChip, useToast } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { Rich, useLanguage } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import { MAX_TEXT } from './skillsText';
import ExampleCarousel from './ExampleCarousel';
import HighlightedTextArea from './HighlightedTextArea';
import PotentialSkills from '../worker/PotentialSkills';
import { useVoiceTyping } from './useVoiceTyping';
import styles from './SkillsEditor.module.css';

// Module 2 skill editor: describe your work -> suggestions (saves nothing) -> tick -> add.
// Nothing on the profile changes unless the worker clicks a save button (M2-2, M2-3).
// The extractor is rule-based (a word list), and the screen says so.
export default function SkillsEditor({ onSkillsChange, onProfileSuggestionUsed }) {
  const toast = useToast();
  const { t, te, info } = useLanguage();
  const { skills: allSkills, categories, categoryLabel, categoryOccupation, skillName } = useTaxonomy();
  const [saved, setSaved] = useState(null); // null = loading
  const [loadError, setLoadError] = useState(null);
  const [text, setText] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(''); // 'extract' | 'add' | 'profile' | 'remove'
  const [error, setError] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const voice = useVoiceTyping({
    speechLang: info.speech,
    onText: (said) => {
      setText((current) => `${current}${current.trim() ? ' ' : ''}${said}`.slice(0, MAX_TEXT));
      setInputMode('voice');
    },
  });

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
      .catch((err) => active && setLoadError(apiError(err, 'skills.loadFailed')));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedIds = useMemo(() => new Set((saved ?? []).map((s) => s.skillId)), [saved]);

  const findSkills = async (e) => {
    e?.preventDefault();
    setError(null);
    if (!text.trim()) {
      setError('validation.skillsText');
      return;
    }
    setBusy('extract');
    try {
      const { data } = await API.post('/workers/me/skills/extract', { text, inputMode });
      setResult(data);
      setSelected(new Set(data.skills.filter((s) => !s.alreadySaved).map((s) => s.skillId)));
    } catch (err) {
      setError(apiError(err, 'skills.extractFailed'));
    } finally {
      setBusy('');
    }
  };

  const addSelected = async () => {
    setBusy('add');
    setError(null);
    try {
      const { data } = await API.post('/workers/me/skills', { skillIds: [...selected], addedVia: 'extractor', sourceText: text });
      update(data.skills, data.onboarding);
      setResult((r) => r && { ...r, skills: r.skills.map((s) => ({ ...s, alreadySaved: s.alreadySaved || selected.has(s.skillId) })) });
      toast.show({ title: t('skills.added', { count: selected.size }), message: t('skills.addedText') });
      setSelected(new Set());
    } catch (err) {
      setError(apiError(err, 'skills.addFailed'));
    } finally {
      setBusy('');
    }
  };

  const addManual = async (option) => {
    setError(null);
    try {
      const { data } = await API.post('/workers/me/skills', { skillIds: [option.value], addedVia: 'manual' });
      update(data.skills, data.onboarding);
      toast.show({ title: t('skills.addedOne', { name: option.label }) });
    } catch (err) {
      setError(apiError(err, 'skills.addOneFailed'));
    }
  };

  // Undo (Batch 4, feature 17): adds the same skill back. Offered only when the skill had no
  // proof, because proof that was waiting is deleted with the skill and cannot come back.
  const putBack = async (skill) => {
    try {
      const { data } = skill.custom
        ? await API.post('/workers/me/skills/custom', { name: skill.name, category: skill.category })
        : await API.post('/workers/me/skills', { skillIds: [skill.skillId], addedVia: skill.addedVia ?? 'manual' });
      update(data.skills, data.onboarding);
    } catch {
      toast.show({ tone: 'danger', title: t('workerx.undoFailed') });
    }
  };

  const remove = async () => {
    const skill = toRemove;
    setBusy('remove');
    try {
      const { data } = await API.delete(`/workers/me/skills/${encodeURIComponent(skill.skillId)}`);
      update(data.skills, data.onboarding);
      const hadProof = (skill.evidenceSummary?.pending ?? 0) + (skill.evidenceSummary?.approved ?? 0) > 0;
      toast.show({ tone: 'info', title: t('skills.removed', { name: skillName(skill) }), action: hadProof ? undefined : { label: t('workerx.undo'), onClick: () => putBack(skill) } });
    } catch (err) {
      setError(apiError(err, 'skills.removeFailed'));
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
      toast.show({ title: t('skills.profileUpdated'), message: t('skills.profileUpdatedText') });
      onProfileSuggestionUsed?.(data);
    } catch (err) {
      setError(apiError(err, 'skills.profileFailed'));
    } finally {
      setBusy('');
    }
  };

  const manualOptions = useMemo(
    () => allSkills.filter((s) => !savedIds.has(s.id)).map((s) => ({ value: s.id, label: s.name, group: categoryLabel(s.category) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSkills, savedIds, categories]
  );

  const grouped = result
    ? result.categories.map((c) => ({ ...c, label: categoryLabel(c.id) || c.label, items: result.skills.filter((s) => s.category === c.id) }))
    : [];
  const experienceText = result?.experience
    ? [t('common.years', { count: result.experience.years }), result.experience.months ? t('common.months', { count: result.experience.months }) : '']
        .filter(Boolean)
        .join(' ')
    : null;
  const voiceError = voice.error
    ? t(voice.error.key, { language: t(`voice.speechLanguages.${voice.error.params?.speechLang}`) })
    : '';

  return (
    <div className={styles.editor}>
      {error && <Alert tone="danger">{te(error)}</Alert>}

      <Card as="section" aria-labelledby="describe-title">
        <form className={styles.describe} onSubmit={findSkills}>
          <h2 id="describe-title" className={styles.h2}>{t('skills.describeTitle')}</h2>
          <HighlightedTextArea
            label={t('skills.describeLabel')}
            hint={t('skills.describeHint')}
            maxLength={MAX_TEXT}
            rows={5}
            value={text}
            assist="skills.describe"
            words={result?.skills.flatMap((s) => s.matched) ?? []}
            onChange={(e) => {
              setText(e.target.value);
              setInputMode('text');
            }}
          />
          <ExampleCarousel onUse={(example) => { setText(example); setInputMode('text'); }} />
          <div className={styles.voice}>
            {voice.supported && (
              <div className={styles.voiceRow}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={voice.listening ? MicOff : Mic}
                  onClick={voice.listening ? voice.stop : voice.start}
                  aria-pressed={voice.listening}
                  className={voice.listening ? styles.listening : undefined}
                >
                  {voice.listening ? t('voice.stop') : t('voice.start')}
                </Button>
                <span className={styles.voiceMeta} aria-live="polite">
                  {voice.listening ? t('voice.listening') : t('voice.recognisedAs', { language: t(`voice.speechLanguages.${info.speech}`) })}
                </span>
              </div>
            )}
            {voiceError && <Alert tone="warning">{voiceError}</Alert>}
            <div className={styles.voiceHelp}>
              {voice.supported && <p>{t('voice.bestIn')} {t('voice.notice')}</p>}
              <p><Rich text={t('voice.alternatives')} /></p>
            </div>
          </div>
          <Button type="submit" icon={Search} loading={busy === 'extract'} className={styles.findButton}>{t('skills.find')}</Button>
        </form>
      </Card>

      {result && (
        <Card as="section" aria-labelledby="suggestions-title" aria-live="polite">
          <div className={styles.suggestions}>
            <div>
              <h2 id="suggestions-title" className={styles.h2}>{t('skills.suggestionsTitle')}</h2>
              <p className={styles.honest}>{t('skills.honest')}</p>
            </div>

            {result.skills.length === 0 ? (
              <Alert tone="info">{t(`skills.noMatch.${result.noSkillReason === 'negative_phrase' ? 'negative_phrase' : 'no_trade_words'}`)}</Alert>
            ) : (
              <>
                {result.categoryTie && <Alert tone="info">{t('skills.tie')}</Alert>}
                {grouped.map((group) => (
                  <fieldset key={group.id} className={styles.group}>
                    <legend className={styles.groupTitle}>{group.label}</legend>
                    {group.items.map((s) => (
                      <Checkbox
                        key={s.skillId}
                        label={skillName(s)}
                        checked={s.alreadySaved || selected.has(s.skillId)}
                        disabled={s.alreadySaved}
                        hint={s.alreadySaved ? t('skills.alreadySaved') : undefined}
                        onChange={(on) => setSelected((prev) => {
                          const next = new Set(prev);
                          if (on) next.add(s.skillId); else next.delete(s.skillId);
                          return next;
                        })}
                      >
                        <span className={styles.matched}>
                          <span className="visually-hidden">{t('skills.foundBecause')} </span>
                          {s.matched.map((w) => (
                            <span key={w} className={styles.word} dir="auto">{w}</span>
                          ))}
                        </span>
                      </Checkbox>
                    ))}
                  </fieldset>
                ))}
                <Button onClick={addSelected} disabled={selected.size === 0} loading={busy === 'add'}>
                  {selected.size ? t('skills.addSelectedCount', { count: selected.size }) : t('skills.addSelected')}
                </Button>
              </>
            )}

            {(experienceText || result.suggestedCategory || result.experienceNote) && (
              <div className={styles.useThese}>
                <div>
                  <p className={styles.useTitle}>{t('skills.alsoFound')}</p>
                  <ul className={styles.facts}>
                    {result.suggestedCategory && (
                      <li>{t('skills.foundTrade')} <strong>{categoryOccupation(result.suggestedCategory) || result.suggestedOccupation}</strong> ({categoryLabel(result.suggestedCategory)})</li>
                    )}
                    {experienceText && (
                      <li>
                        {t('skills.foundExperience')} <strong>{experienceText}</strong>
                        {result.experience.months > 0 && ` ${t('skills.wholeYears', { years: result.experience.years })}`}
                      </li>
                    )}
                    {result.experienceNote === 'over_60' && <li>{t('skills.over60')}</li>}
                  </ul>
                </div>
                {(experienceText || result.suggestedCategory) && (
                  <Button variant="secondary" size="sm" loading={busy === 'profile'} onClick={useSuggestions}>{t('skills.useThese')}</Button>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {saved && saved.length > 0 && <PotentialSkills headingLevel={2} onSkillsChange={update} key={saved.length} />}

      <Section title={t('skills.savedTitle')} id="saved-skills" description={t('skills.savedText')}>
        {loadError && <Alert tone="danger">{te(loadError)}</Alert>}
        {saved === null && !loadError ? (
          <div aria-busy="true"><span className="visually-hidden" role="status">{t('common.loading')}</span><Skeleton lines={3} /></div>
        ) : saved && saved.length === 0 ? (
          <EmptyState art="empty-skills" compact headingLevel={3} title={t('skills.noneTitle')} description={t('skills.noneText')} />
        ) : (
          <ul className={styles.savedList}>
            {(saved ?? []).map((s) => (
              <li key={s.skillId} className={styles.savedItem}>
                <div className={styles.savedText}>
                  <span className={styles.savedName}>{skillName(s)}</span>
                  <span className={styles.savedMeta}>
                    {categoryLabel(s.category)}
                    {s.custom && <Badge tone="neutral">{t('skills.custom')}</Badge>}
                  </span>
                </div>
                <StatusChip kind="skill" status={s.evidenceSummary?.status ?? 'self_declared'} />
                <IconButton label={t('skills.remove', { name: skillName(s) })} icon={Trash2} size="sm" onClick={() => setToRemove(s)} />
              </li>
            ))}
          </ul>
        )}
        <Combobox
          id="skill-search"
          label={t('skills.searchLabel')}
          hint={t('skills.searchHint')}
          placeholder={t('skills.searchPlaceholder')}
          options={manualOptions}
          onSelect={addManual}
          assist="skills.search"
          icon={Search}
        />
      </Section>

      <ConfirmDialog
        open={Boolean(toRemove)}
        title={t('skills.removeTitle')}
        message={toRemove ? t('skills.removeText', { name: skillName(toRemove) }) : ''}
        confirmLabel={t('skills.removeConfirm')}
        tone="danger"
        loading={busy === 'remove'}
        onConfirm={remove}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}

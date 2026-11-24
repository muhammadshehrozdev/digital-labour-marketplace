// /job-requests/new — "Describe a job" (Module 6, Batch 8B): three steps.
//   1. What do you need?   the customer types or speaks (🎤) the job in their own words; "Check my words" asks the
//                          live analyzer (POST /api/job-requests/analyze, nothing saved) and marks the words it used.
//   2. Check the details   every suggestion pre-selected as a picture choice, each with the words that led to it; the
//                          customer may change everything (JobDetailsForm). Checking again never overwrites a field the
//                          customer changed (mergeSuggestions.js).
//   3. Save                a summary (🔊) and Save -> POST /api/job-requests with exactly the documented fields.
// Honest words only: the app "looks for known words"; no score and no percentage. The budget is private.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mic, MicOff, Save, Search } from 'lucide-react';
import API from '../../api';
import { Alert, Button, ConfirmDialog, PageHeader, Stepper, useToast } from '../../components/ui';
import HighlightedTextArea from '../../features/skills/HighlightedTextArea';
import { useVoiceTyping } from '../../features/assist/useVoiceTyping';
import JobDetailsForm from '../../features/jobs/JobDetailsForm';
import JobSummary from '../../features/jobs/JobSummary';
import { EMPTY_FORM, budgetOf, checkForm, createBody, dateOf, wordsFound } from '../../features/jobs/jobText';
import { mergeSuggestions, suggestedSkills, takeOffer } from '../../features/jobs/mergeSuggestions';
import { useJobOptions } from '../../features/jobs/useJobOptions';
import { pktDay } from '../../features/booking/bookingText';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useLanguage } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { formatRupees } from '../../utils/masks';
import styles from '../../features/jobs/Jobs.module.css';

const STEPS = ['describe', 'details', 'save'];

export function FoundWords({ analysis }) {
  const { t } = useLanguage();
  if (!analysis) return null;
  const words = wordsFound(analysis);
  return (
    <p className={styles.words} data-testid="found-words">
      {words.length ? <>{t('jobs.describe.found')} {words.map((w) => <span key={w} className={styles.word} dir="auto">{w}</span>)}</> : t('jobs.describe.noWords')}
    </p>
  );
}

// "How does this work?": the live method's name from GET /api/meta/job-options and one honest sentence.
export function HowItWorks() {
  const { t, lang } = useLanguage();
  const { analyzer } = useJobOptions();
  const name = analyzer ? (lang === 'en' ? analyzer.methodName : t(`jobs.method.${analyzer.method}`)) : null;
  return (
    <details className={styles.how} data-testid="how-it-works">
      <summary>{t('jobs.describe.howTitle')}</summary>
      {name && <p>{t('jobs.describe.howMethod', { method: name })}</p>}
      <p>{t('jobs.describe.how')}</p>
    </details>
  );
}

export default function DescribeJob() {
  const { t, te, info } = useLanguage();
  useDocumentTitle(t('jobs.titles.new'));
  const toast = useToast();
  const navigate = useNavigate();
  const { skills: allSkills } = useTaxonomy();
  const { limits } = useJobOptions();
  const today = pktDay();

  const [step, setStep] = useState('describe');
  const [text, setText] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [analysis, setAnalysis] = useState(null);
  const [checkedText, setCheckedText] = useState(null);
  const [checking, setChecking] = useState(false);
  const [textError, setTextError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState(() => new Set());
  const [offers, setOffers] = useState({});
  const [skillsNote, setSkillsNote] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedJob, setSavedJob] = useState(null);

  // the newest values for the asynchronous check (a second check replaces the first)
  const latest = useRef({});
  latest.current = { text, inputMode, form, touched };
  const checkId = useRef(0);
  const skillCategory = (id) => allSkills.find((s) => s.id === id)?.category ?? null;

  const guard = useUnsavedChanges(!savedJob && text.trim() !== '');
  useEffect(() => {
    if (savedJob) navigate(`/job-requests/${savedJob._id}`, { state: { created: true } });
  }, [savedJob, navigate]);

  const check = async () => {
    const { text: words, inputMode: mode } = latest.current;
    if (!words.trim()) {
      setTextError('jobs.describe.needText');
      return false;
    }
    const id = checkId.current + 1;
    checkId.current = id;
    setChecking(true);
    setTextError(null);
    try {
      const { data } = await API.post('/job-requests/analyze', { text: words, inputMode: mode });
      if (id !== checkId.current) return false;
      const merged = mergeSuggestions(latest.current.form, latest.current.touched, data, { maxSkills: limits.maxSkills, skillCategory, formatAmount: formatRupees });
      setAnalysis(data);
      setCheckedText(words);
      setForm(merged.form);
      setOffers(merged.offers);
      setSkillsNote(merged.removedSkills.length ? t('jobs.form.skillsRemoved') : null);
      return true;
    } catch (err) {
      if (id !== checkId.current) return false;
      setTextError(apiFieldErrors(err).text ?? apiError(err));
      return false;
    } finally {
      if (id === checkId.current) setChecking(false);
    }
  };

  // 🎤 adds the spoken words at the end; the words are checked by themselves when the microphone stops
  const voice = useVoiceTyping({
    speechLang: info.speech,
    onText: (said) => {
      setText((current) => `${current.replace(/\s+$/, '')}${current.trim() ? ' ' : ''}${said}`.slice(0, limits.descriptionMax));
      setInputMode('voice');
    },
  });
  const wasListening = useRef(false);
  useEffect(() => {
    if (wasListening.current && !voice.listening && latest.current.text.trim() && latest.current.text !== checkedText) check();
    wasListening.current = voice.listening;
    // only when the microphone stops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.listening]);

  const setField = (field, value) => {
    const { form: current, touched: was } = latest.current;
    const nextTouched = new Set(was).add(field);
    let next = field === 'day' ? { ...current, ...value } : { ...current, [field]: value };
    if (field === 'category' && value !== current.category) {
      if (was.has('skills')) {
        const kept = current.skills.filter((id) => skillCategory(id) === value);
        if (kept.length !== current.skills.length) setSkillsNote(t('jobs.form.skillsRemoved'));
        next = { ...next, skills: kept };
      } else {
        if (current.skills.length) setSkillsNote(t('jobs.form.skillsRemoved'));
        next = { ...next, skills: suggestedSkills(analysis, value, limits.maxSkills) };
      }
    }
    if (field === 'skills') setSkillsNote(null);
    setForm(next);
    setTouched(nextTouched);
    setOffers(({ [field]: _done, ...rest }) => rest);
    setErrors(({ [field === 'day' ? 'date' : field]: _fixed, ...rest }) => rest);
  };

  const onTakeOffer = (field) => {
    const r = takeOffer(form, touched, offers, field);
    setForm(r.form);
    setTouched(r.touched);
    setOffers(r.offers);
  };

  const toDetails = async () => {
    if ([...text.trim()].length < limits.descriptionMin) {
      setTextError({ key: 'jobs.describe.tooShort', params: { min: limits.descriptionMin } });
      return;
    }
    if (text !== checkedText && !(await check())) return;
    setStep('details');
  };

  const toSave = (e) => {
    e?.preventDefault();
    const found = checkForm(form, today);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStep('save');
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const { data } = await API.post('/job-requests', createBody({ text, inputMode, form, today }));
      toast.show({ tone: 'success', title: t('jobs.new.saved', { code: data.job.code }), message: t('jobs.new.next') });
      setSavedJob(data.job);
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (fields.description) {
        setTextError(fields.description);
        setStep('describe');
      } else if (Object.keys(fields).length) {
        setErrors({ ...fields, date: fields.preferredDate });
        setStep('details');
      }
      setSaveError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const index = STEPS.indexOf(step);
  const voiceError = voice.error ? t(voice.error.key, { language: t(`voice.speechLanguages.${voice.error.params?.speechLang}`) }) : '';
  const fresh = analysis && text === checkedText;

  return (
    <div className={styles.page}>
      <PageHeader title={t('jobs.new.title')} description={t('jobs.new.lead')} />
      <Stepper label={t('jobs.new.steps')} current={step} completed={STEPS.slice(0, index)} steps={STEPS.map((id) => ({ id, label: t(`jobs.new.step.${id}`) }))} />

      {step === 'describe' && (
        <section className={styles.section} aria-labelledby="step-describe">
          <h2 id="step-describe" className={styles.sectionTitle}>{t('jobs.new.step.describe')}</h2>
          <HighlightedTextArea
            label={t('jobs.describe.label')}
            hint={t('jobs.describe.hint')}
            maxLength={limits.descriptionMax}
            rows={5}
            value={text}
            assist="jobs.describe"
            words={fresh ? wordsFound(analysis) : []}
            error={textError}
            onChange={(e) => {
              setText(e.target.value);
              if (!e.target.value.trim()) setInputMode('text');
            }}
          />
          {voice.supported && (
            <div className={styles.voiceRow}>
              <Button size="lg" icon={voice.listening ? MicOff : Mic} className={[styles.speak, voice.listening && styles.listening].filter(Boolean).join(' ')} onClick={voice.listening ? voice.stop : voice.start} aria-pressed={voice.listening}>
                {voice.listening ? t('voice.stop') : t('jobs.describe.speak')}
              </Button>
              <span className={styles.muted} aria-live="polite">{voice.listening ? t('voice.listening') : t('voice.recognisedAs', { language: t(`voice.speechLanguages.${info.speech}`) })}</span>
            </div>
          )}
          {voiceError && <Alert tone="warning">{voiceError}</Alert>}
          {fresh && analysis.notes?.includes('address_in_text') && <Alert tone="warning" title={t('jobs.describe.addressTitle')}>{t('jobs.describe.address')}</Alert>}
          <div className={styles.actions}>
            <Button variant="secondary" icon={Search} loading={checking} onClick={check}>{t('jobs.describe.check')}</Button>
          </div>
          <p className={styles.status} role="status" aria-live="polite">{checking ? t('jobs.describe.checking') : ''}</p>
          {fresh && <FoundWords analysis={analysis} />}
          <HowItWorks />
          <div className={styles.actions}>
            <Button icon={ArrowRight} onClick={toDetails} disabled={checking}>{t('jobs.new.toDetails')}</Button>
          </div>
        </section>
      )}

      {step === 'details' && (
        <form onSubmit={toSave} noValidate aria-labelledby="step-details" className={styles.page} style={{ paddingBlockEnd: 0 }}>
          <h2 id="step-details" className={styles.sectionTitle}>{t('jobs.new.step.details')}</h2>
          <p className={styles.muted}>{t('jobs.new.detailsLead')}</p>
          <JobDetailsForm form={form} setField={setField} analysis={analysis} offers={offers} onTakeOffer={onTakeOffer} errors={errors} today={today} limits={limits} skillsNote={skillsNote} />
          {Object.keys(errors).length > 0 && <Alert tone="danger">{t('jobs.form.fixMarked')}</Alert>}
          <div className={styles.actions}>
            <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep('describe')}>{t('common.back')}</Button>
            <Button type="submit" icon={ArrowRight}>{t('jobs.new.toSave')}</Button>
          </div>
        </form>
      )}

      {step === 'save' && (
        <section className={styles.section} aria-labelledby="step-save">
          <h2 id="step-save" className={styles.sectionTitle}>{t('jobs.new.step.save')}</h2>
          <JobSummary
            showBudget
            showDescription
            job={{ ...form, description: text.trim(), preferredDate: dateOf(form.day, form.date, today), budget: budgetOf(form.budget) }}
          />
          <p className={styles.notice}>{t('jobs.new.wordsNote')}</p>
          {saveError && <Alert tone="danger">{te(saveError)}</Alert>}
          <div className={styles.actions}>
            <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep('details')}>{t('common.back')}</Button>
            <Button size="lg" icon={Save} loading={saving} onClick={save}>{t('jobs.new.save')}</Button>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={guard.blocked}
        title={t('editor.unsavedTitle')}
        message={t('jobs.new.unsaved')}
        confirmLabel={t('editor.leave')}
        cancelLabel={t('editor.stay')}
        tone="danger"
        onConfirm={guard.leave}
        onCancel={guard.stay}
      />
    </div>
  );
}

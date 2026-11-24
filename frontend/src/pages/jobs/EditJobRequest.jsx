// /job-requests/:id/edit — change an OPEN job request (Module 6, Batch 8B): the description and the same details form
// as step 2 of "Describe a job". PATCH sends `baseVersion` and only the changed fields; a changed description is
// checked again by the server (the new suggestions are shown on the job page after saving). 409 JOB_CHANGED: this
// screen was old -> "Reload". Only when job.actions has "edit" (the server decides).
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, RefreshCw, Save } from 'lucide-react';
import API from '../../api';
import { Alert, Button, ConfirmDialog, EmptyState, PageHeader, useToast } from '../../components/ui';
import HighlightedTextArea from '../../features/skills/HighlightedTextArea';
import { useVoiceTyping } from '../../features/assist/useVoiceTyping';
import JobDetailsForm from '../../features/jobs/JobDetailsForm';
import { checkForm, editBody, formOf } from '../../features/jobs/jobText';
import { useJobOptions } from '../../features/jobs/useJobOptions';
import { pktDay } from '../../features/booking/bookingText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useDocumentTitle, useLanguage } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { formatRupees } from '../../utils/masks';
import styles from '../../features/jobs/Jobs.module.css';

function EditForm({ job, onReload }) {
  const { t, te, info } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const { skills: allSkills } = useTaxonomy();
  const { limits } = useJobOptions();
  const today = pktDay();
  const [text, setText] = useState(job.description);
  const [inputMode, setInputMode] = useState(job.inputMode ?? 'text');
  const [form, setForm] = useState(() => formOf(job, today, formatRupees));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [skillsNote, setSkillsNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null); // { rechecked } after saving
  const skillCategory = (id) => allSkills.find((s) => s.id === id)?.category ?? null;
  const body = editBody({ job, text, inputMode, form, today });
  const dirty = Object.keys(body).length > 1;
  const guard = useUnsavedChanges(dirty && !done);
  useEffect(() => {
    if (done) navigate(`/job-requests/${job._id}`, { state: { saved: true, rechecked: done.rechecked } });
  }, [done, job._id, navigate]);

  const voice = useVoiceTyping({
    speechLang: info.speech,
    onText: (said) => {
      setText((current) => `${current.replace(/\s+$/, '')}${current.trim() ? ' ' : ''}${said}`.slice(0, limits.descriptionMax));
      setInputMode('voice');
    },
  });

  // changing the trade keeps only the skills of the new trade (and says so)
  const setField = (field, value) => {
    let next = field === 'day' ? { ...form, ...value } : { ...form, [field]: value };
    if (field === 'category' && value !== form.category) {
      const kept = form.skills.filter((id) => skillCategory(id) === value);
      if (kept.length !== form.skills.length) setSkillsNote(t('jobs.form.skillsRemoved'));
      next = { ...next, skills: kept };
    }
    setForm(next);
    setErrors(({ [field === 'day' ? 'date' : field]: _fixed, ...rest }) => rest);
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    const found = checkForm(form, today, { savedDate: job.preferredDate, amountMin: limits.amountMin, amountMax: limits.amountMax });
    if ([...text.trim()].length < limits.descriptionMin) found.description = { key: 'jobs.describe.tooShort', params: { min: limits.descriptionMin } };
    setErrors(found);
    if (Object.keys(found).length) return;
    if (!dirty) {
      setError({ code: 'JOB_EDIT_EMPTY' });
      return;
    }
    setSaving(true);
    try {
      await API.patch(`/job-requests/${encodeURIComponent(job._id)}`, body);
      toast.show({ tone: 'success', title: t('jobs.detail.saved') });
      setDone({ rechecked: 'description' in body });
    } catch (err) {
      const fields = apiFieldErrors(err);
      setErrors({ ...fields, date: fields.preferredDate });
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const changed = error?.code === 'JOB_CHANGED';
  return (
    <form className={styles.page} onSubmit={save} noValidate>
      <section className={styles.section} aria-labelledby="edit-words">
        <h2 id="edit-words" className={styles.sectionTitle}>{t('jobs.edit.words')}</h2>
        <HighlightedTextArea label={t('jobs.describe.label')} hint={t('jobs.edit.wordsHint')} maxLength={limits.descriptionMax} rows={4} value={text} assist="jobs.describe" error={errors.description}
          onChange={(e) => { setText(e.target.value); if (!e.target.value.trim()) setInputMode('text'); }} />
        {voice.supported && (
          <div className={styles.voiceRow}>
            <Button variant="secondary" icon={voice.listening ? MicOff : Mic} onClick={voice.listening ? voice.stop : voice.start} aria-pressed={voice.listening}>{voice.listening ? t('voice.stop') : t('jobs.describe.speak')}</Button>
            <span className={styles.muted} aria-live="polite">{voice.listening ? t('voice.listening') : t('voice.recognisedAs', { language: t(`voice.speechLanguages.${info.speech}`) })}</span>
          </div>
        )}
        {/* review finding 10: a microphone problem is said in words, as on Describe a job */}
        {voice.error && <Alert tone="warning">{t(voice.error.key, { language: t(`voice.speechLanguages.${voice.error.params?.speechLang}`) })}</Alert>}
      </section>
      <JobDetailsForm form={form} setField={setField} errors={errors} today={today} limits={limits} skillsNote={skillsNote} />
      {changed ? (
        <Alert tone="warning" title={t('jobs.edit.changed')} action={<Button size="sm" variant="secondary" icon={RefreshCw} onClick={onReload}>{t('jobs.edit.reload')}</Button>}>{t('jobs.edit.changedText')}</Alert>
      ) : error && <Alert tone="danger">{te(error)}</Alert>}
      <div className={styles.actions}>
        <Button to={`/job-requests/${job._id}`} variant="secondary" icon={ArrowLeft}>{t('common.cancel')}</Button>
        <Button type="submit" size="lg" icon={Save} loading={saving}>{t('jobs.edit.save')}</Button>
      </div>
      <ConfirmDialog open={guard.blocked} title={t('editor.unsavedTitle')} message={t('jobs.edit.unsaved')} confirmLabel={t('editor.leave')} cancelLabel={t('editor.stay')} tone="danger" onConfirm={guard.leave} onCancel={guard.stay} />
    </form>
  );
}

export default function EditJobRequest() {
  const { id } = useParams();
  const { t, te } = useLanguage();
  useDocumentTitle(t('jobs.titles.edit'));
  const { data, error, status, loading, reload } = useApiQuery(`/job-requests/${encodeURIComponent(id)}`);
  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) {
    return <EmptyState art="not-found" headingLevel={1} title={t('jobs.detail.notFound')} description={t('jobs.detail.notFoundText')} action={<Button to="/job-requests">{t('jobs.detail.back')}</Button>} />;
  }
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  const job = data.job;
  return (
    <div className={styles.page}>
      <Button to={`/job-requests/${job._id}`} variant="ghost" size="sm" icon={ArrowLeft}>{t('jobs.edit.back')}</Button>
      <PageHeader eyebrow={<span dir="ltr" className="tabular">{job.code}</span>} title={t('jobs.edit.title')} description={t('jobs.edit.lead')} />
      {(job.actions ?? []).includes('edit')
        ? <EditForm key={job.version} job={job} onReload={reload} />
        : <Alert tone="info" action={<Button size="sm" variant="secondary" to={`/job-requests/${job._id}`}>{t('jobs.edit.back')}</Button>}>{te({ code: 'JOB_NOT_EDITABLE' })}</Alert>}
    </div>
  );
}

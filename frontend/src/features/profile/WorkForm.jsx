import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import API from '../../api';
import { Alert, Button, IconButton, Select, TextArea, TextField } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { ALL_PARTS, validateWork, workPayload } from './workForm';
import styles from './ProfileForms.module.css';

const AVAILABILITY = ['Available', 'Busy', 'Offline'];

// Module 1 "Your work". parts: ['work'] trade, experience, rates, availability, bio;
// ['history'] past jobs; both by default (onboarding). Saves only the fields of its parts.
export default function WorkForm({ values, onChange, onSaved, submitLabel, secondary, parts = ALL_PARTS }) {
  const { t, te } = useT();
  const { categories, categoryOccupation, error: taxonomyError } = useTaxonomy();
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  const showWork = parts.includes('work');
  const showHistory = parts.includes('history');

  const chooseCategory = (e) => {
    const category = e.target.value;
    // Helpful default only when the occupation is still empty.
    const occupation = values.occupation.trim() ? values.occupation : categoryOccupation(category);
    onChange({ ...values, category, occupation });
  };
  const setJob = (i, key, value) => onChange({ ...values, workHistory: values.workHistory.map((w, j) => (j === i ? { ...w, [key]: value } : w)) });
  const addJob = () => onChange({ ...values, workHistory: [...values.workHistory, { jobTitle: '', clientOrEmployer: '', duration: '', description: '' }] });
  const removeJob = (i) => onChange({ ...values, workHistory: values.workHistory.filter((_, j) => j !== i) });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateWork(values, parts);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const { data } = await API.put('/workers/me', workPayload(values, parts));
      onSaved(data);
    } catch (err) {
      setErrors(apiFieldErrors(err));
      setFormError(apiError(err, 'about.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      {formError && <Alert tone="danger">{te(formError)}</Alert>}
      {showWork && taxonomyError && <Alert tone="danger">{te(taxonomyError)}</Alert>}
      {showWork && (
        <>
          <div className={styles.grid}>
            <Select
              label={t('work.trade')}
              required
              placeholder={t('work.tradePlaceholder')}
              options={categories.map((c) => ({ value: c.id, label: c.label }))}
              value={values.category}
              onChange={chooseCategory}
              error={errors.category}
            />
            <TextField label={t('work.occupation')} required placeholder={t('work.occupationPlaceholder')} value={values.occupation} onChange={set('occupation')} error={errors.occupation} urdu />
            <TextField label={t('work.experience')} required inputMode="numeric" dir="ltr" placeholder="5" value={values.experienceYears} onChange={set('experienceYears')} error={errors.experienceYears} hint={t('work.experienceHint')} />
            <Select
              label={t('work.availability')}
              options={AVAILABILITY.map((a) => ({ value: a, label: t(`status.availability.${a}`) }))}
              value={values.availability}
              onChange={set('availability')}
              error={errors.availability}
            />
            <TextField label={t('work.hourly')} inputMode="decimal" dir="ltr" placeholder="800" value={values.hourlyRate} onChange={set('hourlyRate')} error={errors.hourlyRate} />
            <TextField label={t('work.daily')} inputMode="decimal" dir="ltr" placeholder="4000" value={values.dailyRate} onChange={set('dailyRate')} error={errors.dailyRate} hint={t('work.dailyHint')} />
          </div>
          <TextArea label={t('work.bio')} maxLength={500} rows={3} value={values.bio} onChange={set('bio')} error={errors.bio} placeholder={t('work.bioPlaceholder')} urdu />
        </>
      )}

      {showHistory && (
        <fieldset className={styles.jobs}>
          <legend className={styles.legend}>{t('work.historyLegend')}</legend>
          {values.workHistory.map((w, i) => (
            <div key={i} className={styles.job}>
              <div className={styles.jobHead}>
                <span className={styles.jobNumber}>{t('work.job', { n: i + 1 })}</span>
                <IconButton label={t('work.removeJob', { n: i + 1 })} icon={Trash2} size="sm" onClick={() => removeJob(i)} />
              </div>
              <div className={styles.grid}>
                <TextField label={t('work.jobTitle')} required value={w.jobTitle} onChange={(e) => setJob(i, 'jobTitle', e.target.value)} error={errors[`job${i}`]} urdu />
                <TextField label={t('work.client')} value={w.clientOrEmployer} onChange={(e) => setJob(i, 'clientOrEmployer', e.target.value)} hint={t('work.clientHint')} urdu />
                <TextField label={t('work.duration')} placeholder={t('work.durationPlaceholder')} value={w.duration} onChange={(e) => setJob(i, 'duration', e.target.value)} urdu />
                <TextField label={t('work.whatYouDid')} value={w.description} onChange={(e) => setJob(i, 'description', e.target.value)} urdu />
              </div>
            </div>
          ))}
          {values.workHistory.length < 20 && (
            <Button variant="secondary" size="sm" icon={Plus} onClick={addJob}>{t('work.addJob')}</Button>
          )}
        </fieldset>
      )}

      <div className={styles.actions}>
        {secondary}
        <Button type="submit" loading={saving}>{submitLabel ?? t('common.save')}</Button>
      </div>
    </form>
  );
}

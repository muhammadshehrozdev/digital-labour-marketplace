import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import API from '../../api';
import { Alert, Button, IconButton, Select, TextArea, TextField } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiFieldErrors, apiMessage } from '../../utils/apiErrors';
import { validateWork, workPayload } from './workForm';
import styles from './ProfileForms.module.css';

// Module 1 "Your work": trade, experience, rates, availability, bio, past work.
export default function WorkForm({ values, onChange, onSaved, submitLabel = 'Save', secondary }) {
  const { categories, categoryOccupation, error: taxonomyError } = useTaxonomy();
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

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
    const found = validateWork(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const { data } = await API.put('/workers/me', workPayload(values));
      onSaved(data);
    } catch (err) {
      setErrors(apiFieldErrors(err));
      setFormError(apiMessage(err, 'Could not save. Please check the fields.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      {formError && <Alert tone="danger">{formError}</Alert>}
      {taxonomyError && <Alert tone="danger">{taxonomyError}</Alert>}
      <div className={styles.grid}>
        <Select
          label="Main trade"
          required
          placeholder="Choose a trade"
          options={categories.map((c) => ({ value: c.id, label: c.label }))}
          value={values.category}
          onChange={chooseCategory}
          error={errors.category}
        />
        <TextField label="Occupation" required placeholder="Electrician" value={values.occupation} onChange={set('occupation')} error={errors.occupation} urdu />
        <TextField label="Years of experience" required inputMode="numeric" placeholder="5" value={values.experienceYears} onChange={set('experienceYears')} error={errors.experienceYears} hint="Whole years. Write 0 if you are new." />
        <Select
          label="Availability"
          options={['Available', 'Busy', 'Offline'].map((a) => ({ value: a, label: a }))}
          value={values.availability}
          onChange={set('availability')}
          error={errors.availability}
        />
        <TextField label="Rate per hour (PKR)" inputMode="decimal" placeholder="800" value={values.hourlyRate} onChange={set('hourlyRate')} error={errors.hourlyRate} />
        <TextField label="Rate per day (PKR)" inputMode="decimal" placeholder="4000" value={values.dailyRate} onChange={set('dailyRate')} error={errors.dailyRate} hint="Give at least one rate." />
      </div>
      <TextArea label="Short bio" maxLength={500} rows={3} value={values.bio} onChange={set('bio')} error={errors.bio} placeholder="What kind of work do you do best?" urdu />

      <fieldset className={styles.jobs}>
        <legend className={styles.legend}>Past work (optional)</legend>
        {values.workHistory.map((w, i) => (
          <div key={i} className={styles.job}>
            <div className={styles.jobHead}>
              <span className={styles.jobNumber}>Job {i + 1}</span>
              <IconButton label={`Remove job ${i + 1}`} icon={Trash2} size="sm" onClick={() => removeJob(i)} />
            </div>
            <div className={styles.grid}>
              <TextField label="Job title" required value={w.jobTitle} onChange={(e) => setJob(i, 'jobTitle', e.target.value)} error={errors[`job${i}`]} urdu />
              <TextField label="Client or place" value={w.clientOrEmployer} onChange={(e) => setJob(i, 'clientOrEmployer', e.target.value)} hint="Not shown to customers." urdu />
              <TextField label="Duration" placeholder="2 weeks" value={w.duration} onChange={(e) => setJob(i, 'duration', e.target.value)} urdu />
              <TextField label="What you did" value={w.description} onChange={(e) => setJob(i, 'description', e.target.value)} urdu />
            </div>
          </div>
        ))}
        {values.workHistory.length < 20 && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={addJob}>Add a past job</Button>
        )}
      </fieldset>

      <div className={styles.actions}>
        {secondary}
        <Button type="submit" loading={saving}>{submitLabel}</Button>
      </div>
    </form>
  );
}

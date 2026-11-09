import { useState } from 'react';
import { Upload } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Checkbox, FileUpload, ProgressBar, RadioCardGroup, Select, TextField } from '../../components/ui';
import { apiMessage } from '../../utils/apiErrors';
import { CONSENT_TEXT, TYPE_OPTIONS } from './evidenceText';
import styles from './Evidence.module.css';

// Upload one proof photo for one of the worker's skills (Module 3).
// skills: [{ skillId, name }]. onUploaded({ evidence, skill }) is called after a 201.
export default function EvidenceUploadForm({ skills, defaultSkillId = '', onUploaded, submitLabel = 'Upload proof' }) {
  const [skillId, setSkillId] = useState(defaultSkillId || (skills.length === 1 ? skills[0].skillId : ''));
  const [type, setType] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [progress, setProgress] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!skillId) found.skillId = 'Choose the skill this photo proves.';
    if (!type) found.type = 'Choose the kind of proof.';
    if (!file) found.file = 'Please choose a photo to upload.';
    if (!consent) found.consent = 'Please tick the consent box before uploading.';
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    const form = new FormData();
    form.append('skillId', skillId);
    form.append('type', type);
    if (title.trim()) form.append('title', title.trim());
    form.append('consent', 'true');
    form.append('image', file);
    setProgress(0);
    try {
      const { data } = await API.post('/evidence', form, {
        timeout: 120000,
        onUploadProgress: (ev) => ev.total && setProgress(Math.round((ev.loaded / ev.total) * 100)),
      });
      setFile(null);
      setTitle('');
      setConsent(false);
      setType('');
      onUploaded(data);
    } catch (err) {
      setFormError(apiMessage(err, 'The upload did not work. Please try again.'));
    } finally {
      setProgress(null);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.form} aria-label="Upload proof">
      {formError && <Alert tone="danger">{formError}</Alert>}
      <Select
        label="Which skill does this photo prove?"
        required
        placeholder="Choose a skill"
        options={skills.map((s) => ({ value: s.skillId, label: s.name }))}
        value={skillId}
        onChange={(e) => setSkillId(e.target.value)}
        error={errors.skillId}
      />
      <RadioCardGroup legend="Kind of proof" name="evidence-type" value={type} onChange={setType} options={TYPE_OPTIONS} error={errors.type} />
      <FileUpload label="Photo" required value={file} onChange={setFile} error={errors.file} hint="Your photo is checked by an admin. Location data inside the photo is removed." />
      <TextField label="Short title (optional)" maxLength={80} placeholder="e.g. Wiring of a new house in G-10" value={title} onChange={(e) => setTitle(e.target.value)} urdu />
      <div>
        <Checkbox label={CONSENT_TEXT} checked={consent} onChange={setConsent} aria-invalid={errors.consent ? true : undefined} />
        {errors.consent && <p className={styles.error} role="alert">{errors.consent}</p>}
      </div>
      {progress !== null && <ProgressBar value={progress} label="Uploading" />}
      <Button type="submit" icon={Upload} loading={progress !== null}>{submitLabel}</Button>
    </form>
  );
}

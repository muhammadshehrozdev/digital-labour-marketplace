import { useState } from 'react';
import { Upload } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Checkbox, FileUpload, ProgressBar, RadioCardGroup, Select, TextField } from '../../components/ui';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import { EVIDENCE_TYPES } from './evidenceText';
import styles from './Evidence.module.css';

// Upload one proof photo for one of the worker's skills (Module 3).
// skills: [{ skillId, name }]. onUploaded({ evidence, skill }) is called after a 201.
export default function EvidenceUploadForm({ skills, defaultSkillId = '', onUploaded, submitLabel }) {
  const { t, te } = useT();
  const { skillName } = useTaxonomy();
  const [skillId, setSkillId] = useState(defaultSkillId || (skills.length === 1 ? skills[0].skillId : ''));
  const [type, setType] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [progress, setProgress] = useState(null);

  const typeOptions = EVIDENCE_TYPES.map(({ value, icon }) => ({
    value, icon, title: t(`evidence.types.${value}.title`), description: t(`evidence.types.${value}.description`),
  }));

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!skillId) found.skillId = 'validation.proofSkill';
    if (!type) found.type = 'validation.proofType';
    if (!file) found.file = 'validation.proofFile';
    if (!consent) found.consent = 'validation.proofConsent';
    setErrors(found);
    setFormError(null);
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
      setFormError(apiError(err, 'evidence.form.failed'));
    } finally {
      setProgress(null);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.form} aria-label={t('evidence.form.label')}>
      {formError && <Alert tone="danger">{te(formError)}</Alert>}
      <Select
        label={t('evidence.form.skill')}
        required
        placeholder={t('evidence.form.skillPlaceholder')}
        options={skills.map((s) => ({ value: s.skillId, label: skillName(s) }))}
        value={skillId}
        onChange={(e) => setSkillId(e.target.value)}
        error={errors.skillId}
      />
      <RadioCardGroup legend={t('evidence.form.kind')} name="evidence-type" value={type} onChange={setType} options={typeOptions} error={errors.type} />
      <FileUpload label={t('evidence.form.photo')} required value={file} onChange={setFile} error={errors.file} hint={t('evidence.form.photoHint')} />
      <TextField label={t('evidence.form.title')} maxLength={80} placeholder={t('evidence.form.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} urdu />
      <div>
        <Checkbox label={t('evidence.consent')} checked={consent} onChange={setConsent} aria-invalid={errors.consent ? true : undefined} />
        {errors.consent && <p className={styles.error} role="alert">{t(errors.consent)}</p>}
      </div>
      {progress !== null && <ProgressBar value={progress} label={t('evidence.form.uploading')} />}
      <Button type="submit" icon={Upload} loading={progress !== null}>{submitLabel ?? t('evidence.form.submit')}</Button>
    </form>
  );
}

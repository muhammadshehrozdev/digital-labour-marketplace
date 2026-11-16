import { useRef, useState } from 'react';
import { Camera, Tag, Upload, X } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Checkbox, FileUpload, ProgressBar, RadioCardGroup, TextField } from '../../components/ui';
import { TradeArt } from '../../components/illustrations';
import FieldAssist from '../assist/FieldAssist';
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
  const controller = useRef(null); // to cancel a running upload (feature 16)

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
    controller.current = new AbortController();
    try {
      const { data } = await API.post('/evidence', form, {
        timeout: 120000,
        signal: controller.current.signal,
        onUploadProgress: (ev) => ev.total && setProgress(Math.round((ev.loaded / ev.total) * 100)),
      });
      setFile(null);
      setTitle('');
      setConsent(false);
      setType('');
      onUploaded(data);
    } catch (err) {
      // cancelled by the worker: say so calmly; the server saved nothing (the request never finished)
      setFormError(err?.code === 'ERR_CANCELED' ? 'workerx.upload.cancelled' : apiError(err, 'evidence.form.failed'));
    } finally {
      controller.current = null;
      setProgress(null);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.form} aria-label={t('evidence.form.label')}>
      {formError && <Alert tone="danger">{te(formError)}</Alert>}
      {/* Batch 5: the skill is chosen by picture (the drawing of its trade); each card can be heard */}
      <RadioCardGroup
        legend={<>{t('evidence.form.skill')}<span className={styles.required}><span aria-hidden="true"> *</span><span className="visually-hidden"> {t('common.required')}</span></span></>}
        name="evidence-skill"
        layout="tiles"
        options={skills.map((s) => ({
          value: s.skillId, title: skillName(s), art: <TradeArt category={s.category} size={48} />,
          listenKey: 'help.option.proofSkill', listenParams: { name: skillName(s) },
        }))}
        value={skillId}
        onChange={setSkillId}
        error={errors.skillId}
        assist="evidence.skill"
      />
      <RadioCardGroup legend={t('evidence.form.kind')} name="evidence-type" value={type} onChange={setType} options={typeOptions} error={errors.type} assist="evidence.kind" listen="evidenceType" />
      <FileUpload
        label={t('evidence.form.photo')}
        required
        editable
        value={file}
        onChange={setFile}
        error={errors.file}
        hint={t('evidence.form.photoHint')}
        assist="evidence.photo"
        tip={<><strong><Camera size={16} aria-hidden="true" /> {t('workerx.upload.tipTitle')}</strong><span>{t('workerx.upload.tip')}</span></>}
      />
      <TextField label={t('evidence.form.title')} maxLength={80} placeholder={t('evidence.form.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} urdu icon={Tag} assist="evidence.title" />
      <div>
        <Checkbox label={t('evidence.consent')} checked={consent} onChange={setConsent} aria-invalid={errors.consent ? true : undefined} />
        <FieldAssist helpKey="evidence.consent" label={t('assist.consentShort')} />
        {errors.consent && <p className={styles.error} role="alert">{t(errors.consent)}</p>}
      </div>
      {progress !== null && (
        <div className={styles.progress}>
          <ProgressBar value={progress} label={t('evidence.form.uploading')} />
          <Button size="sm" variant="secondary" icon={X} onClick={() => controller.current?.abort()}>{t('workerx.upload.cancel')}</Button>
        </div>
      )}
      <Button type="submit" icon={Upload} loading={progress !== null}>{submitLabel ?? t('evidence.form.submit')}</Button>
    </form>
  );
}

import { useState } from 'react';
import API from '../../api';
import { Alert, Button, TextField } from '../../components/ui';
import { useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { aboutPayload, validateAbout } from './aboutForm';
import styles from './ProfileForms.module.css';

// Module 1 "About you": personal and contact details. Saves to PUT /api/workers/me.
export default function AboutForm({ values, onChange, cnicOnFile, onSaved, submitLabel, secondary }) {
  const { t, te } = useT();
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateAbout(values);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const { data } = await API.put('/workers/me', aboutPayload(values));
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
      <div className={styles.grid}>
        <TextField label={t('about.fullName')} required autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} urdu />
        <TextField label={t('about.phone')} required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="0300 1234567" value={values.phone} onChange={set('phone')} error={errors.phone} hint={t('about.phoneHint')} />
        <TextField label={t('about.whatsapp')} type="tel" inputMode="tel" dir="ltr" placeholder="0300 1234567" value={values.whatsappNumber} onChange={set('whatsappNumber')} error={errors.whatsappNumber} />
        <TextField
          label={t('about.cnic')}
          inputMode="numeric"
          autoComplete="off"
          dir="ltr"
          placeholder={cnicOnFile ? t('about.cnicSavedPlaceholder') : '12345-1234567-1'}
          value={values.cnicNumber}
          onChange={set('cnicNumber')}
          error={errors.cnicNumber}
          hint={t('about.cnicHint')}
        />
        <TextField label={t('about.city')} required autoComplete="address-level2" placeholder={t('about.cityPlaceholder')} value={values.city} onChange={set('city')} error={errors.city} urdu />
        <TextField label={t('about.area')} placeholder={t('about.areaPlaceholder')} value={values.address} onChange={set('address')} error={errors.address} hint={t('about.areaHint')} urdu />
        <TextField label={t('about.emergency')} placeholder={t('about.emergencyPlaceholder')} value={values.emergencyContact} onChange={set('emergencyContact')} error={errors.emergencyContact} urdu />
        <TextField label={t('about.languages')} placeholder={t('about.languagesPlaceholder')} value={values.languages} onChange={set('languages')} error={errors.languages} hint={t('about.languagesHint')} />
      </div>
      <div className={styles.actions}>
        {secondary}
        <Button type="submit" loading={saving}>{submitLabel ?? t('common.save')}</Button>
      </div>
    </form>
  );
}

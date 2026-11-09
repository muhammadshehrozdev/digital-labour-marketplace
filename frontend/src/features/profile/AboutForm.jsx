import { useState } from 'react';
import API from '../../api';
import { Alert, Button, TextField } from '../../components/ui';
import { apiFieldErrors, apiMessage } from '../../utils/apiErrors';
import { aboutPayload, validateAbout } from './aboutForm';
import styles from './ProfileForms.module.css';

// Module 1 "About you": personal and contact details. Saves to PUT /api/workers/me.
export default function AboutForm({ values, onChange, cnicOnFile, onSaved, submitLabel = 'Save', secondary }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateAbout(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const { data } = await API.put('/workers/me', aboutPayload(values));
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
      <div className={styles.grid}>
        <TextField label="Full name" required autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} urdu />
        <TextField label="Phone number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" value={values.phone} onChange={set('phone')} error={errors.phone} hint="Customers do not see your number." />
        <TextField label="WhatsApp number" type="tel" inputMode="tel" placeholder="0300 1234567" value={values.whatsappNumber} onChange={set('whatsappNumber')} error={errors.whatsappNumber} />
        <TextField
          label="CNIC number"
          inputMode="numeric"
          autoComplete="off"
          placeholder={cnicOnFile ? 'Saved (hidden). Type only to change it' : '12345-1234567-1'}
          value={values.cnicNumber}
          onChange={set('cnicNumber')}
          error={errors.cnicNumber}
          hint="Only verified admins can see your CNIC. It is stored encrypted."
        />
        <TextField label="City" required autoComplete="address-level2" placeholder="Rawalpindi" value={values.city} onChange={set('city')} error={errors.city} urdu />
        <TextField label="Area" placeholder="Satellite Town" value={values.address} onChange={set('address')} error={errors.address} hint="Private. Only you and admins see it." urdu />
        <TextField label="Emergency contact" placeholder="Brother Ahmed, 0300 1234567" value={values.emergencyContact} onChange={set('emergencyContact')} error={errors.emergencyContact} urdu />
        <TextField label="Languages you speak" placeholder="Urdu, Punjabi" value={values.languages} onChange={set('languages')} error={errors.languages} hint="Separate with commas." />
      </div>
      <div className={styles.actions}>
        {secondary}
        <Button type="submit" loading={saving}>{submitLabel}</Button>
      </div>
    </form>
  );
}

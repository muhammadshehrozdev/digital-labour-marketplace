import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, PasswordField, RadioCardGroup, TextField } from '../../components/ui';
import { WorkerArt, CustomerArt } from '../../components/brand/RoleArt';
import { useAuth } from '../../context/auth';
import { useDocumentTitle, useLanguage } from '../../i18n';
import { passwordProblem } from '../../utils/password';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import AuthLayout from './AuthLayout';
import styles from './AuthCard.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();
  const { t, te, lang, chosen } = useLanguage();
  useDocumentTitle(t('titles.register'));
  const initialRole = ['worker', 'customer'].includes(params.get('role')) ? params.get('role') : '';
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // There is no admin option anywhere: admins are created only with `npm run create-admin` (M1-1).
  const roles = [
    { value: 'worker', title: t('auth.register.workerTitle'), description: t('auth.register.workerText'), art: <WorkerArt /> },
    { value: 'customer', title: t('auth.register.customerTitle'), description: t('auth.register.customerText'), art: <CustomerArt /> },
  ];

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'validation.name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = 'validation.email';
    if (!/^(\+92|0092|0)3\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) found.phone = 'validation.phone';
    const pw = passwordProblem(form.password);
    if (pw) found.password = pw;
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      const body = { ...form, name: form.name.trim(), email: form.email.trim(), role };
      if (chosen) body.preferredLanguage = lang; // the language chosen before registering is saved from the start
      const user = await register(body);
      navigate(user.role === 'worker' ? '/onboarding/about' : '/find');
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (err.response?.status === 409) fields.email = apiError(err);
      setErrors(fields);
      setFormError(Object.keys(fields).length ? null : apiError(err, 'auth.register.failed'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout art="step-skills">
      <div className={styles.head}>
        <h1>{t('auth.register.title')}</h1>
        <p>{t('auth.register.lead')}</p>
      </div>
      <RadioCardGroup legend={t('auth.register.legend')} name="role" value={role} onChange={setRole} options={roles} columns={2} />
      {role && (
        <form onSubmit={submit} noValidate className={styles.form}>
          {formError && <Alert tone="danger">{te(formError)}</Alert>}
          <TextField label={t('auth.register.fullName')} required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} urdu />
          <TextField label={t('auth.register.email')} required type="email" autoComplete="email" dir="ltr" value={form.email} onChange={set('email')} error={errors.email} />
          <TextField label={t('auth.register.mobile')} required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="0300 1234567" value={form.phone} onChange={set('phone')} error={errors.phone} hint={role === 'worker' ? t('auth.register.phoneHintWorker') : undefined} />
          <PasswordField required autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
          <Button type="submit" fullWidth loading={loading}>{t('auth.register.submit')}</Button>
        </form>
      )}
      <p className={styles.foot}>
        {t('auth.register.haveAccount')} <Link to="/login">{t('auth.register.login')}</Link>
      </p>
    </AuthLayout>
  );
}

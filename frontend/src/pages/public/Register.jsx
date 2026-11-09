import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Hammer } from 'lucide-react';
import { Alert, Button, Card, PasswordField, RadioCardGroup, TextField } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { passwordProblem } from '../../utils/password';
import { apiFieldErrors, apiMessage } from '../../utils/apiErrors';
import styles from './AuthCard.module.css';

// There is no admin option anywhere: admins are created only with `npm run create-admin` (M1-1).
const ROLES = [
  { value: 'worker', title: 'I want to find work', description: 'Make a profile so customers can find you.', icon: Hammer },
  { value: 'customer', title: 'I want to hire a worker', description: 'Search for workers and compare them.', icon: Briefcase },
];

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();
  const initialRole = ['worker', 'customer'].includes(params.get('role')) ? params.get('role') : '';
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Please write your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = 'Please write a valid email address.';
    if (!/^(\+92|0092|0)3\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) found.phone = 'Phone must be a Pakistani mobile number like 0300 1234567.';
    const pw = passwordProblem(form.password);
    if (pw) found.password = pw;
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      const user = await register({ ...form, name: form.name.trim(), email: form.email.trim(), role });
      navigate(user.role === 'worker' ? '/onboarding/about' : '/find');
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (err.response?.status === 409) fields.email = apiMessage(err);
      setErrors(fields);
      setFormError(Object.keys(fields).length ? '' : apiMessage(err, 'Could not create the account.'));
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} padding="lg">
        <div className={styles.head}>
          <h1>Create your account</h1>
          <p>First, tell us what you want to do.</p>
        </div>
        <RadioCardGroup legend="I am here because…" name="role" value={role} onChange={setRole} options={ROLES} />
        {role && (
          <form onSubmit={submit} noValidate className={styles.form}>
            {formError && <Alert tone="danger">{formError}</Alert>}
            <TextField label="Full name" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} urdu />
            <TextField label="Email" required type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
            <TextField label="Mobile number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" value={form.phone} onChange={set('phone')} error={errors.phone} hint={role === 'worker' ? 'Not shown in search results.' : undefined} />
            <PasswordField required autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
            <Button type="submit" fullWidth loading={loading}>Create account</Button>
          </form>
        )}
        <p className={styles.foot}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}

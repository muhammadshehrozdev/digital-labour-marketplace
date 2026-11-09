import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, PasswordField, TextField } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { useDocumentTitle, useT } from '../../i18n';
import { homePathFor } from '../../utils/roles';
import { apiError } from '../../utils/apiErrors';
import AuthLayout from './AuthLayout';
import styles from './AuthCard.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { t, te } = useT();
  useDocumentTitle(t('titles.login'));
  const { login, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('auth.login.missing');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(homePathFor(user.role));
    } catch (err) {
      setError(apiError(err));
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.head}>
        <h1>{t('auth.login.title')}</h1>
        <p>{t('auth.login.welcome')}</p>
      </div>
      {notice && !error && <Alert tone="info">{t(notice)}</Alert>}
      {error && <Alert tone="danger">{te(error)}</Alert>}
      <form onSubmit={submit} noValidate className={styles.form}>
        <TextField label={t('auth.login.email')} type="email" autoComplete="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField hint={null} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" fullWidth loading={loading}>{t('auth.login.submit')}</Button>
      </form>
      <p className={styles.foot}>
        {t('auth.login.newHere')} <Link to="/register">{t('auth.login.createAccount')}</Link>
      </p>
    </AuthLayout>
  );
}

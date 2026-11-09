import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, PasswordField, TextField } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { homePathFor } from '../../utils/roles';
import { apiMessage } from '../../utils/apiErrors';
import styles from './AuthCard.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(homePathFor(user.role));
    } catch (err) {
      setError(apiMessage(err, 'Email or password is incorrect.'));
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} padding="lg">
        <div className={styles.head}>
          <h1>Log in</h1>
          <p>Welcome back.</p>
        </div>
        {notice && !error && <Alert tone="info">{notice}</Alert>}
        {error && <Alert tone="danger">{error}</Alert>}
        <form onSubmit={submit} noValidate className={styles.form}>
          <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordField label="Password" hint={null} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth loading={loading}>Log in</Button>
        </form>
        <p className={styles.foot}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}

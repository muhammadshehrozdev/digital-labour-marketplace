// Holds the logged-in user for the whole app. On start it asks the server who is logged
// in (GET /api/auth/me) — the login itself lives in an HttpOnly cookie the page cannot read.
// Note: this is for display only. The server checks the role on every request.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setUnauthorizedHandler } from '../api';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // A message for the Login page, e.g. "Your session has ended".
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    API.get('/auth/me')
      .then(({ data }) => active && setUser(data))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Session expired or ended on the server -> back to login with a message.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setNotice('Your session has ended. Please log in again.');
      setUser(null);
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setNotice('');
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (form) => {
    const { data } = await API.post('/auth/register', form);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((changes) => setUser((u) => (u ? { ...u, ...changes } : u)), []);

  const value = useMemo(
    () => ({ user, loading, notice, login, register, logout, updateUser }),
    [user, loading, notice, login, register, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

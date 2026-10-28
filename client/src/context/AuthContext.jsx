import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saat app dimuat: jika ada token, ambil profil
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        setCompany(res.data.company);
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setCompany(res.data.company);
    return res.data;
  }

  async function registerCompany(payload) {
    const res = await api.post('/auth/register-company', payload);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setCompany(res.data.company);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setCompany(null);
  }

  return (
    <AuthContext.Provider value={{ user, company, tenantId: user?.tenantId, loading, login, registerCompany, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}

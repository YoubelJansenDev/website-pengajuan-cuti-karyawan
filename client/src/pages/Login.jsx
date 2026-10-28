import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.user.role === 'admin' ? '/admin' : '/leaves');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal login');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div className="card" style={{ width: 380 }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'var(--blue)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 14,
            }}
          >
            L
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>LeaveFlow</h1>
          <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>
            Masuk untuk mengelola cuti karyawan
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@perusahaan.com"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--gray)', textAlign: 'center', marginTop: 20 }}>
          Perusahaan belum terdaftar?{' '}
          <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

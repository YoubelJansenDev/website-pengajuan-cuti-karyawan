import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterCompany() {
  const { registerCompany } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    plan: 'free',
    adminName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await registerCompany(form);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftar');
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
      <div className="card" style={{ width: 420 }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Daftarkan Perusahaan</h1>
          <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>
            Anda akan menjadi Admin (HR) perusahaan
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Nama Perusahaan</label>
            <input
              className="input"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="PT Maju Jaya"
              required
            />
          </div>
          <div>
            <label className="label">Paket Langganan</label>
            <select
              className="input"
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div>
            <label className="label">Nama Admin (Anda)</label>
            <input
              className="input"
              value={form.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              placeholder="Budi Santoso"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="hr@majujaya.com"
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
              placeholder="Minimal 6 karakter"
              required
            />
          </div>
          <button className="btn btn-dark" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Mendaftarkan…' : 'Daftar Perusahaan'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--gray)', textAlign: 'center', marginTop: 20 }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

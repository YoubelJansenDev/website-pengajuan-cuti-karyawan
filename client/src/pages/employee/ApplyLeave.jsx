import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ApplyLeave() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const days =
    form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate)
      ? Math.floor((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1
      : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/leaves', form);
      navigate('/leaves');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan cuti');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 className="page-title">Ajukan Cuti</h1>
      <p className="page-sub">
        Sisa jatah Anda: <strong style={{ color: 'var(--blue)' }}>{user?.leaveBalance ?? 0} hari</strong>
      </p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Tanggal Mulai</label>
          <input
            className="input"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Tanggal Selesai</label>
          <input
            className="input"
            type="date"
            value={form.endDate}
            min={form.startDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Alasan Cuti</label>
          <textarea
            className="input"
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Contoh: Acara keluarga di luar kota"
            required
          />
        </div>

        {days > 0 && (
          <div style={{ fontSize: 13, color: 'var(--gray)', background: 'var(--blue-soft)', padding: '8px 12px', borderRadius: 8 }}>
            Total: <strong style={{ color: 'var(--blue-dark)' }}>{days} hari</strong>
            {days > (user?.leaveBalance ?? 0) && (
              <span style={{ color: '#b91c1c' }}> — melebihi sisa jatah Anda!</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" type="submit" disabled={busy || days > (user?.leaveBalance ?? 0)}>
            {busy ? 'Mengirim…' : 'Kirim Pengajuan'}
          </button>
          <button className="btn btn-outline" type="button" onClick={() => navigate('/leaves')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

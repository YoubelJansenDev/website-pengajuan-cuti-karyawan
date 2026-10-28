import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Employees() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', leaveBalance: 12 });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.get('/users');
    setUsers(res.data.users);
  }

  useEffect(() => { load().catch(() => {}); }, []);

  async function handleInvite(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/users/invite', form);
      setForm({ name: '', email: '', password: '', leaveBalance: 12 });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah karyawan');
    } finally {
      setBusy(false);
    }
  }

  async function updateBalance(id, value) {
    try {
      await api.patch(`/users/${id}/balance`, { leaveBalance: value });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui');
    }
  }

  async function removeUser(id, name) {
    if (!confirm(`Hapus karyawan "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Karyawan</h1>
          <p className="page-sub">Kelola akun karyawan dan jatah cuti mereka</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '+ Tambah Karyawan'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          {error && <div className="alert-error">{error}</div>}
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="label">Nama</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div style={{ width: 110 }}>
              <label className="label">Jatah (hari)</label>
              <input className="input" type="number" min="0" value={form.leaveBalance} onChange={(e) => setForm({ ...form, leaveBalance: e.target.value })} />
            </div>
            <button className="btn btn-dark" type="submit" disabled={busy}>
              {busy ? 'Menyimpan…' : 'Undang'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Jatah Cuti</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-pending' : 'badge-approved'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Karyawan'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => updateBalance(u.id, Math.max(0, u.leaveBalance - 1))}>−</button>
                    <span style={{ fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{u.leaveBalance}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => updateBalance(u.id, u.leaveBalance + 1)}>+</button>
                  </div>
                </td>
                <td>
                  {u.role === 'employee' && (
                    <button className="btn btn-outline btn-sm" onClick={() => removeUser(u.id, u.name)}>
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

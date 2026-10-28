import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusLabel = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };

export default function AdminDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(status = filter) {
    setLoading(true);
    try {
      const res = await api.get('/leaves', { params: status ? { status } : {} });
      setLeaves(res.data.leaves);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function review(id, action) {
    try {
      await api.patch(`/leaves/${id}/${action}`);
      load(filter);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses');
    }
  }

  const counts = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  return (
    <div>
      <h1 className="page-title">Pengajuan Cuti</h1>
      <p className="page-sub">Semua pengajuan cuti karyawan di perusahaan Anda</p>

      {error && <div className="alert-error">{error}</div>}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { v: '', l: `Semua (${leaves.length})` },
          { v: 'pending', l: `Menunggu (${counts.pending})` },
          { v: 'approved', l: `Disetujui (${counts.approved})` },
          { v: 'rejected', l: `Ditolak (${counts.rejected})` },
        ].map((f) => (
          <button
            key={f.v}
            className={`btn btn-sm ${filter === f.v ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => { setFilter(f.v); load(f.v); }}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray)' }}>Memuat…</div>
        ) : leaves.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray)' }}>
            Belum ada pengajuan cuti
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Tanggal</th>
                <th>Hari</th>
                <th>Alasan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray)' }}>{l.user?.email}</div>
                  </td>
                  <td>
                    {new Date(l.startDate).toLocaleDateString('id-ID')} –{' '}
                    {new Date(l.endDate).toLocaleDateString('id-ID')}
                  </td>
                  <td>{l.totalDays}</td>
                  <td style={{ maxWidth: 200 }}>{l.reason}</td>
                  <td><span className={`badge badge-${l.status}`}>{statusLabel[l.status]}</span></td>
                  <td>
                    {l.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => review(l.id, 'approve')}>
                          Setujui
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => review(l.id, 'reject')}>
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--gray)' }}>
                        oleh {l.reviewer?.name || '-'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

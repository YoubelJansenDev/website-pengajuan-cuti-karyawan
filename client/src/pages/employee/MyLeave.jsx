import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

const statusLabel = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };

export default function MyLeave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/leaves/mine')
      .then((res) => setLeaves(res.data.leaves))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Cuti Saya</h1>
          <p className="page-sub">Riwayat pengajuan cuti Anda</p>
        </div>
        <Link className="btn btn-primary" to="/leaves/apply">+ Ajukan Cuti</Link>
      </div>

      {/* Kartu sisa jatah */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, background: 'var(--blue-soft)', borderColor: 'transparent' }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--black)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>
          {user?.leaveBalance ?? 0}
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>Sisa Jatah Cuti</div>
          <div style={{ fontSize: 13, color: 'var(--gray)' }}>hari kerja tersisa tahun ini</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray)' }}>Memuat…</div>
        ) : leaves.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray)' }}>
            Belum ada pengajuan. <Link to="/leaves/apply" style={{ color: 'var(--blue)', fontWeight: 600 }}>Ajukan cuti pertama Anda</Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Hari</th>
                <th>Alasan</th>
                <th>Status</th>
                <th>Direview oleh</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>
                    {new Date(l.startDate).toLocaleDateString('id-ID')} –{' '}
                    {new Date(l.endDate).toLocaleDateString('id-ID')}
                  </td>
                  <td>{l.totalDays}</td>
                  <td style={{ maxWidth: 240 }}>{l.reason}</td>
                  <td><span className={`badge badge-${l.status}`}>{statusLabel[l.status]}</span></td>
                  <td>{l.reviewer?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

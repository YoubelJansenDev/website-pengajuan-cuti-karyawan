import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navAdmin = [
  { to: '/admin', label: 'Pengajuan Cuti', end: true },
  { to: '/admin/employees', label: 'Karyawan' },
];

const navEmployee = [
  { to: '/leaves', label: 'Cuti Saya', end: true },
  { to: '/leaves/apply', label: 'Ajukan Cuti' },
];

export default function Layout({ children }) {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user.role === 'admin' ? navAdmin : navEmployee;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          borderRight: '1px solid var(--border)',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div>
          {/* Logo & nama perusahaan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--black)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {(company?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{company?.name || 'Perusahaan'}</div>
              <div style={{ fontSize: 11, color: 'var(--gray)', textTransform: 'capitalize' }}>
                Paket {company?.subscriptionPlan || 'free'}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'block',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                background: isActive ? 'var(--blue-soft)' : 'transparent',
                color: isActive ? 'var(--blue-dark)' : 'var(--black)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, padding: '0 8px 8px' }}>{user.name}</div>
          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      {/* Konten */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1100 }}>
        {children}
      </main>
    </div>
  );
}

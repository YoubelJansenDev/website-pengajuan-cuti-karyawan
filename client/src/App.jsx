import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import RegisterCompany from './pages/RegisterCompany.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Employees from './pages/admin/Employees.jsx';
import MyLeave from './pages/employee/MyLeave.jsx';
import ApplyLeave from './pages/employee/ApplyLeave.jsx';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: '#6b7280' }}>Memuat…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user, loading } = useAuth();

  function Home() {
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/leaves" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterCompany />} />

      <Route path="/admin" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
      <Route path="/admin/employees" element={<Protected roles={['admin']}><Employees /></Protected>} />
      <Route path="/leaves" element={<Protected roles={['employee']}><MyLeave /></Protected>} />
      <Route path="/leaves/apply" element={<Protected roles={['employee']}><ApplyLeave /></Protected>} />
    </Routes>
  );
}

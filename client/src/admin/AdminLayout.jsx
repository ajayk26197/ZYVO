import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin',            icon: '📊', label: 'Dashboard',  end: true },
  { to: '/admin/orders',     icon: '📦', label: 'Orders' },
  { to: '/admin/food',       icon: '🍔', label: 'Food Menu' },
  { to: '/admin/categories', icon: '🏷️',  label: 'Categories' },
  { to: '/admin/customers',  icon: '👥', label: 'Customers' },
  { to: '/admin/settings',   icon: '⚙️',  label: 'Settings' },
];

const S = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Outfit', sans-serif",
    background: '#f8fafc',
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    flexShrink: 0,
    boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  logoArea: {
    padding: '1.5rem 1.25rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.25rem',
  },
  logoIcon: {
    width: '38px', height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
  },
  logoText: { color: '#fff', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 },
  logoSub: { color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 500 },
  nav: { flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' },
  navLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '0.5rem 0.5rem 0.35rem',
    marginTop: '0.5rem',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.875rem 1.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  content: { flex: 1, padding: '1.75rem', overflowY: 'auto' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '0.85rem',
  },
  logoutBtn: {
    background: 'rgba(239,68,68,0.08)',
    color: '#ef4444',
    border: '1.5px solid rgba(239,68,68,0.2)',
    borderRadius: '8px',
    padding: '0.4rem 0.85rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  sideFooter: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
};

const navLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.7rem',
  padding: '0.6rem 0.85rem',
  borderRadius: '10px',
  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
  background: isActive ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'transparent',
  fontWeight: isActive ? 700 : 500,
  fontSize: '0.88rem',
  textDecoration: 'none',
  transition: 'all 0.18s',
  boxShadow: isActive ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
});

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <div style={S.shell}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.logoArea}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>🛡️</div>
            <div>
              <div style={S.logoText}>ZYVO Admin</div>
              <div style={S.logoSub}>Control Panel</div>
            </div>
          </div>
        </div>

        <nav style={S.nav}>
          <div style={S.navLabel}>Main</div>
          {NAV.slice(0, 2).map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} style={navLinkStyle}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div style={S.navLabel}>Management</div>
          {NAV.slice(2, 5).map(item => (
            <NavLink key={item.to} to={item.to} style={navLinkStyle}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div style={S.navLabel}>System</div>
          {NAV.slice(5).map(item => (
            <NavLink key={item.to} to={item.to} style={navLinkStyle}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={S.sideFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={S.avatar}>{initials}</div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>{user?.name || 'Admin'}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Administrator</div>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Admin Dashboard</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              color: '#16a34a',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '20px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              🟢 Live
            </div>
            <div style={S.avatar}>{initials}</div>
          </div>
        </div>

        {/* Page Content */}
        <div style={S.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

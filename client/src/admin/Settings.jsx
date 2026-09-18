import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const InfoRow = ({ label, value, valueColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.85rem', color: valueColor || '#0f172a', fontWeight: 700 }}>{value}</span>
  </div>
);

const Card = ({ title, icon, children, style }) => (
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #f1f5f9',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    ...style,
  }}>
    {title && (
      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon && <span>{icon}</span>}{title}
      </h3>
    )}
    {children}
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [hRes, sRes] = await Promise.all([
          axios.get('/api/health'),
          axios.get('/api/admin/stats'),
        ]);
        setHealth(hRes.data);
        setStats(sRes.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';

  const statItems = stats ? [
    { label: 'Total Orders',    value: stats.totalOrders?.toLocaleString('en-IN') || '0',                    color: '#6366f1',  bg: 'rgba(99,102,241,0.1)',  icon: '📦' },
    { label: 'Total Revenue',   value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,              color: '#16a34a',  bg: 'rgba(22,163,74,0.1)',   icon: '💰' },
    { label: 'Users',           value: stats.totalUsers?.toLocaleString('en-IN') || '0',                     color: '#0ea5e9',  bg: 'rgba(14,165,233,0.1)',  icon: '👥' },
    { label: 'Food Items',      value: stats.totalFoods?.toLocaleString('en-IN') || '0',                     color: '#f59e0b',  bg: 'rgba(245,158,11,0.1)',  icon: '🍔' },
    { label: "Today's Orders",  value: stats.todayOrders || '0',                                              color: '#8b5cf6',  bg: 'rgba(139,92,246,0.1)',  icon: '📅' },
    { label: 'Pending Orders',  value: stats.pendingOrders || '0', color: stats.pendingOrders > 0 ? '#ef4444' : '#16a34a', bg: stats.pendingOrders > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)', icon: '⏳' },
  ] : [];

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>System info and admin account details</p>
      </div>

      {/* Stats Mini Cards Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {statItems.map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '1rem 1.1rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Two-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Admin Profile */}
        <Card title="Admin Profile" icon="👤">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', padding: '1rem', background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(79,70,229,0.04))', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.12)' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.3)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.3rem', border: '3px solid rgba(99,102,241,0.3)', flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{user?.name || 'Admin'}</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.3rem' }}>{user?.email}</div>
              <span style={{ display: 'inline-block', padding: '0.18rem 0.6rem', borderRadius: '20px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                🛡️ ADMINISTRATOR
              </span>
            </div>
          </div>
          <InfoRow label="Full Name" value={user?.name || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} />
          <InfoRow label="Phone" value={user?.phone || '—'} />
          <InfoRow label="Role" value="Administrator" valueColor="#6366f1" />
          <div style={{ marginTop: '1rem' }}>
            <a href="/profile"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '9px', border: '1.5px solid #6366f1', color: '#6366f1', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', background: 'rgba(99,102,241,0.06)' }}>
              ✏️ Edit Profile
            </a>
          </div>
        </Card>

        {/* System Status */}
        <Card title="System Status" icon="🖥️">
          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '1rem 0' }}>Checking status...</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'API Server',  value: health ? '🟢 Online'    : '🔴 Offline',      color: health ? '#16a34a' : '#dc2626' },
                  { label: 'Database',    value: health ? '🟢 Connected'  : '🔴 Disconnected', color: health ? '#16a34a' : '#dc2626' },
                  { label: 'Environment', value: health?.env || 'development',                   color: '#f59e0b' },
                  { label: 'Node.js',     value: 'v22+',                                         color: '#0ea5e9' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem 0.875rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <InfoRow label="Last Health Check" value={health ? new Date(health.timestamp).toLocaleTimeString('en-IN') : '—'} />
            </>
          )}
        </Card>
      </div>

      {/* Bottom Two-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* App Info */}
        <Card title="App Info" icon="ℹ️">
          <InfoRow label="App Name"    value="ZYVO Food Delivery" />
          <InfoRow label="Version"     value="1.0.0" valueColor="#6366f1" />
          <InfoRow label="Frontend"    value="React + Vite" />
          <InfoRow label="Backend"     value="Node.js + Express" />
          <InfoRow label="Database"    value="MongoDB Atlas" />
          <InfoRow label="Auth"        value="JWT + bcrypt" />
          <InfoRow label="Image CDN"   value="Cloudinary" />
        </Card>

        {/* Quick Links */}
        <Card title="Quick Navigation" icon="🚀">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {[
              { href: '/admin',            icon: '📊', label: 'Dashboard' },
              { href: '/admin/orders',     icon: '📦', label: 'Orders' },
              { href: '/admin/food',       icon: '🍔', label: 'Food Menu' },
              { href: '/admin/categories', icon: '🏷️',  label: 'Categories' },
              { href: '/admin/customers',  icon: '👥', label: 'Customers' },
              { href: '/',                 icon: '🏠', label: 'View Site' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.65rem 0.875rem', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', background: '#f8fafc',
                color: '#374151', fontWeight: 600, fontSize: '0.82rem',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '1rem' }}>{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

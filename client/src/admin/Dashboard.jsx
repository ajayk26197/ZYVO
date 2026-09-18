import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ALL_FOODS } from '../data/mockFoods';

const StatCard = ({ icon, label, value, sub, color, bg }) => (
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    padding: '1.4rem 1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  }}>
    <div style={{
      width: '52px', height: '52px', borderRadius: '14px',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.5rem', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: color || '#0f172a', lineHeight: 1.2, marginTop: '0.15rem' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  </div>
);

const STATUS_COLORS = {
  pending:          { bg: '#fef9c3', color: '#854d0e' },
  confirmed:        { bg: '#dbeafe', color: '#1e40af' },
  preparing:        { bg: '#ede9fe', color: '#5b21b6' },
  out_for_delivery: { bg: '#d1fae5', color: '#065f46' },
  delivered:        { bg: '#dcfce7', color: '#14532d' },
  cancelled:        { bg: '#fee2e2', color: '#991b1b' },
};

const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      padding: '0.25rem 0.65rem',
      borderRadius: '20px',
      background: s.bg,
      color: s.color,
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, oRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/orders?limit=8'),
        ]);
        setStats(sRes.data);
        setOrders(oRes.data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '2.5rem' }}>📊</div>
      <div style={{ color: '#64748b', fontWeight: 600 }}>Loading dashboard...</div>
    </div>
  );

  const CARDS = [
    { icon: '📦', label: 'Total Orders',   value: stats?.totalOrders ?? 0,   color: '#6366f1', bg: 'rgba(99,102,241,0.1)', sub: `${stats?.todayOrders ?? 0} today` },
    { icon: '💰', label: 'Total Revenue',  value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`, color: '#16a34a', bg: 'rgba(22,163,74,0.1)', sub: 'Delivered orders' },
    { icon: '👥', label: 'Customers',      value: stats?.totalUsers ?? 0,     color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', sub: 'Registered users' },
    { icon: '🍔', label: 'Food Items',     value: Math.max(stats?.totalFoods ?? 0, ALL_FOODS.length),     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', sub: 'Menu items' },
    { icon: '⏳', label: 'Pending Orders', value: stats?.pendingOrders ?? 0,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  sub: 'Needs attention' },
    { icon: '📅', label: "Today's Orders", value: stats?.todayOrders ?? 0,    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', sub: 'Placed today' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Dashboard Overview</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Welcome back! Here's what's happening with ZYVO today.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {CARDS.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Recent Orders</h2>
          <a href="/admin/orders" style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all →</a>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No orders yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#6366f1', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      #{o._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#0f172a', fontWeight: 600 }}>{o.user?.name || 'Guest'}</td>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#475569' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#0f172a', fontWeight: 700 }}>₹{o.total?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.7rem 0.75rem' }}><Badge status={o.status} /></td>
                    <td style={{ padding: '0.7rem 0.75rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

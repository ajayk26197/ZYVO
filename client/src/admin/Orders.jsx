import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];

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
    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', background: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState(null);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filter) params.append('status', filter);
      const { data } = await axios.get(`/api/orders?${params}`);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, page]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Order status updated!');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Orders Management</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{total} total orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['', ...STATUS_OPTIONS].map(s => (
          <button
            key={s || 'all'}
            onClick={() => { setFilter(s); setPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              border: '1.5px solid',
              borderColor: filter === s ? '#6366f1' : '#e2e8f0',
              background: filter === s ? '#6366f1' : '#fff',
              color: filter === s ? '#fff' : '#475569',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {s ? s.replace(/_/g, ' ') : 'All Orders'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <div style={{ color: '#64748b', fontWeight: 600 }}>No orders found</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    <td style={{ padding: '0.8rem 1rem', color: '#6366f1', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      #{o._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.user?.name || 'Guest'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{o.user?.email}</div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#475569' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#0f172a' }}>₹{o.total?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: o.paymentMethod === 'online' ? '#16a34a' : '#0ea5e9', fontWeight: 600 }}>
                        {o.paymentMethod?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}><Badge status={o.status} /></td>
                    <td style={{ padding: '0.8rem 1rem', color: '#94a3b8', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <select
                        value={o.status}
                        disabled={updating === o._id || o.status === 'delivered' || o.status === 'cancelled'}
                        onChange={e => updateStatus(o._id, e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: '8px',
                          border: '1.5px solid #e2e8f0',
                          fontSize: '0.78rem',
                          fontFamily: 'inherit',
                          color: '#0f172a',
                          background: '#fff',
                          cursor: 'pointer',
                          opacity: (updating === o._id || o.status === 'delivered' || o.status === 'cancelled') ? 0.5 : 1,
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', color: '#475569', opacity: page === 1 ? 0.4 : 1 }}>
            ← Prev
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(pages, page + 2)).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1.5px solid', borderColor: p === page ? '#6366f1' : '#e2e8f0', background: p === page ? '#6366f1' : '#fff', color: p === page ? '#fff' : '#475569', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem' }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', color: '#475569', opacity: page === pages ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;

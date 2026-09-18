import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/admin/users');
        setUsers(data);
      } catch {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleUser = async (id, name) => {
    setToggling(id);
    try {
      const { data } = await axios.put(`/api/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(`${name} ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user');
    } finally {
      setToggling(null);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Customers</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{users.length} registered customers</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
            <div style={{ color: '#64748b', fontWeight: 600 }}>{search ? 'No customers match your search' : 'No customers yet'}</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['Customer', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const initials = u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                          ) : null}
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: u.avatar ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ID: {u._id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.65rem', borderRadius: '20px',
                          background: u.isActive !== false ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
                          color: u.isActive !== false ? '#16a34a' : '#dc2626',
                          fontSize: '0.72rem', fontWeight: 700,
                        }}>
                          {u.isActive !== false ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <button
                          onClick={() => toggleUser(u._id, u.name, u.isActive)}
                          disabled={toggling === u._id}
                          style={{
                            padding: '0.35rem 0.875rem',
                            borderRadius: '7px',
                            border: `1.5px solid ${u.isActive !== false ? '#ef4444' : '#16a34a'}`,
                            background: u.isActive !== false ? 'rgba(239,68,68,0.06)' : 'rgba(22,163,74,0.06)',
                            color: u.isActive !== false ? '#ef4444' : '#16a34a',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: toggling === u._id ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                            opacity: toggling === u._id ? 0.5 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {toggling === u._id ? '...' : u.isActive !== false ? '🚫 Deactivate' : '✅ Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;

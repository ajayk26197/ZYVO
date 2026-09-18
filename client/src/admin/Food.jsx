import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ALL_FOODS } from '../data/mockFoods';

const today = () => new Date().toISOString().split('T')[0];

const CAT_ICONS = {
  Pizza: '🍕',
  Burgers: '🍔',
  Sushi: '🍣',
  Tacos: '🌮',
  Salads: '🥗',
  Noodles: '🍜',
  Desserts: '🍰',
  Drinks: '🧃',
};

const getDeletedIds = () => {
  try {
    return JSON.parse(localStorage.getItem('zyvo_deleted_food_ids') || '[]');
  } catch {
    return [];
  }
};

const addDeletedId = (id) => {
  try {
    const list = getDeletedIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem('zyvo_deleted_food_ids', JSON.stringify(list));
    }
  } catch {}
};

const Food = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');   // '' = no filter (all items)
  const [dateMode, setDateMode]   = useState(false);       // toggle date filter on/off
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    const deletedIds = getDeletedIds();
    let combinedList = [];

    try {
      const params = new URLSearchParams({ limit: 100, admin: 'true' });
      if (search.trim()) params.append('q', search.trim());
      if (dateMode && selectedDate) params.append('date', selectedDate);
      
      const { data } = await axios.get(`/api/food?${params}`);
      const serverFoods = Array.isArray(data) ? data : (data?.foods || []);

      const merged = [...serverFoods];
      for (const item of ALL_FOODS) {
        if (deletedIds.includes(item._id)) continue;
        const exists = merged.some(
          existing =>
            (existing.name && item.name && existing.name.trim().toLowerCase() === item.name.trim().toLowerCase()) ||
            existing._id === item._id
        );
        if (!exists) {
          merged.push({
            ...item,
            createdAt: item.createdAt || '2026-03-01T10:00:00.000Z'
          });
        }
      }
      combinedList = merged;
    } catch {
      // Fallback to ALL_FOODS
      combinedList = ALL_FOODS.filter(f => !deletedIds.includes(f._id)).map(f => ({
        ...f,
        createdAt: f.createdAt || '2026-03-01T10:00:00.000Z'
      }));
    }

    // Apply Client-Side Filter for Search if specified
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      combinedList = combinedList.filter(f => {
        const catName = typeof f.category === 'object' ? f.category?.name : f.category;
        return (
          f.name?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          catName?.toLowerCase().includes(q)
        );
      });
    }

    // Apply Date filter if selected
    if (dateMode && selectedDate) {
      combinedList = combinedList.filter(f => {
        if (!f.createdAt) return false;
        const d = new Date(f.createdAt).toISOString().split('T')[0];
        return d === selectedDate;
      });
    }

    setTotal(combinedList.length);
    const startIndex = (page - 1) * LIMIT;
    const paginated = combinedList.slice(startIndex, startIndex + LIMIT);
    setFoods(paginated);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, page, selectedDate, dateMode]);

  const deleteFood = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    addDeletedId(id);
    try {
      await axios.delete(`/api/food/${id}`);
    } catch {
      // Offline/mock delete handled by addDeletedId
    } finally {
      setDeleting(null);
      toast.success(`"${name}" deleted`);
      load();
    }
  };

  const clearDateFilter = () => {
    setDateMode(false);
    setSelectedDate('');
    setPage(1);
  };

  const applyDateFilter = (date) => {
    setSelectedDate(date);
    setDateMode(true);
    setPage(1);
  };

  const pages = Math.ceil(total / LIMIT);

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Food Menu</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {dateMode && selectedDate
              ? <>Showing <strong>{total}</strong> item{total !== 1 ? 's' : ''} added on <strong>{formattedDate}</strong></>
              : <>{total} items in menu</>
            }
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/food/add')}
          style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.35)', fontFamily: 'inherit' }}>
          ＋ Add Food
        </button>
      </div>

      {/* Toolbar: Search + Date Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search food items..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: '1', minWidth: '200px', maxWidth: '340px', padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none' }}
        />

        {/* Date Picker Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={selectedDate}
              max={today()}
              onChange={e => applyDateFilter(e.target.value)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: `1.5px solid ${dateMode && selectedDate ? '#6366f1' : '#e2e8f0'}`,
                background: dateMode && selectedDate ? 'rgba(99,102,241,0.05)' : '#fff',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: dateMode && selectedDate ? 700 : 400,
              }}
            />
          </div>

          {/* Quick Shortcuts */}
          {[
            { label: 'Today',     value: today() },
            { label: 'Yesterday', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => applyDateFilter(value)}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '9px',
                border: '1.5px solid',
                borderColor: (dateMode && selectedDate === value) ? '#6366f1' : '#e2e8f0',
                background: (dateMode && selectedDate === value) ? '#6366f1' : '#fff',
                color: (dateMode && selectedDate === value) ? '#fff' : '#475569',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              📅 {label}
            </button>
          ))}

          {/* Clear Filter */}
          {dateMode && selectedDate && (
            <button
              onClick={clearDateFilter}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '9px', border: '1.5px solid #ef4444', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              ✕ Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Active Date Filter Banner */}
      {dateMode && selectedDate && (
        <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(79,70,229,0.04))', border: '1.5px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '0.75rem 1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📅</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4f46e5' }}>
              Filtered: {formattedDate}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6366f1', background: 'rgba(99,102,241,0.12)', padding: '0.15rem 0.55rem', borderRadius: '20px', fontWeight: 700 }}>
              {total} result{total !== 1 ? 's' : ''}
            </span>
          </div>
          <button onClick={clearDateFilter}
            style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Show all →
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading foods...</div>
        ) : foods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{dateMode ? '📅' : '🍽️'}</div>
            <div style={{ color: '#64748b', fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
              {dateMode && selectedDate ? `No food added on ${formattedDate}` : 'No food items found'}
            </div>
            {dateMode && (
              <button onClick={clearDateFilter} style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: '9px', border: '1.5px solid #6366f1', background: 'rgba(99,102,241,0.06)', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                Show all food items
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['Item', 'Category', 'Price', 'Rating', 'Type', 'Added On', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {foods.map((f, i) => (
                  <tr key={f._id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                    {/* Item */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={f.image}
                          alt={f.name}
                          style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, background: '#f1f5f9' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80'; }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{f.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</div>
                          {f.isFeatured && <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>⭐ Featured</span>}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                        {f.category?.icon || CAT_ICONS[typeof f.category === 'object' ? f.category?.name : f.category] || '🍽️'} {typeof f.category === 'object' ? f.category?.name : f.category || '—'}
                      </span>
                    </td>
                    {/* Price */}
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      ₹{f.price}
                      {f.originalPrice > f.price && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.3rem' }}>₹{f.originalPrice}</span>
                      )}
                    </td>
                    {/* Rating */}
                    <td style={{ padding: '0.75rem 1rem', color: '#f59e0b', fontWeight: 700 }}>
                      ⭐ {f.rating?.toFixed(1) || '0.0'} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.72rem' }}>({f.numReviews})</span>
                    </td>
                    {/* Type */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: f.isVeg ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.08)', color: f.isVeg ? '#16a34a' : '#dc2626', fontSize: '0.75rem', fontWeight: 700 }}>
                        {f.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </td>
                    {/* Added On */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Catalog'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {f.createdAt ? new Date(f.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Standard'}
                      </div>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap' }}>
                        <a
                          href={`/food/${f._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview as customer"
                          style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1.5px solid #0ea5e9', background: 'rgba(14,165,233,0.06)', color: '#0ea5e9', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                          👁️ View
                        </a>
                        <button
                          onClick={() => navigate(`/admin/food/edit/${f._id}`)}
                          style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1.5px solid #6366f1', background: 'rgba(99,102,241,0.06)', color: '#6366f1', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteFood(f._id, f.name)}
                          disabled={deleting === f._id}
                          style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1.5px solid #ef4444', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: deleting === f._id ? 0.5 : 1 }}>
                          🗑️
                        </button>
                      </div>
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
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
            const start = Math.max(1, page - 2);
            return start + i;
          }).filter(p => p <= pages).map(p => (
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

export default Food;

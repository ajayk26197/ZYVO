import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useClickOutside } from '../hooks/useClickOutside';

const INIT = { name: '', icon: '🍔', color: '#FF5200', description: '', isActive: true, order: 0 };
const EMOJI_OPTIONS = ['🍔', '🍕', '🍣', '🍜', '🥗', '🍰', '☕', '🌮', '🥪', '🍟', '🍦', '🍩', '🍲', '🥩', '🍹'];

const Categories = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const formRef = useRef(null);
  const addBtnRef = useRef(null);

  // Close form when clicking outside or pressing Escape
  useClickOutside([formRef, addBtnRef], () => {
    setShowForm(false);
    setEditId(null);
  }, showForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/categories');
      setCats(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(INIT);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, description: cat.description || '', isActive: cat.isActive, order: cat.order || 0 });
    setEditId(cat._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      if (editId) {
        const { data } = await axios.put(`/api/categories/${editId}`, form);
        setCats(prev => prev.map(c => c._id === editId ? { ...c, ...data } : c));
        toast.success('Category updated!');
      } else {
        const { data } = await axios.post('/api/categories', form);
        setCats(prev => [...prev, data]);
        toast.success('Category added!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(INIT);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/categories/${id}`);
      setCats(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.875rem', borderRadius: '9px',
    border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem',
    fontFamily: 'inherit', color: '#0f172a', outline: 'none',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Categories</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{cats.length} categories</p>
        </div>
        <button ref={addBtnRef} onClick={openAdd}
          style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.35)', fontFamily: 'inherit' }}>
          ＋ Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div ref={formRef} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1.5px solid rgba(99,102,241,0.25)', boxShadow: '0 4px 20px rgba(99,102,241,0.12)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            {editId ? '✏️ Edit Category' : '＋ New Category'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>Name *</label>
                <input style={inputStyle} placeholder="e.g. Burgers" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>Icon</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}>
                  {EMOJI_OPTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    style={{ width: '42px', height: '38px', borderRadius: '7px', border: '1.5px solid #e2e8f0', cursor: 'pointer', padding: '2px' }} />
                  <input style={{ ...inputStyle, flex: 1 }} value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>Order</label>
                <input type="number" style={inputStyle} min="0" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.3rem' }}>Description</label>
                <input style={inputStyle} placeholder="Optional description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} style={{ accentColor: '#6366f1' }} />
                Active
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{ padding: '0.55rem 1.5rem', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving...' : editId ? '✅ Update' : '＋ Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading categories...</div>
      ) : cats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏷️</div>
          <div style={{ color: '#64748b', fontWeight: 600 }}>No categories yet</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {cats.map(cat => (
            <div key={cat._id} style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              border: '1px solid #f1f5f9',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: cat.color || '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
              }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{cat.name}</span>
                  {!cat.isActive && <span style={{ padding: '0.1rem 0.45rem', borderRadius: '5px', background: '#fee2e2', color: '#991b1b', fontSize: '0.65rem', fontWeight: 700 }}>INACTIVE</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {cat.count ?? 0} items {cat.description ? `· ${cat.description}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                <button onClick={() => openEdit(cat)}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '7px', border: '1.5px solid #6366f1', background: 'rgba(99,102,241,0.06)', color: '#6366f1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✏️
                </button>
                <button onClick={() => deleteCategory(cat._id, cat.name)} disabled={deleting === cat._id}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '7px', border: '1.5px solid #ef4444', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: deleting === cat._id ? 0.5 : 1 }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;

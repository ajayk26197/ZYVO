import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const INIT = {
  name: '', description: '', price: '', originalPrice: '', discount: '0',
  category: '', isVeg: false, isAvailable: true, isFeatured: false,
  prepTime: '20', tags: '', ingredients: '',
  nutrition: { calories: '', protein: '', carbs: '', fat: '' },
};

const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
    {children}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
  </label>
);

const Input = ({ style, ...props }) => (
  <input style={{
    width: '100%', padding: '0.6rem 0.875rem', borderRadius: '9px',
    border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem',
    fontFamily: 'inherit', color: '#0f172a', outline: 'none',
    ...style,
  }} {...props} />
);

const Textarea = ({ style, ...props }) => (
  <textarea style={{
    width: '100%', padding: '0.6rem 0.875rem', borderRadius: '9px',
    border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem',
    fontFamily: 'inherit', color: '#0f172a', outline: 'none', resize: 'vertical',
    ...style,
  }} {...props} />
);

const Card = ({ title, children }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.25rem' }}>
    {title && <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>{title}</h3>}
    {children}
  </div>
);

// ─── Image Upload Zone ──────────────────────────────────────────────
const ImageUpload = ({ imageFile, previewUrl, existingUrl, onChange, onClear }) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const validateAndSet = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    onChange(file);
  };

  const displaySrc = previewUrl || existingUrl;

  return (
    <div>
      {displaySrc ? (
        /* Preview */
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={displaySrc}
            alt="Preview"
            style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e2e8f0', display: 'block' }}
          />
          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(4px)' }}
            >
              🔄 Change
            </button>
            <button
              type="button"
              onClick={onClear}
              style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(4px)' }}
            >
              ✕
            </button>
          </div>
          {imageFile && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
              <span style={{ fontSize: '0.8rem' }}>✅</span>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>{imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)</span>
            </div>
          )}
        </div>
      ) : (
        /* Drop Zone */
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? '#6366f1' : '#cbd5e1'}`,
            borderRadius: '14px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(99,102,241,0.05)' : '#fafcff',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
          <div style={{ fontWeight: 700, color: dragging ? '#6366f1' : '#374151', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
            {dragging ? 'Drop image here!' : 'Click or drag & drop an image'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>JPG, PNG, WebP · Max 5MB</div>
          <div style={{ marginTop: '1rem' }}>
            <span style={{ padding: '0.45rem 1.1rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
              Browse File
            </span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────
const AddFood = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);       // File object
  const [previewUrl, setPreviewUrl] = useState('');       // Local blob URL
  const [existingImageUrl, setExistingImageUrl] = useState(''); // Current saved URL (edit mode)

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const catRes = await axios.get('/api/categories');
        setCategories(catRes.data);
        if (isEdit) {
          const { data } = await axios.get(`/api/food/${id}`);
          setForm({
            name: data.name || '',
            description: data.description || '',
            price: data.price || '',
            originalPrice: data.originalPrice || '',
            discount: data.discount || '0',
            category: data.category?._id || data.category || '',
            isVeg: data.isVeg || false,
            isAvailable: data.isAvailable !== false,
            isFeatured: data.isFeatured || false,
            prepTime: data.prepTime || '20',
            tags: (data.tags || []).join(', '),
            ingredients: (data.ingredients || []).join(', '),
            nutrition: {
              calories: data.nutrition?.calories || '',
              protein: data.nutrition?.protein || '',
              carbs: data.nutrition?.carbs || '',
              fat: data.nutrition?.fat || '',
            },
          });
          setExistingImageUrl(data.image || '');
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Generate local preview URL when a file is selected
  const handleImageChange = (file) => {
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setNutrition = (key, val) => setForm(p => ({ ...p, nutrition: { ...p.nutrition, [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())                        return toast.error('Name is required');
    if (!form.price || Number(form.price) <= 0)   return toast.error('Valid price is required');
    if (!form.category)                           return toast.error('Category is required');
    if (!imageFile && !existingImageUrl)          return toast.error('Please upload an image');

    setSaving(true);
    try {
      // Build multipart/form-data
      const fd = new FormData();
      fd.append('name',          form.name.trim());
      fd.append('description',   form.description.trim());
      fd.append('price',         Number(form.price));
      fd.append('originalPrice', Number(form.originalPrice) || 0);
      fd.append('discount',      Number(form.discount) || 0);
      fd.append('category',      form.category);
      fd.append('isVeg',         form.isVeg);
      fd.append('isAvailable',   form.isAvailable);
      fd.append('isFeatured',    form.isFeatured);
      fd.append('prepTime',      Number(form.prepTime) || 20);
      fd.append('tags',          form.tags.split(',').map(t => t.trim()).filter(Boolean).join(','));
      fd.append('ingredients',   form.ingredients.split(',').map(t => t.trim()).filter(Boolean).join(','));
      if (form.nutrition.calories) fd.append('nutrition[calories]', Number(form.nutrition.calories));
      if (form.nutrition.protein)  fd.append('nutrition[protein]',  Number(form.nutrition.protein));
      if (form.nutrition.carbs)    fd.append('nutrition[carbs]',    Number(form.nutrition.carbs));
      if (form.nutrition.fat)      fd.append('nutrition[fat]',      Number(form.nutrition.fat));

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (existingImageUrl) {
        fd.append('image', existingImageUrl); // keep existing URL if no new file
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEdit) {
        await axios.put(`/api/food/${id}`, fd, config);
        toast.success('Food updated! ✅');
      } else {
        await axios.post('/api/food', fd, config);
        toast.success('Food added! 🎉');
      }
      navigate('/admin/food');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <button onClick={() => navigate('/admin/food')}
          style={{ background: '#f1f5f9', border: 'none', borderRadius: '9px', padding: '0.5rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.1rem' }}>
            {isEdit ? 'Edit Food Item' : 'Add New Food'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {isEdit ? `Editing: ${form.name}` : 'Add a new item to the menu'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Basic Info */}
        <Card title="📋 Basic Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label required>Food Name</Label>
              <Input placeholder="e.g. Chicken Biryani" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label required>Description</Label>
              <Textarea placeholder="Describe the dish..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} required />
            </div>
            <div>
              <Label required>Category</Label>
              <select value={form.category} onChange={e => set('category', e.target.value)} required
                style={{ width: '100%', padding: '0.6rem 0.875rem', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', fontFamily: 'inherit', color: form.category ? '#0f172a' : '#94a3b8', outline: 'none' }}>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Prep Time (mins)</Label>
              <Input type="number" min="1" placeholder="20" value={form.prepTime} onChange={e => set('prepTime', e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Image Upload */}
        <Card title="🖼️ Food Image">
          <ImageUpload
            imageFile={imageFile}
            previewUrl={previewUrl}
            existingUrl={existingImageUrl}
            onChange={handleImageChange}
            onClear={clearImage}
          />
        </Card>

        {/* Pricing */}
        <Card title="💰 Pricing">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <Label required>Selling Price (₹)</Label>
              <Input type="number" min="0" placeholder="299" value={form.price} onChange={e => set('price', e.target.value)} required />
            </div>
            <div>
              <Label>Original Price (₹)</Label>
              <Input type="number" min="0" placeholder="399" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} />
            </div>
            <div>
              <Label>Discount (%)</Label>
              <Input type="number" min="0" max="100" placeholder="0" value={form.discount} onChange={e => set('discount', e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Flags */}
        <Card title="🏷️ Flags & Availability">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {[
              { key: 'isVeg',       label: '🟢 Vegetarian', color: '#16a34a' },
              { key: 'isFeatured',  label: '⭐ Featured',   color: '#f59e0b' },
              { key: 'isAvailable', label: '✅ Available',   color: '#6366f1' },
            ].map(({ key, label, color }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.875rem', borderRadius: '9px', border: `1.5px solid ${form[key] ? color : '#e2e8f0'}`, background: form[key] ? `${color}15` : '#fff', transition: 'all 0.15s' }}>
                <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} style={{ accentColor: color }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: form[key] ? color : '#475569' }}>{label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Tags & Ingredients */}
        <Card title="🏷️ Tags & Ingredients">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input placeholder="spicy, popular, combo" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
            <div>
              <Label>Ingredients (comma separated)</Label>
              <Input placeholder="chicken, rice, spices" value={form.ingredients} onChange={e => set('ingredients', e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Nutrition */}
        <Card title="🥗 Nutrition Info (optional)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { key: 'calories', label: 'Calories (kcal)' },
              { key: 'protein',  label: 'Protein (g)' },
              { key: 'carbs',    label: 'Carbs (g)' },
              { key: 'fat',      label: 'Fat (g)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input type="number" min="0" placeholder="0" value={form.nutrition[key]} onChange={e => setNutrition(key, e.target.value)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => navigate('/admin/food')}
            style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding: '0.7rem 2rem', borderRadius: '10px', border: 'none', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            {saving ? '⏳ Saving...' : isEdit ? '✅ Update Food' : '🎉 Add Food'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFood;

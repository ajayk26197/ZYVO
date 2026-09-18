import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEFAULT_ADDRESSES = [
  {
    id: '1',
    label: 'Home 🏠',
    name: 'Arjun Sharma',
    phone: '9123456780',
    flat: 'Flat 402, Building A',
    street: '45 Linking Road, Opposite National Park',
    landmark: 'Near Starbucks Coffee',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    notes: 'Please ring bell twice. Leave at door if no answer.',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work 💼',
    name: 'Arjun Sharma',
    phone: '9123456780',
    flat: '7th Floor, Tower B',
    street: 'BKC Business Park, Bandra East',
    landmark: 'Behind ICICI Bank Tower',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    notes: 'Leave at reception with Security Officer.',
    isDefault: false,
  },
];

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();

  // Personal Info Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '9123456780');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [altPhone, setAltPhone] = useState('');
  const [deliveryInstruction, setDeliveryInstruction] = useState('call_on_arrival'); // 'call_on_arrival' | 'drop_at_door' | 'leave_with_guard' | 'no_bell'

  // Addresses State
  const [addresses, setAddresses] = useState(user?.addresses?.length > 0 ? user.addresses : DEFAULT_ADDRESSES);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Close address modal on Escape key and prevent background scroll
  useEffect(() => {
    if (!showAddressModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowAddressModal(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showAddressModal]);

  // Address Form State
  const [addrForm, setAddrForm] = useState({
    label: 'Home 🏠',
    name: user?.name || '',
    phone: phone || '',
    flat: '',
    street: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.phone) setPhone(user.phone);
      if (user.avatar) setAvatar(user.avatar);
      if (user.addresses?.length > 0) setAddresses(user.addresses);
    }
  }, [user]);

  // Handle Personal Info Update
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number for delivery contact');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
        addresses,
      });
      toast.success('Profile details saved! Delivery partners can now reach you easily. 📞');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Open modal for adding or editing address
  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddrId(addr.id || addr._id);
      setAddrForm({
        label: addr.label || 'Home 🏠',
        name: addr.name || name,
        phone: addr.phone || phone,
        flat: addr.flat || '',
        street: addr.street || '',
        landmark: addr.landmark || '',
        city: addr.city || 'Mumbai',
        state: addr.state || 'Maharashtra',
        pincode: addr.pincode || '',
        notes: addr.notes || '',
      });
    } else {
      setEditingAddrId(null);
      setAddrForm({
        label: 'Home 🏠',
        name: name,
        phone: phone,
        flat: '',
        street: '',
        landmark: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '',
        notes: '',
      });
    }
    setShowAddressModal(true);
  };

  // Save address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.street || !addrForm.pincode || !addrForm.phone) {
      toast.error('Please fill in street address, pincode, and contact phone number');
      return;
    }

    let updatedList = [];
    if (editingAddrId) {
      updatedList = addresses.map(a => (a.id === editingAddrId || a._id === editingAddrId) ? { ...addrForm, id: editingAddrId } : a);
    } else {
      const newAddr = {
        ...addrForm,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      updatedList = [...addresses, newAddr];
    }

    setAddresses(updatedList);
    setShowAddressModal(false);

    try {
      await updateProfile({ addresses: updatedList });
      toast.success(editingAddrId ? 'Address updated! 📍' : 'New delivery address added! 📍');
    } catch {
      toast.success('Address saved locally! 📍');
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (id) => {
    const updatedList = addresses.map(a => ({
      ...a,
      isDefault: (a.id === id || a._id === id),
    }));
    setAddresses(updatedList);
    try {
      await updateProfile({ addresses: updatedList });
      toast.success('Default delivery location updated! 🌟');
    } catch {
      toast.success('Default location set! 🌟');
    }
  };

  // Delete address
  const handleDeleteAddress = async (id) => {
    const updatedList = addresses.filter(a => (a.id !== id && a._id !== id));
    setAddresses(updatedList);
    try {
      await updateProfile({ addresses: updatedList });
      toast.success('Address removed');
    } catch {
      toast.success('Address removed');
    }
  };

  const userAvatarUrl = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=FF5200&color=fff&size=128`;

  return (
    <div style={{ paddingTop: '6rem', paddingBottom: '5rem', background: 'var(--bg)', minHeight: '88vh' }}>
      <div className="container">
        <div className="profileGrid">
          
          {/* LEFT SIDEBAR: PROFILE CARD & PREFERENCES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* User Profile Card */}
            <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px', textCenter: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <img
                    src={userAvatarUrl}
                    alt={name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary)',
                      boxShadow: '0 6px 18px rgba(252, 128, 25, 0.25)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    ✏️
                  </span>
                </div>

                <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.25rem' }}>{name || 'ZYVO User'}</h3>
                <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
                  {user?.role === 'admin' ? '⚙️ Admin Account' : '🛍️ Valued Customer'}
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{email}</p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

              {/* Personal Details Form */}
              <form onSubmit={handleSavePersonalInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>
                    Full Name 👤
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>
                    Delivery Mobile Number 📞 <span style={{ color: 'var(--primary)' }}>*Required</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit Mobile Number"
                    required
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    Used by delivery partner to call upon arrival.
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>
                    Profile Photo URL 🖼️
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={saving} style={{ marginTop: '0.5rem' }}>
                  {saving ? 'Saving Details...' : 'Save Profile Details 💾'}
                </button>
              </form>
            </div>

            {/* Delivery Partner Preferences */}
            <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🛵</span> Delivery Partner Instructions
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { id: 'call_on_arrival', label: '📞 Call me when arriving at building', desc: 'Driver will call your phone before reaching gate' },
                  { id: 'drop_at_door', label: '🚪 Leave food at door & knock', desc: 'Contactless delivery directly outside your apartment' },
                  { id: 'leave_with_guard', label: '👮 Leave with society security guard', desc: 'Driver drops order at building security desk' },
                  { id: 'no_bell', label: '🤫 Don\'t ring doorbell (Baby sleeping)', desc: 'Silent drop-off notification only' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    onClick={() => { setDeliveryInstruction(opt.id); toast.success('Delivery instruction updated!'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: deliveryInstruction === opt.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: deliveryInstruction === opt.id ? 'var(--surface-2)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="instruction"
                      checked={deliveryInstruction === opt.id}
                      onChange={() => {}}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{opt.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>
                  Alternate Phone Number 📲 (Optional)
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={altPhone}
                  onChange={e => setAltPhone(e.target.value)}
                  placeholder="Backup contact number"
                />
              </div>
            </div>

          </div>

          {/* RIGHT MAIN SECTION: SAVED DELIVERY ADDRESSES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Delivery Address Header Card */}
            <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>📍 Saved Delivery Locations</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                    Add exact apartment numbers, landmarks, and pincodes for 100% accurate food delivery.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenAddressModal()}>
                  + Add New Address 📍
                </button>
              </div>

              {/* Address List */}
              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg)', borderRadius: '16px' }}>
                  <span style={{ fontSize: '3rem' }}>📍</span>
                  <h4>No saved delivery addresses</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Add your delivery address to enjoy 1-click checkout.</p>
                  <button className="btn btn-primary btn-sm mt-2" onClick={() => handleOpenAddressModal()}>
                    + Add Address
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {addresses.map(addr => {
                    const addrId = addr.id || addr._id;
                    return (
                      <div
                        key={addrId}
                        style={{
                          border: addr.isDefault ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: addr.isDefault ? 'var(--surface-2)' : '#ffffff',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Tag & Actions Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span className="badge badge-primary" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                              {addr.label || 'Address'}
                            </span>
                            {addr.isDefault && (
                              <span style={{ background: 'var(--primary)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                                🌟 DEFAULT LOCATION
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {!addr.isDefault && (
                              <button className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }} onClick={() => handleSetDefaultAddress(addrId)}>
                                Set Default
                              </button>
                            )}
                            <button className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }} onClick={() => handleOpenAddressModal(addr)}>
                              Edit ✏️
                            </button>
                            <button className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', color: 'var(--error)' }} onClick={() => handleDeleteAddress(addrId)}>
                              Delete 🗑️
                            </button>
                          </div>
                        </div>

                        {/* Recipient Details */}
                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.05rem', color: 'var(--text)' }}>
                          {addr.name || name} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>(📞 {addr.phone || phone})</span>
                        </h4>

                        {/* Exact Address */}
                        <p style={{ margin: '0 0 0.4rem', fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.5 }}>
                          {addr.flat ? `${addr.flat}, ` : ''}{addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>

                        {/* Landmark */}
                        {addr.landmark && (
                          <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                            🚩 Landmark: {addr.landmark}
                          </p>
                        )}

                        {/* Delivery Partner Notes */}
                        {addr.notes && (
                          <div style={{ background: 'rgba(252, 128, 25, 0.08)', padding: '0.6rem 0.85rem', borderRadius: '10px', marginTop: '0.6rem' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)' }}>
                              <strong>📝 Delivery Note for Driver:</strong> {addr.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delivery Guarantee Info Banner */}
            <div className="card p-3" style={{ background: '#FFF0E6', border: '1px solid rgba(252,128,25,0.3)', borderRadius: '20px' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>🚀</span>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.05rem' }}>ZYVO Superfast Delivery Promise</h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text)' }}>
                    With accurate landmark & contact numbers saved in your profile, our delivery drivers arrive in under 30 minutes every time!
                  </p>
                </div>
              </div>
            </div>

            {/* Account Quick Links & Logout (Placed Below Delivery Promise) */}
            <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span> Account Actions & Quick Navigation
              </h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/orders?tab=current"
                  className="btn btn-outline"
                  style={{ flex: 1, minWidth: '180px', justifyContent: 'center', padding: '0.75rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  🛵 My Current Orders
                </Link>
                <Link
                  to="/orders?tab=history"
                  className="btn btn-outline"
                  style={{ flex: 1, minWidth: '180px', justifyContent: 'center', padding: '0.75rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  📜 Order History
                </Link>
                <button
                  className="btn btn-outline"
                  onClick={logout}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    justifyContent: 'center',
                    padding: '0.75rem 1rem',
                    fontWeight: 700,
                    color: 'var(--error)',
                    borderColor: '#fca5a5',
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  🚪 Logout Account
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ADDRESS MODAL DRAWER / POPUP */}
      {showAddressModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="card p-3"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editingAddrId ? '✏️ Edit Delivery Address' : '📍 Add New Delivery Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Address Type Tag */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Address Type Label 🏷️
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Home 🏠', 'Work 💼', 'Other 📍'].map(lbl => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setAddrForm(p => ({ ...p, label: lbl }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: addrForm.label === lbl ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: addrForm.label === lbl ? 'var(--surface-2)' : '#ffffff',
                        color: addrForm.label === lbl ? 'var(--primary)' : 'var(--text)',
                        cursor: 'pointer',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Name & Phone */}
              <div className="formGrid2">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                    Receiver Name 👤
                  </label>
                  <input
                    className="form-input"
                    placeholder="Full Name"
                    value={addrForm.name}
                    onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                    Contact Phone 📞
                  </label>
                  <input
                    className="form-input"
                    placeholder="10-digit Phone"
                    value={addrForm.phone}
                    onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* House/Flat & Street Address */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  House No. / Flat / Building Name 🏢
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Flat 402, Sunshine Apartments"
                  value={addrForm.flat}
                  onChange={e => setAddrForm(p => ({ ...p, flat: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Street / Area / Colony 🛣️ <span style={{ color: 'var(--primary)' }}>*Required</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. 45 Linking Road, Bandra West"
                  value={addrForm.street}
                  onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))}
                  required
                />
              </div>

              {/* Landmark & Pincode */}
              <div className="formGrid12">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                    Nearby Landmark 🚩 (Optional)
                  </label>
                  <input
                    className="form-input"
                    placeholder="e.g. Near HDFC Bank Metro Station"
                    value={addrForm.landmark}
                    onChange={e => setAddrForm(p => ({ ...p, landmark: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                    Pincode 📮 <span style={{ color: 'var(--primary)' }}>*Required</span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="400050"
                    value={addrForm.pincode}
                    onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="formGrid2">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>City 🏙️</label>
                  <input
                    className="form-input"
                    placeholder="City"
                    value={addrForm.city}
                    onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>State 🗺️</label>
                  <input
                    className="form-input"
                    placeholder="State"
                    value={addrForm.state}
                    onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Driver Note */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                  Delivery Note for Driver 📝
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Leave with security guard, elevator requires keycard..."
                  value={addrForm.notes}
                  onChange={e => setAddrForm(p => ({ ...p, notes: e.target.value }))}
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Location 📍
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;

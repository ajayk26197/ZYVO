import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { useClickOutside } from '../hooks/useClickOutside';
import toast from 'react-hot-toast';
import api from '../services/api';

const SAVED_ADDRESSES = [
  { id: '1', label: 'Home', name: 'Arjun Sharma', phone: '9123456780', street: '45 Linking Road, Bandra West', city: 'Mumbai', pincode: '400050', isDefault: true },
  { id: '2', label: 'Work', name: 'Arjun Sharma', phone: '9123456780', street: '7 BKC, Bandra Kurla Complex', city: 'Mumbai', pincode: '400051', isDefault: false },
];

const Checkout = () => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedAddrId, setSelectedAddrId] = useState('1');
  const [addresses, setAddresses] = useState(SAVED_ADDRESSES);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const newAddrRef = useRef(null);
  const toggleNewAddrBtnRef = useRef(null);

  // Close new address form when clicking outside or pressing Escape
  useClickOutside([newAddrRef, toggleNewAddrBtnRef], () => setShowNewAddr(false), showNewAddr);

  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Mumbai',
    pincode: '',
  });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME20') {
      const disc = Math.min(100, Math.round(subtotal * 0.2));
      setDiscount(disc);
      toast.success('Coupon WELCOME20 applied! Saved 20% 🎉');
    } else if (code === 'ZYVO') {
      const disc = Math.min(150, Math.round(subtotal * 0.15));
      setDiscount(disc);
      toast.success('Coupon ZYVO applied! Saved 15% ⚡');
    } else if (code === 'FLAT50') {
      setDiscount(50);
      toast.success('Coupon FLAT50 applied! Saved ₹50 🎟️');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.pincode) {
      toast.error('Please fill in street address and pincode');
      return;
    }
    const created = { ...newAddr, id: Date.now().toString() };
    setAddresses(prev => [...prev, created]);
    setSelectedAddrId(created.id);
    setShowNewAddr(false);
    toast.success('New address added!');
  };

  const finalTotal = Math.max(0, total - discount);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setLoading(true);
    try {
      const addrObj = addresses.find(a => a.id === selectedAddrId) || addresses[0];
      const payload = {
        items: items.map(i => ({ _id: i._id, food: i._id, qty: i.qty, price: i.price, name: i.name, image: i.image })),
        address: addrObj,
        subtotal,
        deliveryFee,
        discount,
        total: finalTotal,
        paymentMethod,
      };
      const { data } = await api.post('/orders', payload);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data._id}?tab=current`);
    } catch (err) {
      console.error('Order Error:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '6rem', paddingBottom: '4rem', background: 'var(--bg)', minHeight: '85vh' }}>
      <div className="container">
        <div className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h1>Checkout</h1>
          <p>Complete your address and payment to confirm order</p>
        </div>

        <div className="checkoutGrid">
          {/* Left Main Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. DELIVERY ADDRESS */}
            <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>📍 Delivery Address</h3>
                <button ref={toggleNewAddrBtnRef} className="btn btn-outline btn-sm" onClick={() => setShowNewAddr(p => !p)}>
                  {showNewAddr ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {/* Saved Addresses List */}
              <div className="formGrid2">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddrId(addr.id)}
                    style={{
                      border: selectedAddrId === addr.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedAddrId === addr.id ? 'var(--surface-2)' : '#ffffff',
                      borderRadius: '14px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span className="badge badge-primary">{addr.label}</span>
                      {selectedAddrId === addr.id && <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓ Selected</span>}
                    </div>
                    <p style={{ fontWeight: 700, margin: 0, color: 'var(--text)' }}>{addr.name}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>{addr.street}, {addr.city} ({addr.pincode})</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>📞 {addr.phone}</p>
                  </div>
                ))}
              </div>

              {/* New Address Form Drawer */}
              {showNewAddr && (
                <form ref={newAddrRef} onSubmit={handleAddAddress} style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Add New Address</h4>
                  <div className="formGrid2" style={{ marginBottom: '1rem' }}>
                    <input className="form-input" placeholder="Address Label (Home/Work)" value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} required />
                    <input className="form-input" placeholder="Full Name" value={newAddr.name} onChange={e => setNewAddr(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="formGrid2" style={{ marginBottom: '1rem' }}>
                    <input className="form-input" placeholder="Phone Number" value={newAddr.phone} onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value }))} required />
                    <input className="form-input" placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr(p => ({ ...p, pincode: e.target.value }))} required />
                  </div>
                  <input className="form-input" placeholder="Street Address / House No / Flat" value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} style={{ marginBottom: '1rem' }} required />
                  <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
                </form>
              )}
            </div>

            {/* 2. PAYMENT METHOD */}
            <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>💳 Select Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '14px',
                    border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: paymentMethod === 'cod' ? 'var(--surface-2)' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>💵 Cash on Delivery (COD)</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Pay with cash or UPI when your food arrives at your door</p>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '14px',
                    border: paymentMethod === 'online' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: paymentMethod === 'online' ? 'var(--surface-2)' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>⚡ Online Payment (UPI / Cards / NetBanking)</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Instant payment via Google Pay, PhonePe, Paytm or Card</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Order Summary</h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: '200px', overflowY: 'auto' }}>
                {items.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text)' }}>{item.qty} × {item.name}</span>
                    <span style={{ fontWeight: 700 }}>{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input
                  className="form-input"
                  placeholder="Coupon code (e.g. ZYVO)"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  style={{ padding: '0.55rem 0.8rem', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm">Apply</button>
              </form>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success)' }}>
                    <span>Coupon Discount</span>
                    <span>- {formatPrice(discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>
                  <span>Final Amount</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary w-full btn-lg"
                style={{ marginTop: '1.5rem' }}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? '⏳ Processing Order...' : '🚀 Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

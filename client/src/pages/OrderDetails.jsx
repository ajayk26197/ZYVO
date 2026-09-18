import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import api from '../services/api';

const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📝', desc: 'We have received your order' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Restaurant confirmed your order' },
  { key: 'preparing', label: 'Preparing', icon: '🍳', desc: 'Chef is preparing your delicious meal' },
  { key: 'ready', label: 'Ready', icon: '📦', desc: 'Food is packed and ready for pickup' },
  { key: 'on_the_way', label: 'Out for Delivery', icon: '🛵', desc: 'Delivery partner is on the way' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Order delivered successfully!' }
];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch {
        // Mock fallback
        setOrder({
          _id: id,
          createdAt: new Date(),
          status: 'preparing',
          items: [
            { name: 'Margherita Pizza', price: 349, qty: 2, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200' },
            { name: 'Classic Burger', price: 299, qty: 1, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200' },
          ],
          subtotal: 997,
          deliveryFee: 0,
          discount: 50,
          total: 947,
          paymentMethod: 'online',
          paymentStatus: 'paid',
          address: { name: 'Arjun Sharma', phone: '9123456780', street: '45 Linking Road', city: 'Mumbai', pincode: '400050' },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <h2>Loading order tracking...</h2>
      </div>
    );
  }

  // Get current step index based on status
  const currentStepIndex = ORDER_STEPS.findIndex(s => s.key === order?.status);
  const activeIdx = currentStepIndex >= 0 ? currentStepIndex : 2; // Default preparing for demo

  return (
    <div style={{ paddingTop: '6rem', paddingBottom: '4rem', background: 'var(--bg)', minHeight: '85vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800 }}>Order Status</span>
            <h1 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>Order #{order._id?.slice(-8).toUpperCase()}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placing Date: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <Link to="/orders" className="btn btn-outline btn-sm">← Back to Orders</Link>
        </div>

        {/* LIVE TRACKING BANNER & DELIVERY DRIVER CARD */}
        <div className="card p-3 mb-3" style={{ background: 'var(--surface-2)', border: '1px solid rgba(252,128,25,0.3)', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>🛵 LIVE DELIVERY TRACKING</span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', margin: 0 }}>
                {activeIdx === 5 ? '🎉 Delivered!' : '⏱ Estimated Delivery in 18 minutes'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Your food is fresh & hot. Delivery partner is on the route.
              </p>
            </div>

            {/* Delivery Partner Profile Card */}
            <div style={{ background: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                🛵
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', margin: 0 }}>Ravi Kumar</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Vehicle: MH01AB1234</p>
              </div>
              <a href="tel:+919988776655" className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                📞 Call Driver
              </a>
            </div>
          </div>
        </div>

        {/* VISUAL STEP TIMELINE */}
        <div className="card p-3 mb-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Order Timeline Status</h3>
          <div className="timelineGrid">
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = idx <= activeIdx;
              const isCurrent = idx === activeIdx;

              return (
                <div key={step.key} style={{ position: 'relative', zIndex: 1 }}>
                  {/* Circle Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--primary)' : 'var(--border)',
                    color: isCompleted ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    margin: '0 auto 0.6rem',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(252, 128, 25, 0.25)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {step.icon}
                  </div>
                  <h5 style={{
                    fontSize: '0.85rem',
                    fontWeight: isCurrent ? 800 : (isCompleted ? 700 : 500),
                    color: isCompleted ? 'var(--text)' : 'var(--text-muted)',
                    marginBottom: '0.2rem',
                  }}>
                    {step.label}
                  </h5>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDER DETAILS & ADDRESS */}
        <div className="grid-2">
          {/* Items Summary */}
          <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items?.map((item, idx) => {
                const img = item.image || item.food?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200';
                const title = item.name || item.food?.name || 'Food Item';
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={img} alt={title} style={{ width: '54px', height: '54px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.qty} × {formatPrice(item.price)}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{formatPrice(item.price * item.qty)}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || order.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Delivery Fee</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--primary)' }}>
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Payment info */}
          <div className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Delivery Information</h3>
            {order.address && (
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>📍 Delivery Address</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginTop: '0.3rem', margin: 0 }}>{order.address.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.address.street}, {order.address.city} - {order.address.pincode}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone: {order.address.phone}</p>
              </div>
            )}

            <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>💳 Payment Method</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginTop: '0.3rem', margin: 0, textTransform: 'uppercase' }}>
                {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '⚡ Online Payment (Razorpay)'}
              </p>
              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.4rem' }}>
                {order.paymentStatus === 'paid' ? 'Paid Successfully' : 'Pending Payment'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

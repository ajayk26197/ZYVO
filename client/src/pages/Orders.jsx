import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'current';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'history') {
      setActiveTab('history');
    } else {
      setActiveTab('current');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      const name = item.name || item.food?.name;
      const price = item.price;
      const image = item.image || item.food?.image;
      addItem({ _id: item.food?._id || item.food || name, name, price, image }, item.qty);
    });
    toast.success('Items added to cart! 🛒');
    navigate('/cart');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return <span className="badge badge-warning">🍳 Preparing Order</span>;
      case 'on_the_way':
      case 'out_for_delivery':
        return <span className="badge badge-primary">🛵 Out for Delivery</span>;
      case 'delivered':
        return <span className="badge badge-success">🎉 Delivered</span>;
      case 'cancelled':
        return <span className="badge badge-error">❌ Cancelled</span>;
      default:
        return <span className="badge badge-warning">📝 Order Placed</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const isActive = ['pending', 'placed', 'confirmed', 'preparing', 'ready', 'on_the_way', 'out_for_delivery'].includes(o.status);
    if (activeTab === 'current') return isActive;
    if (activeTab === 'history') return !isActive;
    return true;
  });

  return (
    <div style={{ paddingTop: '6rem', paddingBottom: '4rem', background: 'var(--bg)', minHeight: '85vh' }}>
      <div className="container">
        <div className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <h1>{activeTab === 'current' ? '🛵 My Current Orders' : '📜 Previous Order History'}</h1>
          <p>
            {activeTab === 'current'
              ? 'Track your active food orders in real-time'
              : 'View and reorder from your past completed & cancelled orders'}
          </p>
        </div>

        {/* Tab Filters: Current Orders vs Order History */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { key: 'current', label: '🛵 Current Orders' },
            { key: 'history', label: '📜 Order History' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: 700,
                border: activeTab === tab.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: activeTab === tab.key ? 'var(--surface-2)' : '#ffffff',
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-3 text-center" style={{ background: '#ffffff', borderRadius: '20px', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>{activeTab === 'current' ? '🛵' : '📜'}</span>
            <h3>{activeTab === 'current' ? 'No active orders' : 'No order history found'}</h3>
            <p>
              {activeTab === 'current'
                ? 'You currently have no active food orders in progress.'
                : 'You have not placed any orders yet.'}
            </p>
            <Link to="/menu" className="btn btn-primary mt-2">Browse Menu 🍽️</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredOrders.map(order => {
              const isFinished = order.status === 'delivered' || order.status === 'cancelled';
              const remainingMin = order.estimatedMinutes || (isFinished ? 0 : 18);

              return (
                <div key={order._id} className="card p-3" style={{ background: '#ffffff', borderRadius: '20px' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800 }}>
                        ORDER #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {!isFinished && (
                        <span style={{ background: '#FFF0E6', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>
                          ⏱ {remainingMin} mins remaining
                        </span>
                      )}
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {order.items?.map((item, idx) => {
                      const img = item.image || item.food?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200';
                      const title = item.name || item.food?.name || 'Food Item';
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={img} alt={title} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.92rem', margin: 0 }}>{title}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Qty: {item.qty} × {formatPrice(item.price)}</p>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatPrice(item.price * item.qty)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>{formatPrice(order.total)}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                        {isFinished ? 'View Details 📄' : 'Live Track 🛵'}
                      </Link>
                      <button className="btn btn-outline btn-sm" onClick={() => handleReorder(order)}>
                        Reorder 🔄
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

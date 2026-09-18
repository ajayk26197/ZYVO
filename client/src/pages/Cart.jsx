import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Cart.module.css';

const Cart = () => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  if (items.length === 0) return (
    <div className={styles.empty}>
      <span className={styles.emptyEmoji}>🛒</span>
      <h2>Your cart is empty</h2>
      <p>Add some delicious items to get started</p>
      <Link to="/menu" className="btn btn-primary btn-lg">🍽️ Browse Menu</Link>
    </div>
  );

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (code === 'WELCOME20') {
      const d = Math.min(100, Math.round(subtotal * 0.2));
      setDiscount(d);
      toast.success('Coupon WELCOME20 applied!');
    } else if (code === 'ZYVO') {
      const d = Math.min(150, Math.round(subtotal * 0.15));
      setDiscount(d);
      toast.success('Coupon ZYVO applied!');
    } else if (code === 'FLAT50') {
      setDiscount(50);
      toast.success('Coupon FLAT50 applied!');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (!user) { navigate('/login'); return; }
    navigate('/checkout');
  };

  const finalTotal = Math.max(0, total - discount);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1>🛒 My Cart</h1>
          <button className="btn btn-ghost" onClick={clearCart}>🗑️ Clear All</button>
        </div>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.itemsList}>
            {items.map(item => <CartItem key={item._id} item={item} />)}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h3>Order Summary</h3>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
              <input
                className="form-input"
                placeholder="Apply Coupon (e.g. ZYVO)"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                style={{ padding: '0.6rem 0.8rem', fontSize: '0.88rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">Apply</button>
            </form>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? styles.free : ''}>
                  {deliveryFee === 0 ? '🎉 FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              {discount > 0 && (
                <div className={styles.summaryRow} style={{ color: 'var(--success)' }}>
                  <span>Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <p className={styles.freeHint}>
                  Add {formatPrice(500 - subtotal)} more for free delivery!
                </p>
              )}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Final Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button className="btn btn-primary w-full btn-lg" onClick={handleCheckout}>
              {user ? '💳 Proceed to Checkout' : '🔐 Login to Checkout'}
            </button>
            <Link to="/menu" className="btn btn-ghost w-full text-center mt-1">
              ← Continue Shopping
            </Link>

            {/* Security badges */}
            <div className={styles.securityBadges}>
              <span>🔒 SSL Secured</span>
              <span>⚡ Fast 30-Min Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

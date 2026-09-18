import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './MobileBottomNav.module.css';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/menu', label: 'Menu', icon: '🍕' },
    { path: '/orders', label: 'Orders', icon: '🛵' },
    ...(user ? [{ path: '/rewards', label: 'Rewards', icon: '🎁' }] : []),
    { path: user ? '/cart' : '/login', label: 'Cart', icon: '🛒', isCart: true },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <div className={styles.iconWrap}>
            <span>{item.icon}</span>
            {item.isCart && itemCount > 0 && (
              <span className={styles.badge}>{itemCount}</span>
            )}
          </div>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;

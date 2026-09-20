import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import ZyvoLogo from './ZyvoLogo';
import { useClickOutside } from '../hooks/useClickOutside';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const locationRef = useRef(null);
  const navLinksRef = useRef(null);
  const hamburgerRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [currentLoc, setCurrentLoc] = useState('Bandra West, Mumbai');
  const [search, setSearch] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);

  const LOCATIONS = ['Bandra West, Mumbai', 'Andheri East, Mumbai', 'Juhu, Mumbai', 'Powai, Mumbai', 'Connaught Place, Delhi', 'Indiranagar, Bengaluru'];

  // Close dropdowns on route change
  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
    setLocationOpen(false);
  }, [location]);

  // Click outside anywhere on web to close dropdowns & popups
  useClickOutside(locationRef, () => setLocationOpen(false), locationOpen);
  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);
  useClickOutside([navLinksRef, hamburgerRef], () => setMenuOpen(false), menuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Update Chrome tab favicon to user logo/avatar when logged in
  useEffect(() => {
    const favicon = document.querySelector("link[rel*='icon']");
    if (user) {
      const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FF5200&color=fff&rounded=true`;
      if (favicon) favicon.href = avatarUrl;
    } else {
      if (favicon) {
        favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='26' fill='%23FF5200'/><path d='M28 30H72L40 70H72' stroke='white' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'/></svg>";
      }
    }
  }, [user]);

  // Fetch active user order for navbar profile section
  useEffect(() => {
    if (!user) {
      setActiveOrder(null);
      return;
    }
    const fetchActiveOrder = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        const active = data.find(o => ['placed', 'confirmed', 'preparing', 'ready', 'on_the_way'].includes(o.status));
        if (active) {
          setActiveOrder(active);
        } else {
          setActiveOrder(null);
        }
      } catch {
        setActiveOrder(null);
      }
    };
    fetchActiveOrder();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/menu?q=${search.trim()}`); setSearch(''); }
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        <div className={styles.inner}>

          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <ZyvoLogo size={36} />
          </Link>

          {/* Location Selector */}
          <div className={styles.locationWrapper} ref={locationRef}>
            <button className={styles.locationBtn} onClick={() => setLocationOpen(p => !p)}>
              <span className={styles.locationPin}>📍</span>
              <span className={styles.locationText}>{currentLoc}</span>
              <span className={styles.locationArrow}>▼</span>
            </button>

            {locationOpen && (
              <div className={styles.locationDropdown}>
                <p className={styles.locTitle}>Select Delivery Location</p>
                {LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    className={`${styles.locOption} ${currentLoc === loc ? styles.locActive : ''}`}
                    onClick={() => { setCurrentLoc(loc); setLocationOpen(false); toast.success(`Location set to ${loc}`); }}
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search for food, dishes or restaurants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>

          {/* Nav Links */}
          <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`} ref={navLinksRef}>
            {/* Mobile Search Form (only visible in mobile dropdown) */}
            <li className={styles.mobileSearchItem}>
              <form className={styles.mobileSearchForm} onSubmit={handleSearch}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search food or dishes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </form>
            </li>

            <li><NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink></li>
            <li><NavLink to="/menu" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}>Menu</NavLink></li>
            <li><NavLink to="/orders" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}>Orders</NavLink></li>
            {user && <li className={styles.mobileOnly}><NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}>👤 Profile</NavLink></li>}
            {user && <li className={styles.desktopOnly}><NavLink to="/rewards" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}>Rewards 🎁</NavLink></li>}
            {isAdmin && <li><NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}>Admin</NavLink></li>}

            {user ? (
              <li className={styles.mobileDrawerLogout}>
                <button className={styles.drawerLogoutBtn} onClick={() => { logout(); setMenuOpen(false); }}>
                  🚪 Logout
                </button>
              </li>
            ) : (
              <li className={styles.mobileAuthItem}>
                <div className={styles.mobileAuthBtns}>
                  <Link to="/login" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/signup" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </div>
              </li>
            )}
          </ul>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Cart (Desktop only, mobile uses MobileBottomNav) */}
            <Link
              to={user ? "/cart" : "/login"}
              className={styles.cartBtn}
              onClick={() => {
                if (!user) {
                  toast.error('Please login to view cart and place orders! 🔒');
                }
              }}
            >
              <span>🛒</span>
              {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
            </Link>

            {/* Profile / Auth */}
            {user ? (
              <div className={styles.profileWrapper} ref={profileRef}>
                <button className={styles.avatarBtn} onClick={() => setProfileOpen(p => !p)} title="My Profile" aria-label="Open profile menu">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FC8019&color=fff`}
                    alt={user.name} className={styles.avatar} />
                </button>
                {profileOpen && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.profileHeader}>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>{user.email}</p>
                    </div>

                    <Link to="/orders?tab=current" className={styles.dropItem} onClick={() => setProfileOpen(false)}>
                      🛵 My Current Orders {activeOrder && <span style={{ marginLeft: 'auto', background: '#22c55e', color: '#fff', fontSize: '0.68rem', padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>LIVE</span>}
                    </Link>
                    <Link to="/orders?tab=history" className={styles.dropItem} onClick={() => setProfileOpen(false)}>📜 Order History</Link>
                    <Link to="/profile" className={styles.dropItem} onClick={() => setProfileOpen(false)}>👤 My Profile</Link>
                    {isAdmin && <Link to="/admin" className={styles.dropItem} onClick={() => setProfileOpen(false)}>⚙️ Admin Panel</Link>}
                    <button className={`${styles.dropItem} ${styles.logoutBtn}`} onClick={() => { logout(); setProfileOpen(false); }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={styles.authBtns}>
                  <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                  <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                </div>
                <Link to="/login" className={styles.mobileProfileBtn} title="Login / Profile" aria-label="Login">
                  <span className={styles.mobileProfileIcon}>👤</span>
                  <span className={styles.mobileProfileText}>Login</span>
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button className={styles.hamburger} ref={hamburgerRef} onClick={() => setMenuOpen(p => !p)} aria-label="Toggle Navigation Menu">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drawer backdrop to close on outside click */}
      {menuOpen && (
        <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ZyvoLogo from '../components/ZyvoLogo';
import styles from './Auth.module.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('user'); // 'user' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setShowPass(false);
    setForm({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (mode === 'admin') {
        // Verify the logged-in user is actually an admin
        if (data?.user?.role !== 'admin') {
          setError('Access denied. This account does not have admin privileges.');
          setLoading(false);
          return;
        }
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || (typeof err === 'string' ? err : err?.message) || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = mode === 'admin';

  return (
    <div className={styles.page}>
      {/* Left Panel */}
      <div className={styles.left} style={isAdmin ? {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 10px 30px rgba(99,102,241,0.2)',
      } : {}}>
        <div className={styles.leftContent}>
          <div style={{ marginBottom: '1rem' }}>
            <ZyvoLogo size={56} showText={false} />
          </div>
          {isAdmin ? (
            <>
              <h2 style={{ color: '#ffffff' }}>
                Admin <span style={{ color: '#818cf8', textShadow: '0 2px 12px rgba(129,140,248,0.5)' }}>Control</span><br />Panel
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Manage your ZYVO platform with full access.</p>
              <ul className={styles.perks}>
                {[
                  '📊 Dashboard & Analytics',
                  '🍔 Manage Food & Menu',
                  '📦 Monitor Orders',
                  '👥 Manage Customers',
                ].map(p => (
                  <li key={p} style={{ background: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.3)' }}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2>Welcome back to<br /><span style={{ color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>ZYVO!</span></h2>
              <p>Delicious food, lightning fast delivery.</p>
              <ul className={styles.perks}>
                {['🛵 30-min delivery', '🌿 Fresh ingredients', '💳 Secure payments', '🎁 Exclusive deals'].map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.right}>
        <div className={styles.formCard}>

          {/* Mode Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-alt)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '2rem',
            border: '1.5px solid var(--border)',
          }}>
            <button
              type="button"
              onClick={() => switchMode('user')}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.25s',
                background: !isAdmin ? 'var(--primary)' : 'transparent',
                color: !isAdmin ? '#fff' : 'var(--text-muted)',
                boxShadow: !isAdmin ? '0 4px 14px rgba(255,82,0,0.3)' : 'none',
              }}
            >
              👤 User Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('admin')}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.25s',
                background: isAdmin ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: isAdmin ? '#fff' : 'var(--text-muted)',
                boxShadow: isAdmin ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              🛡️ Admin Login
            </button>
          </div>

          <div className={styles.formHeader}>
            <h1>{isAdmin ? '🛡️ Admin Sign In' : 'Sign In'}</h1>
            <p>{isAdmin ? 'Access the ZYVO admin dashboard' : 'Enter your details to continue'}</p>
          </div>

          {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete={isAdmin ? 'off' : 'email'}
                style={isAdmin ? { borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.03)' } : {}}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.passWrapper}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={isAdmin ? 'new-password' : 'current-password'}
                  style={isAdmin ? { borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.03)' } : {}}
                />
                <button type="button" className={styles.showPass} onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {!isAdmin && (
              <div className={styles.forgotRow}>
                <a href="#" className={styles.forgotLink}>Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-lg w-full"
              disabled={loading}
              style={isAdmin ? {
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 18px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
              } : {}}
            >
              {loading
                ? '⏳ Signing in...'
                : isAdmin
                  ? '🛡️ Access Admin Panel'
                  : '🚀 Sign In'}
            </button>
          </form>

          {!isAdmin && (
            <>
              <div className={styles.dividerRow}>
                <span />or continue with<span />
              </div>
              <div className={styles.socialAuth}>
                <button className={styles.socialBtn}>🌐 Google</button>
                <button className={styles.socialBtn}>📘 Facebook</button>
              </div>
            </>
          )}

          <p className={styles.switchText}>
            {isAdmin
              ? <>Back to user login? <button type="button" onClick={() => switchMode('user')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}>Switch →</button></>
              : <>Don't have an account? <Link to="/signup">Create one →</Link></>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

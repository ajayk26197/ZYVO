import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ZyvoLogo from '../components/ZyvoLogo';
import styles from './Auth.module.css';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const ALLOWED_DOMAINS = [
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk',
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
    'icloud.com', 'me.com', 'mac.com',
    'aol.com', 'zoho.com', 'zohomail.in',
    'protonmail.com', 'proton.me',
    'rediffmail.com', 'yandex.com',
  ];

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Live match check
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.name.trim().length < 2)          { setError('Name must be at least 2 characters'); return; }

    const domain = form.email.split('@')[1]?.toLowerCase();
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
      setError('Please use a valid email (Gmail, Yahoo, Outlook, etc.)');
      return;
    }

    if (form.password.length < 6)             { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm)        { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await signup(form.name.trim(), form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div style={{ marginBottom: '1rem' }}>
            <ZyvoLogo size={56} showText={false} />
          </div>
          <h2>Join <span className="gradient-text">ZYVO</span><br />today!</h2>
          <p>Get exclusive deals and faster delivery.</p>
          <ul className={styles.perks}>
            {['🎁 Welcome bonus','⭐ Earn loyalty points','📱 Order tracking','🔔 Special alerts'].map(p => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1>Create Account</h1>
            <p>Start ordering in minutes</p>
          </div>

          {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" name="name"
                placeholder="John Doe" value={form.name}
                onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" name="email"
                placeholder="john@gmail.com" value={form.email}
                onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.passWrapper}>
                <input className="form-input" type={showPass ? 'text' : 'password'} name="password"
                  placeholder="Min 6 characters" value={form.password}
                  onChange={handleChange} required />
                <button type="button" className={styles.showPass} onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className={styles.passWrapper}>
                <input
                  className="form-input"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  style={form.confirm.length > 0 ? {
                    borderColor: passwordsMatch ? '#22c55e' : '#ef4444',
                    boxShadow: passwordsMatch
                      ? '0 0 0 3px rgba(34,197,94,0.15)'
                      : '0 0 0 3px rgba(239,68,68,0.15)'
                  } : {}}
                />
                <button type="button" className={styles.showPass} onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirm.length > 0 && (
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginTop: '0.35rem',
                  display: 'block',
                  color: passwordsMatch ? '#22c55e' : '#ef4444',
                }}>
                  {passwordsMatch ? '✅ Passwords match' : '❌ Passwords do not match'}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? '⏳ Creating...' : '✨ Create Account'}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

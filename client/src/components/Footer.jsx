import React from 'react';
import { Link } from 'react-router-dom';
import ZyvoLogo from './ZyvoLogo';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className="container">
      <div className={styles.grid}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logoBadge}>
            <ZyvoLogo size={34} />
          </Link>
          <p>Delicious food delivered fast to your doorstep. Order now and enjoy premium taste with ZYVO.</p>
          <div className={styles.socials}>
            {['📘 Facebook','📷 Instagram','🐦 Twitter','▶️ YouTube'].map(s => (
              <a key={s} href="#" className={styles.socialBtn}>{s.split(' ')[0]}</a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.col}>
          <h5>Quick Links</h5>
          <ul>
            {[['/', 'Home'],['/menu','Menu'],['/orders','Orders'],['/profile','Profile']].map(([to, label]) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className={styles.col}>
          <h5>Categories</h5>
          <ul>
            {['🍕 Pizza','🍔 Burgers','🍣 Sushi','🌮 Tacos','🥗 Salads','🍜 Noodles'].map(c => (
              <li key={c}><a href="#">{c}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h5>Contact</h5>
          <ul className={styles.contactList}>
            <li>📍 123 Food Street, Mumbai</li>
            <li>📞 +91 98765 43210</li>
            <li>✉️ hello@zyvo.com</li>
            <li>🕐 24/7 Delivery</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} ZYVO. All rights reserved.</p>
        <div className={styles.bottomLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalPopupHandler from './components/GlobalPopupHandler';
import AppRoutes from './routes/AppRoutes';
import './index.css';

const App = () => {
  const [theme] = useState(() => localStorage.getItem('theme') || 'fastfood');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <GlobalPopupHandler />
          <div className="app">
            <Navbar />
            <main>
              <AppRoutes />
            </main>
            <Footer />
            <MobileBottomNav />
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
            }}
          >
            {(t) => (
              <ToastBar toast={t}>
                {({ icon, message }) => (
                  <div
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                    title="Click anywhere to close"
                  >
                    {icon}
                    <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500 }}>{message}</div>
                    {t.type !== 'loading' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.dismiss(t.id);
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.06)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          marginLeft: '6px',
                        }}
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </ToastBar>
            )}
          </Toaster>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

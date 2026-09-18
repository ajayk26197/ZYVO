import React from 'react';

const ZyvoLogo = ({ size = 34, showText = true, className = '', textClassName = '' }) => {
  return (
    <div
      className={`zyvo-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0px 4px 10px rgba(255, 59, 48, 0.35))',
          flexShrink: 0,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="zyvo-logo-icon"
      >
        <defs>
          <linearGradient id="zyvoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="50%" stopColor="#FF8300" />
            <stop offset="100%" stopColor="#FF2D55" />
          </linearGradient>
          <linearGradient id="zyvoZGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFF0E6" />
          </linearGradient>
          <filter id="zyvoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer squircle badge */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="26"
          fill="url(#zyvoGradient)"
        />

        {/* Speed arcs in background */}
        <path
          d="M20 74 C 30 82, 50 86, 75 80"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M78 26 C 65 18, 40 16, 20 24"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Dynamic Stylized 'Z' Emblem with speed wings */}
        <path
          d="M 28 30 L 72 30 C 76 30 78 33 75 37 L 40 70 L 72 70 C 75 70 77 73 75 76 C 73 79 70 79 66 79 L 28 79 C 24 79 22 76 25 72 L 60 39 L 28 39 C 24 39 22 36 25 33 C 26 31 27 30 28 30 Z"
          fill="url(#zyvoZGrad)"
          filter="url(#zyvoGlow)"
        />

        {/* Speed Spark / Flame dot */}
        <circle cx="76" cy="24" r="5" fill="#FFE600" />
      </svg>

      {showText && (
        <span
          className={`zyvo-logo-text ${textClassName}`}
          style={{
            fontWeight: 800,
            fontSize: `${size * 0.65}px`,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'var(--text, #1e293b)' }}>ZY</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #FF3B30 0%, #FF8300 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            VO
          </span>
        </span>
      )}
    </div>
  );
};

export default ZyvoLogo;

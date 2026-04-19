// src/components/UI.jsx
import React from 'react';
import { hosColor, statusColor } from '../utils/theme';

/* ── Chip ─────────────────────────────────────────────────────────────────── */
export const Chip = ({ label, variant = 'blue', style = {} }) => {
  const map = {
    blue:   { bg: 'var(--blue-bg)',   color: 'var(--blue-text)',  border: 'var(--blue-border)' },
    green:  { bg: 'var(--green-bg)',  color: 'var(--green-text)', border: 'var(--green-border)' },
    amber:  { bg: 'var(--amber-bg)',  color: 'var(--amber-text)', border: 'var(--amber-border)' },
    red:    { bg: 'var(--red-bg)',    color: 'var(--red-text)',   border: 'var(--red-border)' },
    purple: { bg: 'var(--purple-bg)', color: 'var(--purple)',     border: 'var(--purple)' },
  };
  const v = map[variant] || map.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 'var(--radius-full)',
      border: `1px solid ${v.border}`, background: v.bg,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.4px',
      textTransform: 'uppercase', color: v.color, whiteSpace: 'nowrap',
      ...style,
    }}>{label}</span>
  );
};

/* ── ApiTag ───────────────────────────────────────────────────────────────── */
export const ApiTag = ({ label }) => (
  <span style={{
    background: 'var(--purple-bg)', border: '1px solid #ddd6fe',
    borderRadius: 3, padding: '1px 5px',
    fontSize: 9, color: 'var(--purple)', fontFamily: 'var(--font-mono)', fontWeight: 500,
    whiteSpace: 'nowrap',
  }}>{label}</span>
);

/* ── Card ─────────────────────────────────────────────────────────────────── */
export const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
    marginBottom: 12, overflow: 'hidden', ...style,
  }}>{children}</div>
);

export const CardHeader = ({ left, right }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '1px solid var(--border)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>{left}</div>
    {right && <div>{right}</div>}
  </div>
);

export const CardTitle = ({ icon, title, chip }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
    {chip && <div style={{ marginLeft: 2 }}>{chip}</div>}
  </div>
);

/* ── Button ───────────────────────────────────────────────────────────────── */
export const Btn = ({ label, onClick, variant = 'primary', size = 'md', disabled, loading }) => {
  const map = {
    primary: { bg: 'var(--primary)',    color: '#fff',              border: 'var(--primary)' },
    ghost:   { bg: 'var(--bg)',         color: 'var(--text2)',      border: 'var(--border)' },
    green:   { bg: 'var(--green-bg)',   color: 'var(--green-text)', border: 'var(--green-border)' },
    amber:   { bg: 'var(--amber-bg)',   color: 'var(--amber-text)', border: 'var(--amber-border)' },
    red:     { bg: 'var(--red-bg)',     color: 'var(--red-text)',   border: 'var(--red-border)' },
  };
  const v = map[variant] || map.primary;
  const pad = size === 'sm' ? '4px 9px' : '7px 14px';
  const fs = size === 'sm' ? 10 : 12;
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: v.bg, color: v.color, border: `1px solid ${v.border}`,
        borderRadius: 'var(--radius-md)', padding: pad, fontSize: fs,
        fontWeight: 600, letterSpacing: '0.2px', cursor: 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s, filter 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) e.target.style.filter = 'brightness(0.93)'; }}
      onMouseLeave={e => { e.target.style.filter = 'none'; }}
    >
      {loading ? '...' : label}
    </button>
  );
};

/* ── StatBox ──────────────────────────────────────────────────────────────── */
export const StatBox = ({ value, label, accent, valueColor }) => (
  <div style={{
    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
    padding: 12, flex: 1,
    borderLeft: accent ? `3px solid ${accent}` : undefined,
  }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: valueColor || 'var(--text)', lineHeight: 1.2, marginBottom: 3 }}>{value}</div>
    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
  </div>
);

/* ── HOSBar ───────────────────────────────────────────────────────────────── */
export const HOSBar = ({ hos, max = 11 }) => {
  const pct = Math.min(100, (hos / max) * 100);
  return (
    <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: hosColor(hos), borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
  );
};

/* ── SectionLabel ─────────────────────────────────────────────────────────── */
export const SectionLabel = ({ label, style = {} }) => (
  <div style={{
    fontSize: 10, fontWeight: 600, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, ...style,
  }}>{label}</div>
);

/* ── Divider ──────────────────────────────────────────────────────────────── */
export const Divider = ({ style = {} }) => (
  <div style={{ height: 1, background: 'var(--border)', margin: '10px 0', ...style }} />
);

/* ── DriverAvatar ─────────────────────────────────────────────────────────── */
export const DriverAvatar = ({ initials, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'var(--blue-bg)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <span style={{ fontSize: size * 0.35, fontWeight: 700, color: 'var(--primary)' }}>{initials}</span>
  </div>
);

/* ── StatusDot ────────────────────────────────────────────────────────────── */
export const StatusDot = ({ status, size = 8 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: statusColor(status), flexShrink: 0,
  }} />
);

// src/components/BottomNav.jsx
import React from 'react';

export const NAV_TABS = [
  { key: 'SmartDispatch', icon: '🎯', label: 'Dispatch',   badge: 1 },
  { key: 'HOSCompliance', icon: '⏱',  label: 'HOS',        badge: 2 },
  { key: 'ELDSafety',    icon: '🛡️', label: 'ELD',        badge: null },
  { key: 'Alerts',       icon: '🔔',  label: 'Alerts',     badge: 3 },
  { key: 'Billing',      icon: '💰',  label: 'Billing',    badge: null },
  { key: 'Inspection',   icon: '🔍',  label: 'Inspection', badge: null },
  { key: 'Profit',       icon: '📊',  label: 'Profit',     badge: null },
];

export const BottomNav = ({ activeTab, onTabPress }) => (
  <div style={{
    display: 'flex', background: 'var(--surface)',
    borderTop: '1px solid var(--border)', flexShrink: 0,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
  }}>
    {NAV_TABS.map(tab => {
      const active = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          onClick={() => onTabPress(tab.key)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '6px 4px', position: 'relative',
            borderTop: active ? '2px solid var(--primary)' : '2px solid transparent',
            background: active ? 'var(--blue-bg)' : 'transparent',
            cursor: 'pointer', transition: 'background 0.15s',
            border: 'none', borderTop: active ? '2px solid var(--primary)' : '2px solid transparent',
          }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)'; }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: 18, marginBottom: 1, lineHeight: 1 }}>{tab.icon}</span>
          <span style={{
            fontSize: 9, fontWeight: active ? 600 : 500, letterSpacing: '0.2px',
            color: active ? 'var(--primary)' : 'var(--text3)',
          }}>{tab.label}</span>
          {tab.badge && (
            <div style={{
              position: 'absolute', top: 4, right: '20%',
              width: 14, height: 14, borderRadius: '50%',
              background: active ? 'var(--primary-dark)' : 'var(--red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>{tab.badge}</span>
            </div>
          )}
        </button>
      );
    })}
  </div>
);

// src/components/SideNav.jsx
import React, { useState } from 'react';

const NAV_TABS = [
  { key: 'SmartDispatch', icon: '🎯', label: 'Dispatch',    badge: null },
  { key: 'HOSCompliance', icon: '⏱',  label: 'HOS',         badge: null },
  { key: 'ELDSafety',    icon: '🛡️', label: 'ELD & Map',   badge: null },
  { key: 'Alerts',       icon: '🔔',  label: 'Alerts',      badge: null },
  { key: 'Billing',      icon: '💰',  label: 'Billing',     badge: null },
  { key: 'Inspection',   icon: '🔍',  label: 'Inspection',  badge: null },
  { key: 'Profit',       icon: '📊',  label: 'Profit',      badge: null },
];

export const SideNav = ({ activeTab, onTabPress, alerts = [], drivers = [], isLive }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Dynamic badges from live data
  const critAlerts = alerts.filter(a => a.type === 'crit').length;
  const hosWarnings = drivers.filter(d => (d.hos || 11) < 4).length;

  const getBadge = (key) => {
    if (key === 'Alerts' && critAlerts > 0) return critAlerts;
    if (key === 'HOSCompliance' && hosWarnings > 0) return hosWarnings;
    return null;
  };

  return (
    <div style={{
      width: collapsed ? 60 : 200,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '10px 12px', background: 'none', border: 'none',
          borderBottom: '1px solid var(--border)', cursor: 'pointer',
          color: 'var(--text3)', fontSize: 14, flexShrink: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        {collapsed ? '»' : '«'}
      </button>

      {/* Nav items */}
      <div style={{ flex: 1, overflow: 'auto', paddingTop: 6 }}>
        {NAV_TABS.map(tab => {
          const active = activeTab === tab.key;
          const badge = getBadge(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => onTabPress(tab.key)}
              title={collapsed ? tab.label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '12px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
                borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                background: active ? 'var(--blue-bg)' : 'transparent',
                border: 'none',
                borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer', transition: 'background 0.15s',
                textAlign: 'left', flexShrink: 0,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Icon */}
              <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{tab.icon}</span>

              {/* Label — hidden when collapsed */}
              {!collapsed && (
                <span style={{
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--primary)' : 'var(--text2)',
                  whiteSpace: 'nowrap', flex: 1,
                }}>{tab.label}</span>
              )}

              {/* Badge */}
              {badge && (
                <div style={{
                  position: collapsed ? 'absolute' : 'static',
                  top: collapsed ? 6 : undefined, right: collapsed ? 6 : undefined,
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: 'var(--red)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{badge}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: live status indicator */}
      {!collapsed && (
        <div style={{
          padding: '10px 14px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isLive ? 'var(--green)' : 'var(--amber)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{isLive ? 'NavPro Live' : 'Demo Mode'}</span>
        </div>
      )}
    </div>
  );
};

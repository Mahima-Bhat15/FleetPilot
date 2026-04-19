// src/components/Topbar.jsx
import React, { useState, useEffect } from 'react';

export const Topbar = ({ onVoicePress, isLive }) => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      let h = now.getHours(), m = now.getMinutes();
      const ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${h}:${m < 10 ? '0' + m : m} ${ap}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--primary)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚛</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>FleetPilot</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>Intelligence Layer · NavPro</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 28 }}>
        {[
          { value: '6',      label: 'Trucks' },
          { value: '4',      label: 'Transit' },
          { value: '$24.5K', label: 'Revenue' },
          { value: '$0.87',  label: 'Avg CPM' },
          { value: '2',      label: 'HOS Alerts', color: '#fcd34d' },
        ].map(kpi => (
          <div key={kpi.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color || '#fff', lineHeight: 1.2 }}>{kpi.value}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>AI Active</span>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>{time}</span>
        <button onClick={onVoicePress} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '5px 12px', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
        >🎤 Ask Fleet</button>
        <div style={{ background: isLive ? 'rgba(0,200,83,0.2)' : 'rgba(255,255,255,0.12)', border: `1px solid ${isLive ? 'rgba(0,200,83,0.5)' : 'rgba(255,255,255,0.2)'}`, borderRadius: 20, padding: '3px 10px', fontSize: 10, color: '#fff', fontWeight: 500 }}>
          {isLive ? '● NavPro Live' : '○ Demo Mode'}
        </div>
      </div>
    </div>
  );
};

// src/components/Topbar.jsx
import React, { useState, useEffect } from 'react';

export const Topbar = ({ onVoicePress, viewMode, onViewModeChange }) => {
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

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 4 }}>
        <button
          onClick={() => onViewModeChange('live')}
          style={{
            background: viewMode === 'live' ? 'rgba(0,200,83,0.3)' : 'transparent',
            border: viewMode === 'live' ? '1px solid rgba(0,200,83,0.6)' : '1px solid transparent',
            borderRadius: 6,
            padding: '6px 16px',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          onMouseEnter={e => {
            if (viewMode !== 'live') e.target.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={e => {
            if (viewMode !== 'live') e.target.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 10 }}>{viewMode === 'live' ? '●' : '○'}</span>
          Live
        </button>
        <button
          onClick={() => onViewModeChange('demo')}
          style={{
            background: viewMode === 'demo' ? 'rgba(59,130,246,0.3)' : 'transparent',
            border: viewMode === 'demo' ? '1px solid rgba(59,130,246,0.6)' : '1px solid transparent',
            borderRadius: 6,
            padding: '6px 16px',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          onMouseEnter={e => {
            if (viewMode !== 'demo') e.target.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={e => {
            if (viewMode !== 'demo') e.target.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 10 }}>{viewMode === 'demo' ? '●' : '○'}</span>
          Demo
        </button>
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
      </div>
    </div>
  );
};

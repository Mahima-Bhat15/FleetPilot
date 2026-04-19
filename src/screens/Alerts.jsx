// src/screens/Alerts.jsx
import React, { useState, useEffect } from 'react';
import { StatBox, SectionLabel } from '../components/UI';
const TYPE_CONFIG = {
  crit: { bg: 'var(--red-bg)',   border: 'var(--red-border)',   label: 'Critical', color: 'var(--red)',   textColor: 'var(--red-text)' },
  warn: { bg: 'var(--amber-bg)', border: 'var(--amber-border)', label: 'Warning',  color: 'var(--amber)', textColor: 'var(--amber-text)' },
  info: { bg: 'var(--blue-bg)',  border: 'var(--blue-border)',  label: 'Info',     color: 'var(--primary)', textColor: 'var(--blue-text)' },
};

export const Alerts = ({ alerts: liveAlerts, onAlertDismiss }) => {
  const [alerts, setAlerts] = useState(liveAlerts || []);
  const [resolved, setResolved] = useState([]);

  // Sync when live alerts update from the data hook
  useEffect(() => {
    if (liveAlerts && liveAlerts.length > 0) setAlerts(liveAlerts);
  }, [liveAlerts]);

  const handleAction = (alertId, action) => {
    alert(`✅ Action: ${action}\n\nFleetPilot has dispatched your request.\n\n🤖 AI is processing: ${action}`);
    if (action === 'Dismiss') {
      setResolved(prev => [...prev, alertId]);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <StatBox value={alerts.filter(a => a.type === 'crit').length.toString()} label="Critical"  accent="var(--red)"     valueColor="var(--red)" />
        <StatBox value={alerts.filter(a => a.type === 'warn').length.toString()} label="Warning"   accent="var(--amber)"   valueColor="var(--amber)" />
        <StatBox value={alerts.filter(a => a.type === 'info').length.toString()} label="Info"      accent="var(--primary)" valueColor="var(--primary)" />
        <StatBox value={resolved.length.toString()}                              label="Resolved"  accent="var(--green)"   valueColor="var(--green)" />
      </div>

      <SectionLabel label={`${alerts.length} Active Alerts — AI Action Prepared`} />

      {alerts.map(alert => {
        const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.info;
        return (
          <div key={alert.id} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 'var(--radius-lg)', padding: 12, marginBottom: 10 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ background: cfg.color + '22', border: `1px solid ${cfg.color}`, borderRadius: 'var(--radius-full)', padding: '2px 7px' }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: cfg.color }}>{cfg.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{alert.driver}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{alert.truck}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{alert.time}</span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>{alert.desc}</p>

            <div style={{ background: 'rgba(0,87,184,0.07)', borderRadius: 'var(--radius-md)', padding: 9, marginBottom: 9 }}>
              <span style={{ fontSize: 11, color: 'var(--primary)', fontStyle: 'italic', lineHeight: 1.6 }}>🤖 {alert.ai}</span>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {alert.btns.map((btn, i) => (
                <button key={btn} onClick={() => handleAction(alert.id, btn)} style={{
                  border: `1px solid ${i === 0 ? cfg.color : 'var(--border)'}`,
                  background: i === 0 ? cfg.color : 'var(--surface)',
                  borderRadius: 'var(--radius-md)', padding: '5px 10px',
                  fontSize: 10, fontWeight: 600, color: i === 0 ? '#fff' : 'var(--text2)',
                  cursor: 'pointer', transition: 'filter 0.15s',
                }}
                  onMouseEnter={e => e.target.style.filter = 'brightness(0.9)'}
                  onMouseLeave={e => e.target.style.filter = 'none'}
                >{btn}</button>
              ))}
              <button onClick={() => handleAction(alert.id, 'Dismiss')} style={{
                border: '1px solid var(--border)', background: 'var(--surface)',
                borderRadius: 'var(--radius-md)', padding: '5px 10px',
                fontSize: 10, fontWeight: 600, color: 'var(--text3)', cursor: 'pointer',
              }}>Dismiss</button>
            </div>
          </div>
        );
      })}

      {alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>All Clear</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>No active alerts. FleetPilot is monitoring your fleet.</div>
        </div>
      )}
    </div>
  );
};

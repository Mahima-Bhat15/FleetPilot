// src/screens/ELDSafety.jsx
import React, { useState } from 'react';
import { statusColor, hosColor } from '../utils/theme';
import { DRIVERS } from '../data/mockData';

const ELD_FIELDS = [
  { key: 'fuel',   label: 'Fuel Level',    unit: '%',  icon: '⛽', thresh: v => v < 30 ? 'crit' : v < 50 ? 'warn' : 'ok' },
  { key: 'speed',  label: 'Current Speed', unit: 'mph', icon: '🚛', thresh: v => v > 65 ? 'warn' : 'ok', display: v => v === 0 ? 'Parked' : `${v} mph` },
  { key: 'tire',   label: 'Tire Pressure', unit: '',   icon: '🔄', thresh: v => v !== 'OK' ? 'crit' : 'ok', display: v => v },
  { key: 'engine', label: 'Engine Status', unit: '',   icon: '🔧', thresh: v => v !== 'OK' ? 'warn' : 'ok', display: v => v },
  { key: 'brake',  label: 'Brake System',  unit: '',   icon: '🛑', thresh: v => v === 'FAIL' ? 'crit' : v === 'WARN' ? 'warn' : 'ok', display: v => v },
  { key: 'temp',   label: 'Coolant Temp',  unit: '°F', icon: '🌡️', thresh: v => v > 225 ? 'crit' : v > 220 ? 'warn' : 'ok' },
];

const SEV = {
  ok:   { val: 'var(--green)', bg: 'var(--green-bg)',  label: 'Normal' },
  warn: { val: 'var(--amber)', bg: 'var(--amber-bg)',  label: 'Warning' },
  crit: { val: 'var(--red)',   bg: 'var(--red-bg)',    label: 'Critical' },
};

export const ELDSafety = ({ drivers: liveDrivers }) => {
  const [selected, setSelected] = useState(0);

  // Use live drivers from API if available, otherwise fall back to mock data
  const driverList = liveDrivers && liveDrivers.length > 0 ? liveDrivers : DRIVERS;
  const driver = driverList[Math.min(selected, driverList.length - 1)] || driverList[0];

  // Map layout — place drivers on a rough US Southwest grid
  // Bounding box: lat 30–37, lng -115 to -104
  const mapDrivers = driverList.map(d => ({
    ...d,
    x: d.lng ? ((Math.abs(d.lng) - 104) / 11) * 100 : 20 + (driverList.indexOf(d) * 15) % 60,
    y: d.lat ? ((37 - d.lat) / 7) * 100 : 20 + (driverList.indexOf(d) * 20) % 50,
  }));

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Left: Truck list */}
      <div style={{ width: 100, background: 'var(--surface)', borderRight: '1px solid var(--border)', paddingTop: 8, overflow: 'auto', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 8px', marginBottom: 6 }}>Fleet</div>
        {driverList.map((d, i) => (
          <button key={d.id} onClick={() => setSelected(i)} style={{
            width: '100%', display: 'flex', alignItems: 'flex-start', gap: 5,
            padding: '8px', borderBottom: '1px solid var(--border)',
            background: selected === i ? 'var(--blue-bg)' : 'transparent',
            cursor: 'pointer', textAlign: 'left',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor(d.status), marginTop: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: selected === i ? 'var(--primary)' : 'var(--text)', fontFamily: 'var(--font-mono)' }}>{d.id}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{d.name.split(' ')[0]}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: hosColor(d.hos), fontFamily: 'var(--font-mono)' }}>{d.hos}h HOS</div>
            </div>
            {d.status === 'Dark' && <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--red)', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginLeft: 'auto' }}>!</div>}
          </button>
        ))}
      </div>

      {/* Center: Map */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)' }}>Live Fleet Map — Southwest US</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${statusColor(driver.status)}`, borderRadius: 'var(--radius-full)', padding: '3px 8px', background: statusColor(driver.status) + '22' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor(driver.status) }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(driver.status) }}>{driver.status}</span>
          </div>
        </div>

        {/* SVG Map */}
        <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(135deg, #e8f0fe 0%, #dbeafe 50%, #e0f2fe 100%)', overflow: 'hidden' }}>
          {/* Grid lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
            {[0,25,50,75,100].map(p => (
              <React.Fragment key={p}>
                <line x1={`${p}%`} y1="0%" x2={`${p}%`} y2="100%" stroke="#0057B8" strokeWidth="1" />
                <line x1="0%" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#0057B8" strokeWidth="1" />
              </React.Fragment>
            ))}
          </svg>
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#0057B8', opacity: 0.4, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 1 }}>SOUTHWEST US</div>

          {/* Driver pins */}
          {mapDrivers.map((d, i) => (
            <button key={d.id} onClick={() => setSelected(i)} style={{
              position: 'absolute',
              left: `${Math.max(5, Math.min(90, d.x))}%`,
              top: `${Math.max(5, Math.min(85, d.y))}%`,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.95)',
              border: `${i === selected ? 2.5 : 1.5}px solid ${statusColor(d.status)}`,
              borderRadius: 6, padding: '3px 6px',
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: i === selected ? `0 0 0 3px ${statusColor(d.status)}44` : 'var(--shadow-sm)',
              transition: 'all 0.2s',
              zIndex: i === selected ? 10 : 1,
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: statusColor(d.status), fontFamily: 'var(--font-mono)' }}>{d.id.replace('TRK-', '#')}</span>
            </button>
          ))}

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 10, flexWrap: 'wrap', background: 'rgba(255,255,255,0.92)', borderRadius: 'var(--radius-md)', padding: 6, border: '1px solid var(--border)' }}>
            {[['Available', 'var(--green)'], ['In Transit', 'var(--primary)'], ['Warning', 'var(--amber)'], ['Dark', 'var(--red)']].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 9, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Live ELD */}
      <div style={{ width: 210, background: 'var(--surface)', borderLeft: '1px solid var(--border)', paddingTop: 10, paddingInline: 8, overflow: 'auto', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Live ELD — {driver.id}</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>{driver.name}</div>

        {driver.eld === null ? (
          <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔴</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red-text)' }}>No ELD signal</div>
            <div style={{ fontSize: 11, color: 'var(--red-text)', marginTop: 4 }}>Last known: I-10 MM188</div>
            <button onClick={() => alert('📞 Calling driver...')} style={{ marginTop: 8, background: 'var(--red)', border: 'none', borderRadius: 'var(--radius-md)', padding: '5px 14px', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Call Driver</button>
          </div>
        ) : (
          <>
            {ELD_FIELDS.map(field => {
              const raw = driver.eld[field.key];
              const sev = field.thresh(raw);
              const cfg = SEV[sev];
              const display = field.display ? field.display(raw) : `${raw}${field.unit}`;
              return (
                <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 8, background: cfg.bg, border: `1px solid ${cfg.val}44`, borderRadius: 'var(--radius-md)', padding: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{field.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 1 }}>{field.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: cfg.val, fontFamily: 'var(--font-mono)' }}>{display}</div>
                  </div>
                  <div style={{ border: `1px solid ${cfg.val}66`, borderRadius: 'var(--radius-full)', padding: '2px 5px', background: cfg.val + '22' }}>
                    <span style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', color: cfg.val }}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {[['Odometer', `${driver.eld.odometer?.toLocaleString()} mi`], ['RPM', driver.eld.rpm], ['Qualify', driver.qual, 'var(--primary)'], ['On-Time', `${driver.ontime}%`, driver.ontime >= 90 ? 'var(--green)' : 'var(--amber)']].map(([label, value, color]) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 5, border: '1px solid var(--border)', padding: 6, minWidth: '45%', flex: 1 }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: color || 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

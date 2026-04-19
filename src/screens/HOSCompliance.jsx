// src/screens/HOSCompliance.jsx
import React, { useState } from 'react';
import { hosColor } from '../utils/theme';
import { Card, CardHeader, CardTitle, Chip, ApiTag, Divider } from '../components/UI';
import { DRIVERS, HOS_RULES } from '../data/mockData';

export const HOSCompliance = ({ drivers: liveDrivers, onDriverSelect }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [expandedRule, setExpandedRule] = useState(null);
  const driverList = liveDrivers && liveDrivers.length > 0 ? liveDrivers : DRIVERS;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      {/* FMCSA Rules Accordion */}
      <Card>
        <button
          onClick={() => setRulesOpen(prev => !prev)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <CardHeader
            left={<CardTitle icon="⏱" title="FMCSA HOS Rules" chip={<Chip label="49 CFR Part 395" variant="blue" />} />}
            right={(
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ApiTag label="ELD feed · §395" />
                <span style={{ fontSize: 22, color: 'var(--text3)', transform: rulesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              </div>
            )}
          />
        </button>
        {rulesOpen && (
          <div style={{ padding: 12, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            {HOS_RULES.map((rule, idx) => {
              const isOpen = expandedRule === idx;
              return (
                <div key={idx} style={{ marginBottom: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface)' }}>
                  <button
                    onClick={() => setExpandedRule(isOpen ? null : idx)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 12, background: isOpen ? 'var(--blue-bg)' : 'var(--surface)',
                      borderBottom: isOpen ? '1px solid var(--blue-border)' : 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <span style={{ fontSize: 20, width: 28 }}>{rule.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{rule.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rule.regulation}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isOpen && <span style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.summary}</span>}
                      <span style={{ fontSize: 20, color: 'var(--text3)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                    </div>
                  </button>
                  {isOpen && (
                    <div style={{ background: 'var(--blue-bg)', padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{rule.summary}</div>
                      <Divider style={{ margin: '6px 0' }} />
                      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{rule.detail}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Live HOS Table */}
      <Card>
        <CardHeader
          left={<CardTitle icon="📊" title="Live HOS Status — All Drivers" />}
          right={<ApiTag label="/v1/drivers/hos" />}
        />
        <div style={{ padding: 12 }}>
          {driverList.map(d => (
            <HOSDriverRow key={d.id} driver={d} onPress={() => onDriverSelect && onDriverSelect(d)} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const HOSDriverRow = ({ driver: d, onPress }) => {
  const hosClr = hosColor(d.hos);
  const driveW = Math.min(100, (d.hos / 11) * 100);
  const cycleClr = d.cycle > 65 ? 'var(--red)' : d.cycle > 55 ? 'var(--amber)' : 'var(--primary)';
  const cycleW = Math.min(100, (d.cycle / 70) * 100);

  let statusVariant = 'green', statusLabel = 'Compliant';
  if (d.hos < 2 || d.cycle > 65) { statusVariant = 'red'; statusLabel = 'VIOLATION RISK'; }
  else if (d.hos < 4 || d.cycle > 55) { statusVariant = 'amber'; statusLabel = 'Near Limit'; }

  return (
    <div
      onClick={onPress}
      style={{
        padding: 10, borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', cursor: 'pointer', transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{d.name}</span>
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{d.id}</span>
        <Chip label={statusLabel} variant={statusVariant} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Drive time */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Drive time</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${driveW}%`, background: hosClr, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: hosClr, minWidth: 36 }}>{d.hos}h</span>
          </div>
        </div>
        {/* 70h cycle */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>70h cycle</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${cycleW}%`, background: cycleClr, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: cycleClr, minWidth: 36 }}>{d.cycle}/70h</span>
          </div>
        </div>
        {/* 14h window */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>14h window</div>
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: d.window && d.window < 2 ? 'var(--red)' : d.window && d.window < 4 ? 'var(--amber)' : 'var(--green)' }}>
            {d.window !== null ? `${d.window}h left` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

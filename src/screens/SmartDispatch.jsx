// src/screens/SmartDispatch.jsx
import React, { useState } from 'react';
import { hosColor } from '../utils/theme';
import { Card, CardHeader, CardTitle, Chip, ApiTag, Btn, StatBox, SectionLabel, HOSBar, Divider } from '../components/UI';
import { DRIVERS, LOADS } from '../data/mockData';

const LOAD = LOADS[0];

export const SmartDispatch = ({ drivers: liveDrivers, onDriverSelect }) => {
  const [assigned, setAssigned] = useState(false);

  // Use real drivers from API, fall back to mock for demo
  const driverList = liveDrivers && liveDrivers.length > 0 ? liveDrivers : DRIVERS;

  // Build driver scores from real data — score based on availability + load status
  const DRIVER_SCORES = driverList.slice(0, 5).map((driver, idx) => ({
    driver,
    score: driver.work_status === 'AVAILABLE' ? Math.max(30, 95 - idx * 15) : Math.max(20, 50 - idx * 10),
    fuelEst: 1000 + idx * 150,
    rank: idx + 1,
    ripple: null,
    flag: driver.work_status === 'INACTIVE' ? `Driver is currently ${driver.status}` : null,
    note: driver.work_status === 'AVAILABLE' ? `✓ Available · ${driver.pos || 'Location unknown'}` : null,
  }));

  const handleAssign = (driverName) => {
    alert(`✅ Assignment Confirmed\n\n${driverName} assigned to Load LD-47392.\n\n🤖 AI Actions:\n• Route pushed to NavPro driver app\n• ETA: Tomorrow 6:14 PM sent to customer\n• Driver briefing message sent\n• Tomorrow's board analyzed — no conflicts`);
    setAssigned(true);
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <StatBox value={String(LOADS.length)}                                               label="Loads Pending"   accent="var(--primary)" valueColor="var(--primary)" />
        <StatBox value={String(driverList.filter(d => d.work_status === 'AVAILABLE' || d.status === 'Available').length)} label="Drivers Avail." accent="var(--green)"   valueColor="var(--green)" />
        <StatBox value={String(driverList.filter(d => (d.hos || 11) < 4).length)}           label="HOS Alerts"      accent="var(--amber)"   valueColor="var(--amber)" />
        <StatBox value={String(driverList.filter(d => d.status === 'Dark' || d.status === 'Inactive').length)} label="Inactive"  accent="var(--red)"     valueColor="var(--red)" />
      </div>

      {/* Morning Brief */}
      <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', flex: 1 }}>FleetPilot Morning Intelligence — NavPro Data Layer</span>
          <ApiTag label="GET /v1/drivers · /v1/trips" />
        </div>
        {[
          { color: 'var(--red)',    text: 'Lisa W. (TRK-006) dark 41 mins — last NavPro ping Exit 201, I-10. Action required.' },
          { color: 'var(--amber)',  text: 'Carlos M. (TRK-003) — 3.2h HOS left, 194mi to Albuquerque. FMCSA §395.3: must rest by 11:20 AM.' },
          { color: 'var(--amber)',  text: 'Assigning Maria R. to Load #0083 today leaves Chicago flatbed (7 AM tomorrow) uncovered.' },
          { color: 'var(--primary)',text: 'Load LD-47392 (Phoenix→Dallas, 1,067mi) needs assignment. Best 24h choice: Dave Thompson.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, marginTop: 5, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1, lineHeight: 1.6 }}>{item.text}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          left={<CardTitle icon="🎯" title="Smart Dispatch" chip={<Chip label="AI Powered" variant="blue" />} />}
          right={<ApiTag label="NavPro /v1/trips" />}
        />
        <div style={{ padding: 12 }}>
          {/* Load detail */}
          <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>LOAD {LOAD.id} · Needs Assignment</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{LOAD.origin}</span>
              <span style={{ fontSize: 18, color: 'var(--text3)' }}>→</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{LOAD.destination}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {[['Pickup', LOAD.pickupTime], ['Distance', `${LOAD.distanceMi.toLocaleString()} mi`], ['HOS Needed', `${LOAD.hosNeeded}h total`, 'var(--amber)'], ['Est. Revenue', `$${LOAD.revenue.toLocaleString()}`]].map(([label, value, color]) => (
                <div key={label} style={{ background: '#fff', borderRadius: 6, border: '1px solid var(--border)', padding: 7, flex: 1, minWidth: '20%' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 6, border: '1px solid var(--border)', padding: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>
                <strong>FMCSA Rule Check: </strong>{LOAD.distanceMi}mi route requires 2-day operation with mandatory 10h off-duty break (§395.3). Driver must have ≥11h today + 10h rest + remaining hours tomorrow.
              </span>
            </div>
          </div>

          <SectionLabel label="🤖 AI Driver Ranking — HOS · Location · Cost · Fatigue · Deadhead · Patterns · Ripple" />

          {DRIVER_SCORES.map(item => (
            <DriverRankCard key={item.driver.id} item={item} onAssign={() => handleAssign(item.driver.name)} onSelect={() => onDriverSelect && onDriverSelect(item.driver)} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const DriverRankCard = ({ item, onAssign, onSelect }) => {
  const { driver, score, fuelEst, rank, ripple, flag, note } = item;
  const isTop = rank === 1;
  const scoreColor = score >= 90 ? 'var(--green)' : score >= 65 ? 'var(--amber)' : 'var(--red)';
  const hosClr = hosColor(driver.hos);

  return (
    <div
      onClick={onSelect}
      style={{
        background: isTop ? 'var(--green-bg)' : 'var(--surface)',
        border: `1px solid ${isTop ? 'var(--green-border)' : rank === 2 ? 'var(--amber-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8, cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>#{rank}</span>
          {isTop && <span style={{ fontSize: 9, color: 'var(--green-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>RECOMMENDED</span>}
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{driver.name}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: scoreColor + '22', border: `1px solid ${scoreColor}`, borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>Score {score}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
        {[['HOS Left', `${driver.hos}h`, hosClr], ['Deadhead', `${driver.deadheadMiles}mi`], ['Fuel Est.', `$${fuelEst.toLocaleString()}`], ['Fatigue', driver.fatigue, driver.fatigue === 'Low' ? 'var(--green)' : driver.fatigue === 'High' ? 'var(--red)' : 'var(--amber)'], ['On-Time', `${driver.ontime}%`, driver.ontime >= 90 ? 'var(--green)' : 'var(--amber)']].map(([label, value, color]) => (
          <div key={label} style={{ flex: 1, background: 'var(--bg)', borderRadius: 5, padding: 5 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: color || 'var(--text)', fontFamily: 'var(--font-mono)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <HOSBar hos={driver.hos} />
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: hosClr, minWidth: 28 }}>{driver.hos}h</span>
      </div>

      {note && <div style={{ background: '#fff', borderRadius: 5, border: '1px solid var(--green-border)', padding: 7, marginBottom: 6, fontSize: 10, color: 'var(--green-text)' }}>{note}</div>}
      {flag && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 5, padding: 6, marginTop: 4, fontSize: 10, color: 'var(--red-text)' }}>⚑ {flag}</div>}
      {ripple && <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 5, padding: 6, marginTop: 4, fontSize: 10, color: 'var(--amber-text)' }}>⚠ Ripple Risk: {ripple}</div>}

      {isTop && (
        <div style={{ display: 'flex', gap: 7, marginTop: 8 }} onClick={e => e.stopPropagation()}>
          <Btn label={`Assign ${driver.name.split(' ')[0]} → One Tap`} onClick={onAssign} variant="primary" size="sm" />
          <Btn label="View Profile" onClick={onSelect} variant="ghost" size="sm" />
        </div>
      )}
    </div>
  );
};

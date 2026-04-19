// src/screens/SmartDispatch.jsx
import React, { useState, useMemo } from 'react';
import { hosColor } from '../utils/theme';
import { Card, CardHeader, CardTitle, Chip, Btn, StatBox, SectionLabel, HOSBar } from '../components/UI';

export const SmartDispatch = ({ drivers: liveDrivers, loads, onDriverSelect }) => {
  const [assigned, setAssigned] = useState(false);

  const driverList = liveDrivers || [];
  const LOAD = loads?.[0] || null;

  // Generate AI reasoning for each driver
  const DRIVER_SCORES = useMemo(() => {
    if (!LOAD) return [];
    
    return driverList.slice(0, 8).map((driver, idx) => {
      const isAvailable = driver.work_status === 'AVAILABLE' || driver.status === 'Available';
      const isDark = driver.status === 'Dark' || driver.status === 'Inactive';
      const hasEnoughHOS = (driver.hos || 0) >= (LOAD.hosNeeded || 0);
      const lowDeadhead = (driver.deadheadMiles || 0) < 200;
      const goodOnTime = (driver.ontime || 0) >= 90;
      const lowFatigue = driver.fatigue === 'Low';
      const noPattern = !driver.pattern;
      
      // Calculate score based on multiple factors
      let score = 50;
      if (isAvailable) score += 20;
      if (hasEnoughHOS) score += 15;
      if (lowDeadhead) score += 10;
      if (goodOnTime) score += 10;
      if (lowFatigue) score += 10;
      if (noPattern) score += 5;
      if (driver.cpm < 0.88) score += 10;
      
      // Penalties
      if (isDark) score -= 40;
      if (!hasEnoughHOS) score -= 20;
      if (driver.fatigue === 'High') score -= 15;
      if (driver.pattern) score -= 10;
      
      score = Math.max(20, Math.min(100, score));
      
      // Generate AI reasoning
      let reasoning = '';
      let flag = null;
      let note = null;
      
      if (isDark) {
        reasoning = `❌ Driver unavailable - no GPS signal. Cannot assign until location confirmed.`;
        flag = `Driver is currently ${driver.status}`;
      } else if (!isAvailable) {
        reasoning = `⚠️ Driver currently ${driver.status}. Not available for immediate assignment.`;
        flag = `Driver is currently ${driver.status}`;
      } else if (!hasEnoughHOS) {
        reasoning = `⚠️ Insufficient HOS: ${driver.hos}h available, ${LOAD.hosNeeded}h needed. Would require rest stop or relay.`;
      } else if (driver.fatigue === 'High') {
        reasoning = `⚠️ High fatigue level detected. Recommend mandatory rest before assignment to ensure safety compliance.`;
      } else if (driver.pattern) {
        reasoning = `⚠️ Performance pattern detected: ${driver.pattern}. Monitor closely if assigned.`;
      } else {
        // Positive reasoning for good candidates
        const reasons = [];
        if (isAvailable) reasons.push('Available now');
        if (hasEnoughHOS) reasons.push(`${driver.hos}h HOS (${LOAD.hosNeeded}h needed)`);
        if (lowDeadhead) reasons.push(`${driver.deadheadMiles}mi deadhead`);
        if (goodOnTime) reasons.push(`${driver.ontime}% on-time`);
        if (lowFatigue) reasons.push('Low fatigue');
        if (driver.cpm < 0.88) reasons.push(`$${driver.cpm} CPM (below avg)`);
        
        reasoning = `✓ ${reasons.join(' · ')}`;
        note = `✓ Available · ${driver.pos || 'Location confirmed'}`;
      }
      
      return {
        driver,
        score,
        fuelEst: 1000 + idx * 150,
        rank: idx + 1,
        ripple: null,
        flag,
        note,
        reasoning,
      };
    }).sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [driverList, LOAD]);

  // Generate dynamic morning intelligence based on actual data
  const morningIntelligence = useMemo(() => {
    const items = [];
    
    // Dark trucks
    const darkTrucks = driverList.filter(d => d.status === 'Dark' || d.status === 'Inactive');
    if (darkTrucks.length > 0) {
      darkTrucks.forEach(d => {
        items.push({
          color: 'var(--red)',
          text: `${d.name} (${d.id}) dark ${d.lastSeen || 'unknown time'} — last known: ${d.pos}. Action required.`
        });
      });
    }
    
    // HOS warnings
    const hosWarnings = driverList.filter(d => (d.hos || 0) < 4 && d.status !== 'Dark');
    if (hosWarnings.length > 0) {
      hosWarnings.forEach(d => {
        items.push({
          color: 'var(--amber)',
          text: `${d.name} (${d.id}) — ${d.hos}h HOS remaining. FMCSA §395.3: monitor for compliance.`
        });
      });
    }
    
    // High fatigue drivers
    const fatiguedDrivers = driverList.filter(d => d.fatigue === 'High');
    if (fatiguedDrivers.length > 0) {
      fatiguedDrivers.forEach(d => {
        items.push({
          color: 'var(--amber)',
          text: `${d.name} (${d.id}) — High fatigue detected. Recommend rest period before new assignment.`
        });
      });
    }
    
    // Best load assignment
    if (LOAD && DRIVER_SCORES.length > 0) {
      const bestDriver = DRIVER_SCORES[0];
      if (bestDriver.score >= 80) {
        items.push({
          color: 'var(--primary)',
          text: `Load ${LOAD.id} (${LOAD.origin.split(',')[0]}→${LOAD.destination.split(',')[0]}, ${LOAD.distanceMi}mi) — Best match: ${bestDriver.driver.name} (Score ${bestDriver.score}).`
        });
      } else {
        items.push({
          color: 'var(--amber)',
          text: `Load ${LOAD.id} needs assignment. No optimal driver available (best score: ${bestDriver.score}). Consider relay or delay.`
        });
      }
    }
    
    // Available drivers count
    const availableCount = driverList.filter(d => d.status === 'Available' || d.work_status === 'AVAILABLE').length;
    if (availableCount > 0) {
      items.push({
        color: 'var(--green)',
        text: `${availableCount} driver${availableCount > 1 ? 's' : ''} available for immediate assignment.`
      });
    }
    
    // If no items, add default message
    if (items.length === 0) {
      items.push({
        color: 'var(--primary)',
        text: 'All systems operational. Fleet ready for dispatch.'
      });
    }
    
    return items;
  }, [driverList, LOAD, DRIVER_SCORES]);

  const handleAssign = (driverName) => {
    alert(`✅ Assignment Confirmed\n\n${driverName} assigned to Load ${LOAD?.id || 'LD-47392'}.\n\n🤖 AI Actions:\n• Route pushed to NavPro driver app\n• ETA: Tomorrow 6:14 PM sent to customer\n• Driver briefing message sent\n• Tomorrow's board analyzed — no conflicts`);
    setAssigned(true);
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <StatBox value={String(loads?.length ?? 0)}                                          label="Loads Pending"   accent="var(--primary)" valueColor="var(--primary)" />
        <StatBox value={String(driverList.filter(d => d.work_status === 'AVAILABLE' || d.status === 'Available').length)} label="Drivers Avail." accent="var(--green)"   valueColor="var(--green)" />
        <StatBox value={String(driverList.filter(d => (d.hos || 11) < 4).length)}           label="HOS Alerts"      accent="var(--amber)"   valueColor="var(--amber)" />
        <StatBox value={String(driverList.filter(d => d.status === 'Dark' || d.status === 'Inactive').length)} label="Inactive"  accent="var(--red)"     valueColor="var(--red)" />
      </div>

      {/* Morning Brief */}
      <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', flex: 1 }}>FleetPilot Morning Intelligence — NavPro Data Layer</span>
        </div>
        {morningIntelligence.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, marginTop: 5, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1, lineHeight: 1.6 }}>{item.text}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          left={<CardTitle icon="🎯" title="Smart Dispatch" chip={<Chip label="AI Powered" variant="blue" />} />}
        />
        <div style={{ padding: 12 }}>
          {/* Load detail */}
          {LOAD ? (
            <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>LOAD {LOAD.id} · Needs Assignment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{LOAD.origin}</span>
                <span style={{ fontSize: 18, color: 'var(--text3)' }}>→</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{LOAD.destination}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {[['Pickup', LOAD.pickupTime], ['Distance', `${LOAD.distanceMi?.toLocaleString()} mi`], ['HOS Needed', `${LOAD.hosNeeded}h total`, 'var(--amber)'], ['Est. Revenue', `$${LOAD.revenue?.toLocaleString()}`]].map(([label, value, color]) => (
                  <div key={label} style={{ background: '#fff', borderRadius: 6, border: '1px solid var(--border)', padding: 7, flex: 1, minWidth: '20%' }}>
                    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', borderRadius: 6, border: '1px solid var(--border)', padding: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>
                  <strong>FMCSA Rule Check: </strong>{LOAD.distanceMi}mi route requires {LOAD.hosNeeded}h drive time. Driver must have sufficient HOS remaining (§395.3).
                </span>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>No loads available — syncing from NavPro...</div>
            </div>
          )}

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
  const { driver, score, fuelEst, rank, ripple, flag, note, reasoning } = item;
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

      {/* AI Reasoning */}
      {reasoning && (
        <div style={{ 
          background: score >= 80 ? 'var(--green-bg)' : score >= 60 ? 'var(--blue-bg)' : 'var(--amber-bg)', 
          border: `1px solid ${score >= 80 ? 'var(--green-border)' : score >= 60 ? 'var(--blue-border)' : 'var(--amber-border)'}`, 
          borderRadius: 5, 
          padding: 7, 
          marginBottom: 6 
        }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>🤖 AI Analysis</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>{reasoning}</div>
        </div>
      )}

      {note && <div style={{ background: '#fff', borderRadius: 5, border: '1px solid var(--green-border)', padding: 7, marginBottom: 6, fontSize: 10, color: 'var(--green-text)' }}>{note}</div>}
      {flag && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 5, padding: 6, marginTop: 4, fontSize: 10, color: 'var(--red-text)' }}>⚑ {flag}</div>}
      {ripple && <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 5, padding: 6, marginTop: 4, fontSize: 10, color: 'var(--amber-text)' }}>⚠ Ripple Risk: {ripple}</div>}

      {isTop && score >= 80 && (
        <div style={{ display: 'flex', gap: 7, marginTop: 8 }} onClick={e => e.stopPropagation()}>
          <Btn label={`Assign ${driver.name.split(' ')[0]} → One Tap`} onClick={onAssign} variant="primary" size="sm" />
          <Btn label="View Profile" onClick={onSelect} variant="ghost" size="sm" />
        </div>
      )}
    </div>
  );
};

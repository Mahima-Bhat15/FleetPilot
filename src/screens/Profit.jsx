// src/screens/Profit.jsx
import React from 'react';
import { riskGrade } from '../utils/theme';
import { Card, CardHeader, CardTitle, Chip, StatBox, SectionLabel, Divider, DriverAvatar } from '../components/UI';
import { DRIVERS } from '../data/mockData';

export const Profit = ({ drivers: liveDrivers }) => {
  const driverList = liveDrivers && liveDrivers.length > 0 ? liveDrivers : DRIVERS;
  const handleBonus = (driver, bonus) => {
    alert(`🏆 Bonus Approved!\n\n$${bonus} bonus approved for ${driver}.\n\n🤖 FleetPilot Actions:\n• Driver notified via NavPro app\n• Payroll system updated\n• Savings logged to fleet analytics`);
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <StatBox value="$0.87"  label="Fleet Avg CPM"   accent="var(--green)"   valueColor="var(--green)" />
        <StatBox value="$2,340" label="Bonus Pool"       accent="var(--primary)" valueColor="var(--primary)" />
        <StatBox value="12%"    label="Deadhead Saved"   accent="var(--amber)"   valueColor="var(--amber)" />
        <StatBox value="$18.4K" label="Fuel Savings MTD" accent="var(--green)"   valueColor="var(--green)" />
      </div>

      {/* AI Risk Intelligence */}
      <Card>
        <CardHeader left={<CardTitle icon="📊" title="AI Risk & Cost Intelligence" />} />
        <div style={{ padding: 12 }}>
          {driverList.map(d => {
            const { grade, color, label } = riskGrade(d);
            const pct = d.ontime;
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${color}`, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color }}>{grade}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{d.id}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
                    CPM: ${d.cpm} · HOS: {d.hos}h · On-time: {d.ontime}%{d.pattern ? ` · ⚑ ${d.pattern}` : ''}
                  </div>
                  <div style={{ height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ border: `1px solid ${color}66`, borderRadius: 'var(--radius-full)', padding: '2px 8px', background: color + '18' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color }}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bonus Program */}
      <Card>
        <CardHeader
          left={<CardTitle icon="🏆" title="Driver Savings Bonus Program" chip={<Chip label="New" variant="green" />} />}
        />
        <div style={{ padding: 12 }}>
          <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--green-text)', lineHeight: 1.6 }}>
              <strong>How it works: </strong>Drivers earn a bonus when their actual fuel cost per consignment is lower than the AI-estimated baseline. FleetPilot tracks savings in real-time from NavPro fuel data and splits 30% of verified savings with the driver.
            </span>
          </div>

          {driverList.filter(d => d.cpm < 0.90).map(d => {
            const saved = Math.max(0, ((0.90 - d.cpm) * 500)).toFixed(0);
            const bonus = (parseFloat(saved) * 0.3).toFixed(0);
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 11, marginBottom: 7 }}>
                <DriverAvatar initials={d.initials} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>Saved ${saved} vs baseline · CPM ${d.cpm} vs fleet avg $0.90</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bonus Earned</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>+${bonus}</div>
                </div>
                <button onClick={() => handleBonus(d.name, bonus)} style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '6px 10px', fontSize: 11, fontWeight: 600, color: 'var(--green-text)', cursor: 'pointer', transition: 'filter 0.15s' }}
                  onMouseEnter={e => e.target.style.filter = 'brightness(0.93)'}
                  onMouseLeave={e => e.target.style.filter = 'none'}
                >Approve</button>
              </div>
            );
          })}

          <Divider style={{ marginTop: 12 }} />
          <SectionLabel label="Cost Per Mile Breakdown — All Drivers" style={{ marginTop: 10 }} />
          {[...driverList].sort((a, b) => a.cpm - b.cpm).map((d, i) => {
            const barColor = d.cpm <= 0.87 ? 'var(--green)' : d.cpm <= 0.91 ? 'var(--amber)' : 'var(--red)';
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', width: 16 }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: 'var(--text)', width: 130 }}>{d.name}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.cpm / 1.0) * 100}%`, background: barColor, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: barColor, width: 36 }}>${d.cpm}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

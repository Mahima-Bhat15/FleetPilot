// src/screens/Inspection.jsx
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, Chip, ApiTag, SectionLabel, Divider } from '../components/UI';
import { INSPECTIONS } from '../data/mockData';

export const Inspection = () => {
  const [inspections, setInspections] = useState(INSPECTIONS);
  const fileRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`📋 Reading Inspection Report\n\nFile: ${file.name}\n\n🤖 AI is extracting:\n• Vehicle ID & driver\n• Inspection date & provider\n• Pass/Fail per item\n• Notes & recommendations\n\nProcessed in 3 seconds!`);
    const newInsp = {
      id: `INV-NEW-${Date.now()}`,
      truck: 'TRK-002',
      driver: 'Maria Rodriguez',
      date: new Date().toISOString().split('T')[0],
      provider: 'Uploaded Report',
      score: 88,
      items: { Brakes: 'Pass', Lights: 'Pass', Tires: 'Pass', Fluids: 'Pass', Mirrors: 'Pass', Horn: 'Pass' },
      notes: `All items passed. AI extracted from: ${file.name}`,
    };
    setInspections(prev => [newInsp, ...prev]);
    e.target.value = '';
  };

  const handleAction = (action, truck) => alert(`${action} for ${truck} — team notified.`);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <Card>
        <CardHeader
          left={<CardTitle icon="🔍" title="Vehicle Inspection — Third-Party Integration" chip={<Chip label="FMCSA §396.11" variant="blue" />} />}
          right={<ApiTag label="DVIR · PrePass API" />}
        />
        <div style={{ padding: 12 }}>
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleUpload} />
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed var(--border2)', borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          >
            <div style={{ fontSize: 32, marginBottom: 6 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>Upload DVIR / Inspection Report</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>PDF or Image · AI extracts all findings automatically</div>
            <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius-md)', padding: '7px 18px', display: 'inline-block', color: '#fff', fontSize: 12, fontWeight: 600 }}>Select File</div>
          </div>

          <Divider style={{ margin: '12px 0' }} />
          <SectionLabel label="Recent Inspections — Third-Party Provider Sync" />

          {inspections.map(insp => (
            <InspCard key={insp.id} insp={insp} onAction={handleAction} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const InspCard = ({ insp, onAction }) => {
  const scoreColor = insp.score >= 90 ? 'var(--green)' : insp.score >= 70 ? 'var(--amber)' : 'var(--red)';
  const isCritical = insp.score < 70;

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${isCritical ? 'var(--red-border)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{insp.truck} · {insp.driver}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>Provider: {insp.provider}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{insp.date}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: scoreColor }}>Score: {insp.score}/100</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
        {Object.entries(insp.items).map(([key, value]) => {
          const isPass = value === 'Pass';
          const isFail = value.startsWith('FAIL');
          const color = isPass ? 'var(--green-text)' : isFail ? 'var(--red-text)' : 'var(--amber-text)';
          const bg = isPass ? 'var(--green-bg)' : isFail ? 'var(--red-bg)' : 'var(--amber-bg)';
          return (
            <div key={key} style={{ background: bg, borderRadius: 5, padding: 6, minWidth: '30%', flex: 1 }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{key}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color }}>{value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: isCritical ? 'var(--red-bg)' : 'var(--bg)', border: `1px solid ${isCritical ? 'var(--red-border)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', padding: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: isCritical ? 'var(--red-text)' : 'var(--text2)', lineHeight: 1.6 }}>{insp.notes}</span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Download PDF', 'Notify Maintenance'].map(label => (
          <button key={label} onClick={() => onAction(label, insp.truck)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 10px', fontSize: 10, color: 'var(--text2)', fontWeight: 500, cursor: 'pointer' }}>{label}</button>
        ))}
        {isCritical && (
          <button onClick={() => onAction('Block Dispatch', insp.truck)} style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-md)', padding: '5px 10px', fontSize: 10, fontWeight: 600, color: 'var(--red-text)', cursor: 'pointer' }}>🚫 Block Dispatch</button>
        )}
      </div>
    </div>
  );
};

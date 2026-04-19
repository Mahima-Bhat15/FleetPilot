// src/screens/SmartDispatch.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { hosColor } from '../utils/theme';
import { Card, Chip, Btn, StatBox, HOSBar } from '../components/UI';
import {
  DEMO_DRIVERS_MODIFIED,
  DEMO_DRIVERS_ADDITIONAL,
  DEMO_DISPATCH_LOADS,
  DEMO_IN_TRANSIT_LOADS,
} from '../data/mockData';
import { rankDriversForLoad, getFleetBrief } from '../data/api';

// CSS injected once for the card reveal animation
const ANIM_STYLE = `
@keyframes fpSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fpPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}`;

export const SmartDispatch = ({ drivers: liveDrivers, loads, onDriverSelect, viewMode }) => {
  const [tab, setTab] = useState('dispatch');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [assignedLoads, setAssignedLoads] = useState({});

  // Stable reference — prevents LiveLeaderboard's useEffect from re-firing on unrelated re-renders
  const driverList = useMemo(
    () => viewMode === 'demo'
      ? [...DEMO_DRIVERS_MODIFIED, ...DEMO_DRIVERS_ADDITIONAL]
      : (liveDrivers || []),
    [viewMode, liveDrivers]
  );

  const dispatchLoads = viewMode === 'demo' ? DEMO_DISPATCH_LOADS : (loads || []).slice(0, 3);

  const handleAssign = (driverName, loadId) => {
    setAssignedLoads(prev => ({ ...prev, [loadId]: driverName }));
    setSelectedLoad(null);
    alert(
      `✅ Assignment Confirmed\n\n${driverName} assigned to Load ${loadId}.\n\n🤖 AI Actions:\n• Route pushed to NavPro driver app\n• ETA calculated and sent to customer\n• Driver briefing message dispatched\n• Fleet board updated — no ripple conflicts`
    );
  };

  const availableCount = driverList.filter(d => d.status === 'Available' || d.work_status === 'AVAILABLE').length;
  const hosAlertCount  = driverList.filter(d => (d.hos || 11) < 4).length;
  const inactiveCount  = driverList.filter(d => d.status === 'Dark' || d.status === 'Inactive').length;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: 12 }}>
      <style>{ANIM_STYLE}</style>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <StatBox value={String(dispatchLoads.length)} label="Loads Pending"  accent="var(--primary)" valueColor="var(--primary)" />
        <StatBox value={String(availableCount)}       label="Drivers Avail." accent="var(--green)"   valueColor="var(--green)" />
        <StatBox value={String(hosAlertCount)}        label="HOS Alerts"     accent="var(--amber)"   valueColor="var(--amber)" />
        <StatBox value={String(inactiveCount)}        label="Inactive"       accent="var(--red)"     valueColor="var(--red)" />
      </div>

      {/* AI Fleet Brief */}
      <FleetBriefCard driverList={driverList} dispatchLoads={dispatchLoads} />

      {/* Main Card */}
      <Card>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[['dispatch', 'To Dispatch', dispatchLoads.length], ['transit', 'In Transit', DEMO_IN_TRANSIT_LOADS.length]].map(([key, label, count]) => (
            <button key={key} onClick={() => { setTab(key); setSelectedLoad(null); }}
              style={{
                flex: 1, padding: '13px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                color: tab === key ? 'var(--primary)' : 'var(--text3)',
                borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>
              {label}
              <span style={{
                background: tab === key ? 'var(--primary)' : 'var(--bg)',
                color: tab === key ? '#fff' : 'var(--text3)',
                border: `1px solid ${tab === key ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700, padding: '1px 7px',
              }}>{count}</span>
            </button>
          ))}
        </div>

        {tab === 'dispatch' && (
          <div style={{ padding: 14 }}>
            {selectedLoad ? (
              <LiveLeaderboard
                load={selectedLoad}
                driverList={driverList}
                onBack={() => setSelectedLoad(null)}
                onAssign={handleAssign}
                onDriverSelect={onDriverSelect}
              />
            ) : (
              <DispatchGrid
                loads={dispatchLoads}
                assignedLoads={assignedLoads}
                onSelectLoad={setSelectedLoad}
              />
            )}
          </div>
        )}

        {tab === 'transit' && (
          <div style={{ padding: 14 }}>
            <InTransitList />
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Live Leaderboard — single Claude call, renders all results at once ────────
const LiveLeaderboard = ({ load, driverList, onBack, onAssign, onDriverSelect }) => {
  const [state, setState]       = useState('loading'); // loading | done | error
  const [drivers, setDrivers]   = useState([]);
  const [, setErrorMsg]         = useState('');
  const [selectedRank, setSelectedRank] = useState(1); // rank 1 pre-selected
  const cancelledRef            = useRef(false);
  // Snapshot drivers at mount time so live-polling updates never re-trigger the call
  const driversSnapshotRef      = useRef(driverList);

  useEffect(() => {
    cancelledRef.current = false;
    setState('loading');
    setDrivers([]);
    setErrorMsg('');

    // Use the snapshot captured when this load was first selected
    const snapshot = driversSnapshotRef.current;

    rankDriversForLoad(load, snapshot)
      .then(ranked => {
        if (cancelledRef.current) return;
        const enriched = ranked.map(r => ({
          ...r,
          driverObj: snapshot.find(d =>
            d.name?.toLowerCase() === r.name?.toLowerCase() ||
            d.name?.toLowerCase().includes(r.name?.split(' ')[0]?.toLowerCase())
          ) || null,
        }));
        setDrivers(enriched);
        setState('done');
      })
      .catch(err => {
        if (!cancelledRef.current) {
          setState('error');
          setErrorMsg(err.message);
        }
      });

    return () => { cancelledRef.current = true; };
  }, [load]); // only re-fetch when a different load is selected

  const topDriver = drivers[0];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button onClick={onBack} style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '6px 12px',
          cursor: 'pointer', fontSize: 11, color: 'var(--text2)',
          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        }}>← Back</button>

        <div style={{
          flex: 1, background: 'var(--blue-bg)', border: '1px solid var(--blue-border)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontWeight: 600 }}>{load.id}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
            {load.origin.split(',')[0]} → {load.destination.split(',')[0]}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
            {load.distanceMi?.toLocaleString()} mi · {load.hosNeeded}h HOS · ${load.revenue?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status bar */}
      {state === 'loading' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#0f172a', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 14,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22d3ee',
            animation: 'fpPulse 1.2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            Claude is analyzing available drivers for this load…
          </span>
        </div>
      )}

      {state === 'done' && drivers.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--green-bg)', border: '1px solid var(--green-border)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 14,
        }}>
          <span style={{ fontSize: 12, color: 'var(--green-text)', fontWeight: 600 }}>
            Analysis complete — {drivers.length} drivers ranked
          </span>
          {topDriver && (
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              · Top pick: <strong style={{ color: 'var(--text2)' }}>{topDriver.name}</strong> (score {topDriver.score})
            </span>
          )}
        </div>
      )}

      {state === 'error' && (
        <div style={{
          background: 'var(--amber-bg)', border: '1px solid var(--amber-border)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 13 }}>⚠</span>
          <div>
            <span style={{ fontSize: 11, color: 'var(--amber-text)', fontWeight: 600 }}>
              Rate limit reached — showing last available results.
            </span>
            {drivers.length === 0 && (
              <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>Try again in ~60 s.</span>
            )}
          </div>
        </div>
      )}

      {/* Ranked driver cards — appear as Claude outputs them */}
      {drivers.map((item, appearIdx) => (
        <RankedDriverCard
          key={item.rank}
          item={item}
          isSelected={item.rank === selectedRank}
          isTop={item.rank === 1}
          onCardClick={() => setSelectedRank(item.rank)}
          onAssign={() => onAssign(item.name, load.id)}
          onSelect={() => item.driverObj && onDriverSelect && onDriverSelect(item.driverObj)}
          animDelay={appearIdx * 0}
        />
      ))}

      {/* Skeleton placeholders while streaming */}
      {state === 'loading' && Array.from({ length: Math.min(driverList.length, 8) }).map((_, i) => (
        <div key={`skel-${i}`} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8,
          height: 60, animation: 'fpPulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
};

// ── Ranked Driver Card ────────────────────────────────────────────────────────
const RankedDriverCard = ({ item, isSelected, isTop, onCardClick, onAssign, onSelect }) => {
  const { rank, name, score, reasoning, driverObj } = item;
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 55 ? 'var(--amber)' : 'var(--red)';
  const hosClr = driverObj ? hosColor(driverObj.hos) : 'var(--text3)';

  return (
    <div
      onClick={() => { onCardClick(); onSelect(); }}
      style={{
        background: isTop ? 'var(--green-bg)' : 'var(--surface)',
        border: `2px solid ${isSelected ? 'var(--primary)' : isTop ? 'var(--green-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 8,
        cursor: 'pointer',
        animation: 'fpSlideIn 0.3s ease-out both',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 26, fontWeight: 900, color: isTop ? 'var(--green)' : 'var(--text3)',
            fontFamily: 'var(--font-mono)', lineHeight: 1, minWidth: 36,
          }}>#{rank}</span>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{name}</span>
              {isTop && (
                <span style={{
                  fontSize: 9, fontWeight: 700, color: 'var(--green-text)',
                  background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                  borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>Best Match</span>
              )}
            </div>
            {driverObj && (
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                {driverObj.pos} · {driverObj.qual}
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Score</div>
        </div>
      </div>

      {/* Driver metrics from actual data */}
      {driverObj && (
        <>
          <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
            {[
              ['HOS',      `${driverObj.hos}h`,            hosClr],
              ['Deadhead', `${driverObj.deadheadMiles}mi`, (driverObj.deadheadMiles || 0) < 200 ? 'var(--green)' : 'var(--amber)'],
              ['Fatigue',  driverObj.fatigue,              driverObj.fatigue === 'Low' ? 'var(--green)' : driverObj.fatigue === 'High' ? 'var(--red)' : 'var(--amber)'],
              ['On-Time',  `${driverObj.ontime}%`,         (driverObj.ontime || 0) >= 90 ? 'var(--green)' : 'var(--amber)'],
              ['CPM',      `$${driverObj.cpm}`,            (driverObj.cpm || 0) < 0.88 ? 'var(--green)' : 'var(--amber)'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ flex: 1, background: 'var(--bg)', borderRadius: 5, padding: '5px 6px' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <HOSBar hos={driverObj.hos} />
            <span style={{ fontSize: 10, fontWeight: 600, color: hosClr, fontFamily: 'var(--font-mono)', minWidth: 34 }}>
              {driverObj.hos}h
            </span>
          </div>
        </>
      )}

      {/* Claude's actual reasoning */}
      <div style={{
        background: score >= 80 ? '#f0fdf4' : score >= 55 ? '#f8fafc' : '#fff7ed',
        border: `1px solid ${score >= 80 ? '#bbf7d0' : score >= 55 ? '#e2e8f0' : '#fed7aa'}`,
        borderRadius: 6, padding: '10px 12px',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
          Why this rank
        </div>
        <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.7 }}>{reasoning}</div>
      </div>

      {driverObj?.pattern && (
        <div style={{
          background: 'var(--amber-bg)', border: '1px solid var(--amber-border)',
          borderRadius: 5, padding: '5px 8px', marginTop: 8,
          fontSize: 10, color: 'var(--amber-text)',
        }}>⚠ Pattern: {driverObj.pattern}</div>
      )}

      {isSelected && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }} onClick={e => e.stopPropagation()}>
          <Btn label={`Assign ${name.split(' ')[0]} to this Load`} onClick={onAssign} variant="primary" size="sm" />
          {driverObj && <Btn label="View Profile" onClick={onSelect} variant="ghost" size="sm" />}
        </div>
      )}
    </div>
  );
};

// ── AI Fleet Brief Card ───────────────────────────────────────────────────────
const LEVEL_COLOR   = { critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--primary)' };

const FleetBriefCard = ({ driverList, dispatchLoads }) => {
  const [brief,   setBrief]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const driverAlerts = driverList
      .filter(d => (d.hos || 11) < 4 || d.fatigue === 'High' || d.status === 'Dark')
      .map(d => ({
        name: d.name, id: d.id,
        issue: d.status === 'Dark' ? 'Offline/dark' : d.fatigue === 'High' ? 'High fatigue' : `${d.hos}h HOS left`,
      }));

    getFleetBrief(dispatchLoads, DEMO_IN_TRANSIT_LOADS, driverAlerts)
      .then(data => { setBrief(data); setLoading(false); })
      .catch(() => { setFailed(true); setLoading(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) return null;

  return (
    <div style={{
      background: 'var(--blue-bg)', borderRadius: 'var(--radius-lg)',
      padding: '12px 16px', marginBottom: 12,
      border: '1px solid var(--blue-border)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
        }}>⚡</div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.2px' }}>
          AI Fleet Brief
        </span>
        {!loading && (
          <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            just now
          </span>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[92, 78, 85, 65].map((w, i) => (
            <div key={i} style={{
              height: 9, background: 'var(--border)', borderRadius: 5,
              width: `${w}%`,
              animation: 'fpPulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.18}s`,
            }} />
          ))}
        </div>
      )}

      {/* Brief content */}
      {brief && (
        <>
          {brief.summary && (
            <p style={{ fontSize: 12, color: 'var(--text2)', margin: '0 0 10px', lineHeight: 1.6 }}>
              {brief.summary}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {brief.concerns?.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                  background: LEVEL_COLOR[c.level] || 'var(--primary)',
                  boxShadow: `0 0 6px ${LEVEL_COLOR[c.level] || 'var(--primary)'}88`,
                }} />
                <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, flex: 1 }}>
                  {c.text}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Dispatch Grid ─────────────────────────────────────────────────────────────
const DispatchGrid = ({ loads, assignedLoads, onSelectLoad }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>
        Click a consignment — Claude will rank your drivers in real time
      </span>
      <button
        style={{
          width: 34, height: 34, borderRadius: '50%', border: 'none',
          background: '#ef4444', color: '#fff', fontSize: 22, fontWeight: 300,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(239,68,68,0.45)', lineHeight: 1, flexShrink: 0,
        }}
        onClick={() => alert('➕ New Consignment\n\nConsignment creation form would open here.\nFields: Origin · Destination · Pickup Time · Load Type · Weight · Revenue')}
        title="Add new consignment"
      >+</button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {loads.map(load => (
        <LoadCard
          key={load.id}
          load={load}
          isAssigned={!!assignedLoads[load.id]}
          assignedTo={assignedLoads[load.id]}
          onClick={() => !assignedLoads[load.id] && onSelectLoad(load)}
        />
      ))}
    </div>
  </div>
);

// ── Load Card ─────────────────────────────────────────────────────────────────
const LoadCard = ({ load, isAssigned, assignedTo, onClick }) => {
  const typeColorMap = { Reefer: '#7c3aed', Flatbed: '#d97706', 'Dry Freight': '#2563eb', 'Dry Van': '#2563eb' };
  const typeColor = typeColorMap[load.type] || '#2563eb';
  const isUrgent = load.urgency === 'Urgent' || load.status === 'Urgent';

  return (
    <div onClick={onClick}
      style={{
        background: isAssigned ? 'var(--green-bg)' : 'var(--surface)',
        border: `1px solid ${isAssigned ? 'var(--green-border)' : isUrgent ? '#fca5a5' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)', padding: 12,
        cursor: isAssigned ? 'default' : 'pointer',
        aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'box-shadow 0.15s', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => !isAssigned && (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {isUrgent && !isAssigned && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#ef4444' }} />
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{load.id}</span>
          {isUrgent && !isAssigned && <span style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>URGENT</span>}
          {isAssigned && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--green-text)', textTransform: 'uppercase' }}>ASSIGNED</span>}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 6 }}>
          {load.origin.split(',')[0]}
          <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 10 }}> → </span>
          {load.destination.split(',')[0]}
        </div>

        <div style={{
          display: 'inline-block', fontSize: 9, fontWeight: 600, color: typeColor,
          background: typeColor + '18', border: `1px solid ${typeColor}44`,
          borderRadius: 4, padding: '2px 6px',
        }}>{load.type}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[['Pickup', load.pickupTime], ['Revenue', `$${load.revenue?.toLocaleString()}`, 'var(--green-text)'], ['Distance', `${load.distanceMi?.toLocaleString()} mi`]].map(([lbl, val, col]) => (
          <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'var(--text3)' }}>{lbl}</span>
            <span style={{ fontSize: lbl === 'Revenue' ? 10 : 9, fontWeight: lbl === 'Revenue' ? 700 : 600, color: col || 'var(--text2)' }}>{val}</span>
          </div>
        ))}
        {isAssigned && <div style={{ marginTop: 2, fontSize: 9, color: 'var(--green-text)', fontWeight: 600 }}>✓ {assignedTo}</div>}
      </div>
    </div>
  );
};

// ── In Transit List ───────────────────────────────────────────────────────────
const InTransitList = () => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>
        {DEMO_IN_TRANSIT_LOADS.length} loads currently in transit
      </span>
      <Chip label="Live Tracking" variant="green" />
    </div>
    {DEMO_IN_TRANSIT_LOADS.map(load => <TransitCard key={load.id} load={load} />)}
  </div>
);

const TransitCard = ({ load }) => {
  const statusVariant = load.status === 'On Track' ? 'green' : load.status === 'Delayed' ? 'red' : 'amber';
  const statusColor   = load.status === 'On Track' ? 'var(--green)' : load.status === 'Delayed' ? 'var(--red)' : 'var(--amber)';

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontWeight: 600 }}>{load.id}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{load.origin.split(',')[0]} → {load.destination.split(',')[0]}</span>
        </div>
        <Chip label={load.status} variant={statusVariant} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🚛</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{load.driverName}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)' }}>{load.truckId} · {load.type}</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {[['Current Location', load.currentLocation, 'var(--text2)'], ['ETA', load.eta, load.status === 'Delayed' ? 'var(--red)' : 'var(--text)'], ['Revenue', `$${load.revenue?.toLocaleString()}`, 'var(--green-text)']].map(([lbl, val, col]) => (
          <div key={lbl} style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 1 }}>{lbl}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: col }}>{val}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--text3)' }}>Route Progress</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: statusColor }}>{load.progress}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ height: '100%', width: `${load.progress}%`, background: statusColor, borderRadius: 3 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 9, color: 'var(--text3)' }}>{load.origin.split(',')[0]}</span>
          <span style={{ fontSize: 9, color: 'var(--text3)' }}>{load.destination.split(',')[0]}</span>
        </div>
      </div>
    </div>
  );
};

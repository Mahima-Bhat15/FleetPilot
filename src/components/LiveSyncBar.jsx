// src/components/LiveSyncBar.jsx
import React from 'react';

export const LiveSyncBar = ({ isLive, loading, lastSync, error, onRefresh }) => {
  const syncTime = lastSync
    ? lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: error ? 'var(--red-bg)' : isLive ? '#f0fdf4' : 'var(--bg)',
      padding: '5px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {loading ? (
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', animation: 'pulse 1s infinite' }} />
        ) : (
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: error ? 'var(--red)' : isLive ? 'var(--green)' : 'var(--amber)' }} />
        )}
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          {loading ? 'Syncing with NavPro...' : error ? 'NavPro offline — showing cached data' : isLive ? `NavPro live · Last sync ${syncTime}` : 'Demo mode — mock data'}
        </span>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)', padding: '3px 10px',
          fontSize: 11, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer',
        }}
      >{loading ? '...' : '↻ Refresh'}</button>
    </div>
  );
};

// src/components/VoiceModal.jsx
import React, { useState, useEffect } from 'react';
import { VOICE_COMMANDS, VOICE_RESPONSES } from '../data/mockData';

export const VoiceModal = ({ visible, onClose }) => {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!visible) { setStatus('idle'); setTranscript(''); setResponse(''); }
  }, [visible]);

  const runCommand = (key, label) => {
    setStatus('listening');
    setTranscript('');
    setResponse('');
    setTimeout(() => { setTranscript(label.replace(/"/g, '')); setStatus('thinking'); }, 800);
    setTimeout(() => { setResponse(VOICE_RESPONSES[key] || 'Processing...'); setStatus('responding'); }, 2000);
  };

  const micColor = status === 'listening' ? 'var(--red)' : status === 'thinking' ? 'var(--amber)' : status === 'responding' ? 'var(--green)' : 'var(--primary)';
  const statusLabels = { idle: 'Tap a command below to try it', listening: 'Listening...', thinking: 'AI analyzing fleet data...', responding: 'Response:' };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '20px 20px 0 0',
        padding: 20, paddingBottom: 32, width: '100%', maxWidth: 600,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>🎤 Ask Fleet</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)',
            border: '1px solid var(--border)', fontSize: 14, color: 'var(--text3)', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Mic */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            border: `2px solid ${micColor}`, background: micColor + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
            transition: 'all 0.3s', transform: status === 'listening' || status === 'thinking' ? 'scale(1.1)' : 'scale(1)',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: micColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24 }}>🎙️</span>
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: micColor }}>{statusLabels[status]}</span>
        </div>

        {transcript && (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>You said:</div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic' }}>"{transcript}"</div>
          </div>
        )}

        {response && (
          <div style={{ background: 'var(--blue-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--blue-border)', padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 5 }}>🤖 FleetPilot:</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{response}</div>
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Quick Commands</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {VOICE_COMMANDS.map(cmd => (
              <button key={cmd.key} onClick={() => runCommand(cmd.key, cmd.label)} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)', padding: '7px 12px',
                fontSize: 11, color: 'var(--text2)', fontWeight: 500, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.target.style.background = 'var(--blue-bg)'}
                onMouseLeave={e => e.target.style.background = 'var(--bg)'}
              >{cmd.label}</button>
            ))}
          </div>
        </div>

        {status !== 'idle' && (
          <button onClick={() => { setStatus('idle'); setTranscript(''); setResponse(''); }}
            style={{
              alignSelf: 'center', marginTop: 14, background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-full)',
              padding: '8px 20px', fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer',
            }}>↺ Ask Again</button>
        )}
      </div>
    </div>
  );
};

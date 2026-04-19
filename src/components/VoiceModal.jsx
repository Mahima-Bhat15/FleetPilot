// src/components/VoiceModal.jsx
import React, { useState, useEffect, useRef } from 'react';
const VOICE_COMMANDS = [
  { label: '"What\'s my fleet status?"', key: 'status' },
  { label: '"Best driver for Phoenix pickup?"', key: 'best' },
  { label: '"Any HOS violations?"', key: 'hos' },
  { label: '"What bills need approval?"', key: 'bill' },
  { label: '"Show me dark trucks"', key: 'dark' },
  { label: '"Who has the lowest cost per mile?"', key: 'cpm' },
  { label: '"What loads are unassigned?"', key: 'loads' },
  { label: '"Is any driver fatigued?"', key: 'fatigue' },
  { label: '"Assign Dave to LD-47392"', key: 'assign' },
  { label: '"What\'s the total revenue today?"', key: 'revenue' },
];

const VOICE_RESPONSES = {
  status: '6 trucks active. Dave Thompson available for Load LD-47392. Carlos Martinez and Mike Chen have HOS warnings. Lisa Anderson is dark — immediate action required.',
  best: 'Best driver for Phoenix pickup: Dave Thompson, Score 95. 9.5h HOS, 124 deadhead miles, $1,245 estimated fuel, no pattern flags. Ripple analysis clear for tomorrow.',
  hos: 'Two HOS warnings: Carlos Martinez will breach at 11:20 AM — needs Flying J Exit 201 now. Mike Chen has 2.1h remaining with 2.8h route left — guaranteed violation.',
  bill: 'Three bills pending. Dave Thompson fuel $245.80 — OCR verified, ready to approve. Maria Rodriguez maintenance $89.50 pending review. Sarah Johnson $312.40 already invoiced.',
  dark: 'Lisa Anderson on TRK-006 has been dark 41 minutes. Last known position I-10 Exit 201, Casa Grande AZ. Recommend calling immediately and dispatching roadside assistance.',
  cpm: 'Dave Thompson has the lowest cost per mile at $0.84. Maria Rodriguez is second at $0.86. Fleet average is $0.89. Lisa Anderson is highest at $0.93.',
  loads: 'Three loads unassigned: LD-47392 Phoenix to Dallas 1067 miles, LD-47410 Albuquerque to Denver 452 miles, and LD-47400 Tucson to Chicago 1745 miles. LD-47392 is most urgent — pickup tomorrow 8 AM.',
  fatigue: 'Mike Chen is high fatigue — only 2.1h HOS, last rest 9 hours ago. Carlos Martinez is medium fatigue. All other drivers are low fatigue. Recommend no new assignments for Mike.',
  assign: 'Assigning Dave Thompson to Load LD-47392. Route pushed to NavPro driver app. ETA for customer: Tomorrow 6:14 PM. Driver briefing message sent.',
  revenue: "Today's total revenue is $24,500 across 6 loads. Average cost per mile is $0.87. Net margin estimated at 18.4%. Highest earning load: LD-47392 at $2,890.",
};

export const VoiceModal = ({ visible, onClose }) => {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!visible) { 
      setStatus('idle'); 
      setTranscript(''); 
      setResponse(''); 
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [visible]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        setStatus('thinking');
        setIsListening(false);
        
        // Find matching command
        const matchedCommand = VOICE_COMMANDS.find(cmd => 
          spokenText.toLowerCase().includes(cmd.label.toLowerCase().replace(/"/g, '').substring(0, 10))
        );
        
        setTimeout(() => {
          const responseText = matchedCommand 
            ? VOICE_RESPONSES[matchedCommand.key] 
            : "I didn't understand that command. Please try one of the quick commands below.";
          setResponse(responseText);
          setStatus('responding');
          
          // Speak the response
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(responseText);
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        }, 1500);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setStatus('idle');
        if (event.error === 'no-speech') {
          setTranscript('No speech detected. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setStatus('listening');
      setTranscript('');
      setResponse('');
      setIsListening(true);
      recognitionRef.current.start();
    } else if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  };

  const runCommand = (key, label) => {
    setStatus('listening');
    setTranscript('');
    setResponse('');
    setTimeout(() => { 
      setTranscript(label.replace(/"/g, '')); 
      setStatus('thinking'); 
    }, 800);
    setTimeout(() => { 
      const responseText = VOICE_RESPONSES[key] || 'Processing...';
      setResponse(responseText); 
      setStatus('responding');
      
      // Speak the response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }, 2000);
  };

  const micColor = status === 'listening' ? 'var(--red)' : status === 'thinking' ? 'var(--amber)' : status === 'responding' ? 'var(--green)' : 'var(--primary)';
  const statusLabels = { 
    idle: 'Tap microphone to speak or use quick commands', 
    listening: 'Listening...', 
    thinking: 'AI analyzing fleet data...', 
    responding: 'Response:' 
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '20px',
        padding: 20, width: '100%', maxWidth: 600,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
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
          <div 
            onClick={startListening}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              border: `2px solid ${micColor}`, background: micColor + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              transition: 'all 0.3s', 
              transform: status === 'listening' || status === 'thinking' ? 'scale(1.1)' : 'scale(1)',
              cursor: status === 'idle' ? 'pointer' : 'default',
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: micColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24 }}>🎙️</span>
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: micColor, textAlign: 'center' }}>{statusLabels[status]}</span>
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
          <button onClick={() => { 
            setStatus('idle'); 
            setTranscript(''); 
            setResponse(''); 
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          }}
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

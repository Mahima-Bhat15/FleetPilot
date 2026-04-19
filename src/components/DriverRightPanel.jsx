// src/components/DriverRightPanel.jsx
import React, { useState } from 'react';
import { hosColor, statusColor } from '../utils/theme';
import { Divider, SectionLabel, HOSBar, DriverAvatar, StatusDot } from './UI';
import { sendDriverMessage } from '../data/api';

export const DriverRightPanel = ({ driver, onClose }) => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  if (!driver) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
        <span style={{ fontSize: 32 }}>👆</span>
        <span style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Select a driver to view full detail</span>
      </div>
    );
  }

  const hosClr   = hosColor(driver.hos);
  const cycleClr = driver.cycle > 65 ? 'var(--red)' : driver.cycle > 55 ? 'var(--amber)' : 'var(--primary)';

  const handleCall    = () => alert(`📞 Calling ${driver.name}${driver.phone ? ` at ${driver.phone}` : ''}...`);
  const handleMessage = () => setShowMessageModal(true);

  const sendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const driverId = driver.navpro_id || driver.id;
      await sendDriverMessage(driverId, messageText, 'Dispatch Message');
      
      alert(`✅ Message Sent!\n\nYour message has been sent to ${driver.name} via the NavPro driver app.\n\n📱 The driver will receive a push notification and can view the message in their app.`);
      setMessageText('');
      setShowMessageModal(false);
    } catch (error) {
      alert(`❌ Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: 12, borderBottom: '1px solid var(--border)', gap: 10 }}>
          <DriverAvatar initials={driver.initials} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{driver.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <StatusDot status={driver.status} />
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(driver.status) }}>{driver.status}</span>
              {driver.lastSeen && <span style={{ fontSize: 10, color: 'var(--text3)' }}>· {driver.lastSeen}</span>}
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text3)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>

          {/* Basic Info */}
          <SectionLabel label="Driver Info" />
          <DetailRow label="Driver ID"    value={`#${driver.navpro_id || driver.id}`} mono />
          <DetailRow label="Type"         value={driver.qual} />
          <DetailRow label="Carrier"      value={driver.carrier || '—'} />
          <DetailRow label="Owner"        value={driver.owner  || '—'} />
          <DetailRow label="Terminal"     value={driver.terminal || 'Unassigned'} />

          <Divider />

          {/* Contact */}
          <SectionLabel label="Contact" />
          <DetailRow label="Phone"  value={driver.phone || '—'} mono />
          <DetailRow label="Email"  value={driver.email || '—'} />
          {driver.address && <DetailRow label="Address" value={driver.address} />}

          <Divider />

          {/* Location */}
          <SectionLabel label="Location" />
          {driver.hasLocation ? (
            <>
              <DetailRow label="Last Known" value={driver.pos} />
              {driver.lastSeen && <DetailRow label="Updated" value={driver.lastSeen} />}
            </>
          ) : (
            <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius-md)', padding: '8px 10px', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--amber-text)' }}>⚠ No GPS signal recorded yet</span>
            </div>
          )}

          <Divider />

          {/* Vehicle Assignment */}
          <SectionLabel label="Vehicle Assignment" />
          {driver.truckNo || driver.trailerNo ? (
            <>
              {driver.truckNo   && <DetailRow label="Truck"   value={driver.truckNo}   mono />}
              {driver.trailerNo && <DetailRow label="Trailer" value={driver.trailerNo} mono />}
              {driver.truck?.vehicle_make && (
                <DetailRow label="Make/Model" value={`${driver.truck.vehicle_make} ${driver.truck.vehicle_model || ''}`.trim()} />
              )}
            </>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>No vehicle assigned</div>
          )}

          <Divider />

          {/* Current Load */}
          <SectionLabel label="Current Load" />
          {driver.loadDetail ? (
            <>
              <DetailRow label="Load ID"    value={`LD-${driver.loadDetail.load_id}`} mono />
              <DetailRow label="Origin"     value={driver.loadDetail.origin?.split(',')[0] || '—'} />
              <DetailRow label="Dest."      value={driver.loadDetail.destination?.split(',')[0] || '—'} />
              {driver.loadDetail.pickup_date && (
                <DetailRow label="Pickup" value={new Date(driver.loadDetail.pickup_date).toLocaleDateString()} />
              )}
              {driver.loadDetail.delivery_date && (
                <DetailRow label="Delivery" value={new Date(driver.loadDetail.delivery_date).toLocaleDateString()} />
              )}
            </>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>No active load</div>
          )}

          <Divider />

          {/* HOS */}
          <SectionLabel label="Hours of Service (FMCSA §395)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Drive remaining</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <HOSBar hos={driver.hos} />
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: hosClr, minWidth: 36 }}>{driver.hos}h</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>70h cycle</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (driver.cycle / 70) * 100)}%`, background: cycleClr, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: cycleClr, minWidth: 36 }}>{driver.cycle}/70h</span>
              </div>
            </div>
          </div>

          <Divider />

          {/* License */}
          {driver.licenseType && (
            <>
              <SectionLabel label="License" />
              <DetailRow label="Type"    value={driver.licenseType} />
              {driver.licenseState  && <DetailRow label="State"   value={driver.licenseState} />}
              {driver.licenseExpiry && <DetailRow label="Expires" value={driver.licenseExpiry} />}
              <Divider />
            </>
          )}

          {/* Recent Activity */}
          {driver.activities?.length > 0 && (
            <>
              <SectionLabel label="Recent Activity" />
              {driver.activities.slice(0, 3).map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    {act.activities?.map((a, j) => (
                      <div key={j} style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>{a}</div>
                    ))}
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {new Date(act.time).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <Divider />
            </>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
            <button onClick={handleCall} style={{ flex: 1, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', padding: '8px 4px', fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>📞 Call</button>
            <button onClick={handleMessage} style={{ flex: 1, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', padding: '8px 4px', fontSize: 11, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer' }}>💬 Message</button>
          </div>

          <div style={{ height: 16 }} />
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div
          onClick={() => !sending && setShowMessageModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 20,
              width: '100%',
              maxWidth: 500,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>💬 Message Driver</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Send message to {driver.name} via NavPro app</div>
              </div>
              <button
                onClick={() => !sending && setShowMessageModal(false)}
                disabled={sending}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: 14,
                  color: 'var(--text3)',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.5 : 1,
                }}
              >
                ✕
              </button>
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              disabled={sending}
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: 16,
                opacity: sending ? 0.5 : 1,
              }}
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => !sending && setShowMessageModal(false)}
                disabled={sending}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text2)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={sending || !messageText.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: sending || !messageText.trim() ? 'var(--text3)' : 'var(--primary)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: sending || !messageText.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {sending ? 'Sending...' : '📤 Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DetailRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
    <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : undefined, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{value || '—'}</span>
  </div>
);

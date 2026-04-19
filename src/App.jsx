// App.jsx — FleetPilot with left sidebar navigation
import React, { useState } from 'react';
import { Topbar }           from './components/Topbar';
import { LiveSyncBar }      from './components/LiveSyncBar';
import { SideNav }          from './components/SideNav';
import { DriverRightPanel } from './components/DriverRightPanel';
import { VoiceModal }       from './components/VoiceModal';
import { SmartDispatch }    from './screens/SmartDispatch';
import { HOSCompliance }    from './screens/HOSCompliance';
import { ELDSafety }        from './screens/ELDSafety';
import { Alerts }           from './screens/Alerts';
import { Billing }          from './screens/Billing';
import { Inspection }       from './screens/Inspection';
import { Profit }           from './screens/Profit';
import { usePersistedTab }  from './hooks/usePersistedTab';
import { useFleetData }     from './hooks/useFleetData';

const SCREENS = { SmartDispatch, HOSCompliance, ELDSafety, Alerts, Billing, Inspection, Profit };
const SCREENS_WITH_RIGHT_PANEL = ['SmartDispatch', 'HOSCompliance', 'Alerts', 'Billing', 'Inspection', 'Profit'];

export default function App() {
  const { activeTab, navigate, isLoaded } = usePersistedTab('SmartDispatch');
  const { drivers, loads, alerts, bills, vehicles, loading, error, lastSync, isLive, refresh, updateBill, addBill, dismissAlert, updateDriver } = useFleetData();
  const [voiceVisible,   setVoiceVisible]   = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  if (!isLoaded) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', gap: 16 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>FleetPilot</div>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Restoring your session...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loading && drivers.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 14 }}>
        <div style={{ fontSize: 40 }}>🚛</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>Syncing Fleet Data</div>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Connecting to NavPro...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const ActiveScreen = SCREENS[activeTab] || SmartDispatch;
  const showRightPanel = SCREENS_WITH_RIGHT_PANEL.includes(activeTab);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar onVoicePress={() => setVoiceVisible(true)} isLive={isLive} />
      <LiveSyncBar isLive={isLive} loading={loading} lastSync={lastSync} error={error} onRefresh={refresh} />

      {/* Main layout: sidebar + content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left sidebar navigation */}
        <SideNav
          activeTab={activeTab}
          onTabPress={(tab) => { navigate(tab); if (tab !== activeTab) setSelectedDriver(null); }}
          alerts={alerts}
          drivers={drivers}
          isLive={isLive}
        />

        {/* Page content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <ActiveScreen
              drivers={drivers} loads={loads} alerts={alerts} bills={bills} vehicles={vehicles}
              onDriverSelect={setSelectedDriver} selectedDriver={selectedDriver}
              onBillUpdate={updateBill} onBillAdd={addBill}
              onAlertDismiss={dismissAlert} onDriverUpdate={updateDriver}
              onRefresh={refresh}
            />
          </div>

          {/* Right driver detail panel */}
          {showRightPanel && (
            <div style={{ width: 280, borderLeft: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
              <DriverRightPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
            </div>
          )}
        </div>
      </div>

      <VoiceModal visible={voiceVisible} onClose={() => setVoiceVisible(false)} />
    </div>
  );
}

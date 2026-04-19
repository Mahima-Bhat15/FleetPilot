// src/hooks/useFleetData.js
// Uses real NavPro endpoints. Falls back to mock data when no token is set.
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDrivers, fetchVehicles, fetchDocuments,
  normalizeDriver, normalizeVehicle, normalizeDocument,
} from '../data/api';
import {
  DRIVERS as MOCK_DRIVERS,
  LOADS   as MOCK_LOADS,
  ALERTS_DATA as MOCK_ALERTS,
  BILLS   as MOCK_BILLS,
} from '../data/mockData';

const POLL_INTERVAL_MS = 30_000;

export const useFleetData = () => {
  const [drivers,  setDrivers]  = useState(MOCK_DRIVERS);
  const [loads,    setLoads]    = useState(MOCK_LOADS);
  const [alerts,   setAlerts]   = useState(MOCK_ALERTS);
  const [bills,    setBills]    = useState(MOCK_BILLS);
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isLive,   setIsLive]   = useState(false);
  const pollRef = useRef(null);

  const refresh = useCallback(async (silent = false) => {
    const token = process.env.REACT_APP_NAVPRO_JWT_TOKEN;
    if (!token) {
      // Demo mode — keep mock data
      setIsLive(false);
      setLastSync(new Date());
      return;
    }

    if (!silent) setLoading(true);
    setError(null);

    try {
      // Fetch drivers, vehicles, documents in parallel
      const [driversRes, vehiclesRes, docsRes] = await Promise.allSettled([
        fetchDrivers(0, 50),           // no status filter — returns all drivers
        fetchVehicles(0, 50, 'ACTIVE'),
        fetchDocuments(0, 50),
      ]);

      if (driversRes.status === 'fulfilled' && driversRes.value?.data) {
        setDrivers(driversRes.value.data.map(normalizeDriver));
        setIsLive(true);
      }
      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value?.data) {
        setVehicles(vehiclesRes.value.data.map(normalizeVehicle));
      }
      if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
        setBills(docsRes.value.data.map(normalizeDocument));
      }

      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
      setIsLive(false);
      console.warn('[FleetPilot] NavPro unavailable, using mock data:', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    pollRef.current = setInterval(() => refresh(true), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [refresh]);

  const updateBill    = useCallback((id, patch) => setBills(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b)), []);
  const addBill       = useCallback((bill) => setBills(prev => [bill, ...prev]), []);
  const dismissAlert  = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), []);
  const updateDriver  = useCallback((id, patch) => setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d)), []);

  return { drivers, loads, alerts, bills, vehicles, loading, error, lastSync, isLive, refresh, updateBill, addBill, dismissAlert, updateDriver };
};

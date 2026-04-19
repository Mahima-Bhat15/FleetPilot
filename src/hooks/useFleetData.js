// src/hooks/useFleetData.js
// Uses real NavPro endpoints. Falls back to mock data when no token is set.
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDrivers, fetchVehicles, fetchDocuments, fetchDriverTrackingToday,
  normalizeDriver, normalizeVehicle, normalizeDocument,
} from '../data/api';
const POLL_INTERVAL_MS = 30_000;
const SIM_TICK_MS      = 3_000;
const SIM_STEP         = 0.0008;

function moveToward(current, target) {
  const dLat = target.lat - current.lat;
  const dLng = target.lng - current.lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  if (dist < SIM_STEP) return target;
  return {
    lat: current.lat + (dLat / dist) * SIM_STEP,
    lng: current.lng + (dLng / dist) * SIM_STEP,
  };
}

export const useFleetData = () => {
  const [drivers,      setDrivers]      = useState([]);
  const [loads,        setLoads]        = useState([]);
  const [alerts,       setAlerts]       = useState([]);
  const [bills,        setBills]        = useState([]);
  const [vehicles,     setVehicles]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [lastSync,     setLastSync]     = useState(null);
  const [isLive,       setIsLive]       = useState(false);
  const [simLocations, setSimLocations] = useState({});

  const pollRef       = useRef(null);
  const simTargetsRef = useRef({});

  // After live drivers load, fetch their last-known GPS from the tracking API
  const seedRealLocations = useCallback(async (normalizedDrivers) => {
    const liveDrivers = normalizedDrivers.filter(d => d.navpro_id);
    if (!liveDrivers.length) return;

    const results = await Promise.allSettled(
      liveDrivers.map(d =>
        fetchDriverTrackingToday(d.navpro_id)
          .then(res => ({ key: d.navpro_id, res }))
      )
    );

    const newLocs    = {};
    const newTargets = {};

    results.forEach(r => {
      if (r.status !== 'fulfilled') return;
      const { key, res } = r.value;
      const trail = res?.data?.trail;
      if (!trail || !trail.length) return;
      const last = trail[trail.length - 1];
      const lat  = Number(last.lat);
      const lng  = Number(last.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        newLocs[key]    = { lat, lng };
        newTargets[key] = { lat: lat + 0.05, lng: lng + 0.06 };
      }
    });

    if (Object.keys(newLocs).length) {
      setSimLocations(prev => ({ ...prev, ...newLocs }));
      simTargetsRef.current = { ...simTargetsRef.current, ...newTargets };
    }
  }, []);

  const refresh = useCallback(async (silent = false) => {
    const token = process.env.REACT_APP_NAVPRO_JWT_TOKEN;
    if (!token) {
      setIsLive(false);
      setLastSync(new Date());
      return;
    }

    if (!silent) setLoading(true);
    setError(null);

    try {
      const [driversRes, vehiclesRes, docsRes] = await Promise.allSettled([
        fetchDrivers(0, 50),
        fetchVehicles(0, 50, 'ACTIVE'),
        fetchDocuments(0, 50),
      ]);

      if (driversRes.status === 'fulfilled' && driversRes.value?.data) {
        const normalized = driversRes.value.data.map(normalizeDriver);
        setDrivers(normalized);
        setIsLive(true);
        // Fire-and-forget: seed sim locations from real GPS trail
        seedRealLocations(normalized);
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
  }, [seedRealLocations]);

  // Initial fetch + polling
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    pollRef.current = setInterval(() => refresh(true), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [refresh]);

  // Simulation tick — moves each driver one step toward their target every 3 s
  useEffect(() => {
    const id = setInterval(() => {
      setSimLocations(prev => {
        const next = {};
        for (const [key, loc] of Object.entries(prev)) {
          const target = simTargetsRef.current[key];
          next[key] = target ? moveToward(loc, target) : loc;
        }
        return next;
      });
    }, SIM_TICK_MS);
    return () => clearInterval(id);
  }, []); // intentionally runs once; simTargetsRef is a ref so always current

  // Merge simulated lat/lng into the drivers array before returning
  const driversWithSim = drivers.map(d => {
    const key    = d.navpro_id || d.id;
    const simLoc = simLocations[key];
    return simLoc ? { ...d, lat: simLoc.lat, lng: simLoc.lng } : d;
  });

  const updateBill   = useCallback((id, patch) => setBills(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b)), []);
  const addBill      = useCallback((bill) => setBills(prev => [bill, ...prev]), []);
  const dismissAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), []);
  const updateDriver = useCallback((id, patch) => setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d)), []);

  return {
    drivers: driversWithSim,
    loads, alerts, bills, vehicles,
    loading, error, lastSync, isLive,
    refresh, updateBill, addBill, dismissAlert, updateDriver,
  };
};

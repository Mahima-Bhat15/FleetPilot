// src/hooks/usePersistedTab.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fleetpilot_active_tab';

export const usePersistedTab = (defaultTab = 'SmartDispatch') => {
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || defaultTab; } catch { return defaultTab; }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const navigate = (tab) => {
    setActiveTab(tab);
    try { localStorage.setItem(STORAGE_KEY, tab); } catch {}
  };

  return { activeTab, navigate, isLoaded };
};

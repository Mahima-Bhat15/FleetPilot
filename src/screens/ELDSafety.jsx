// src/screens/ELDSafety.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { statusColor, hosColor } from "../utils/theme";
import { DRIVERS as MOCK_DRIVERS } from "../data/mockData";

const ELD_FIELDS = [
  { key: "fuel",   label: "Fuel Level",    unit: "%",   icon: "⛽", thresh: (v) => (v < 30 ? "crit" : v < 50 ? "warn" : "ok") },
  { key: "speed",  label: "Current Speed", unit: "mph", icon: "🚛", thresh: (v) => (v > 65 ? "warn" : "ok"), display: (v) => (v === 0 ? "Parked" : `${v} mph`) },
  { key: "tire",   label: "Tire Pressure", unit: "",    icon: "🔄", thresh: (v) => (v !== "OK" ? "crit" : "ok"), display: (v) => v },
  { key: "engine", label: "Engine Status", unit: "",    icon: "🔧", thresh: (v) => (v !== "OK" ? "warn" : "ok"), display: (v) => v },
  { key: "brake",  label: "Brake System",  unit: "",    icon: "🛑", thresh: (v) => (v === "FAIL" ? "crit" : v === "WARN" ? "warn" : "ok"), display: (v) => v },
  { key: "temp",   label: "Coolant Temp",  unit: "°F",  icon: "🌡️", thresh: (v) => (v > 225 ? "crit" : v > 220 ? "warn" : "ok") },
];

const SEV = {
  ok:   { val: "var(--green)", bg: "var(--green-bg)", label: "Normal" },
  warn: { val: "var(--amber)", bg: "var(--amber-bg)", label: "Warning" },
  crit: { val: "var(--red)",   bg: "var(--red-bg)",   label: "Critical" },
};

// Southwest US fallback positions (used when API returns no lat/lng)
const FALLBACK_LOCATIONS = [
  { lat: 33.4484, lng: -112.074  }, // Phoenix, AZ
  { lat: 32.2226, lng: -110.9747 }, // Tucson, AZ
  { lat: 35.1983, lng: -111.6513 }, // Flagstaff, AZ
  { lat: 35.0844, lng: -106.6504 }, // Albuquerque, NM
  { lat: 31.7619, lng: -106.485  }, // El Paso, TX
  { lat: 32.88,   lng: -111.76   }, // Casa Grande, AZ
];

const MAP_CENTER = { lat: 33.5, lng: -109 };
// Absolute fill — works regardless of parent flex/height
const MAP_CONTAINER_STYLE = { position: "absolute", inset: 0, width: "100%", height: "100%" };

// Pin SVG path (Google's standard teardrop shape, viewBox 0 0 24 24)
const PIN_PATH = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

export const ELDSafety = ({ drivers: liveDrivers }) => {
  const [selected, setSelected] = useState(0);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "fleetpilot-google-map",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  });

  // Use live drivers if available; fall back to mock drivers for map display
  const baseList = liveDrivers && liveDrivers.length > 0 ? liveDrivers : MOCK_DRIVERS;

  // Ensure every driver has a lat/lng — fill from FALLBACK_LOCATIONS if missing
  const driverList = baseList.map((d, i) => ({
    ...d,
    lat: d.lat || FALLBACK_LOCATIONS[i % FALLBACK_LOCATIONS.length].lat,
    lng: d.lng || FALLBACK_LOCATIONS[i % FALLBACK_LOCATIONS.length].lng,
  }));

  const driver = driverList[Math.min(selected, driverList.length - 1)] || driverList[0];

  // Set initial center/zoom in onLoad — avoids controlled prop fighting user pan
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    map.setCenter(MAP_CENTER);
    map.setZoom(6);
  }, []);

  // Pan to selected driver on selection change
  useEffect(() => {
    if (mapRef.current && driver?.lat && driver?.lng) {
      mapRef.current.panTo({ lat: driver.lat, lng: driver.lng });
      mapRef.current.setZoom(9);
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", background: "var(--bg)" }}>

      {/* Left: Truck list */}
      <div style={{ width: 100, background: "var(--surface)", borderRight: "1px solid var(--border)", paddingTop: 8, overflow: "auto", flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px", padding: "0 8px", marginBottom: 6 }}>Fleet</div>
        {driverList.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setSelected(i)}
            style={{
              width: "100%", display: "flex", alignItems: "flex-start", gap: 5,
              padding: "8px", borderBottom: "1px solid var(--border)",
              background: selected === i ? "var(--blue-bg)" : "transparent",
              cursor: "pointer", textAlign: "left",
              borderTop: "none", borderLeft: "none", borderRight: "none",
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(d.status), marginTop: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: selected === i ? "var(--primary)" : "var(--text)", fontFamily: "var(--font-mono)" }}>{d.id}</div>
              <div style={{ fontSize: 10, color: "var(--text2)" }}>{d.name.split(" ")[0]}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: hosColor(d.hos), fontFamily: "var(--font-mono)" }}>{d.hos}h HOS</div>
            </div>
            {d.status === "Dark" && (
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--red)", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginLeft: "auto" }}>!</div>
            )}
          </button>
        ))}
      </div>

      {/* Center: Map */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8, background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)" }}>Live Fleet Map — Southwest US</span>
          {driver && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${statusColor(driver.status)}`, borderRadius: "var(--radius-full)", padding: "3px 8px", background: statusColor(driver.status) + "22" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(driver.status) }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(driver.status) }}>{driver.status}</span>
            </div>
          )}
        </div>

        {/* Map area — position:relative lets the absolute map fill it */}
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          {loadError ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", gap: 8 }}>
              <div style={{ fontSize: 28 }}>⚠️</div>
              <div style={{ fontSize: 13, color: "var(--red-text)", fontWeight: 600 }}>Map failed to load</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>Check your API key and network connection</div>
            </div>
          ) : !isLoaded ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
              <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              onLoad={onMapLoad}
              options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControlOptions: { position: 7 },
              }}
            >
              {driverList.map((d, i) => (
                <Marker
                  key={d.id}
                  position={{ lat: d.lat, lng: d.lng }}
                  onClick={() => setSelected(i)}
                  label={{
                    text: d.id.replace("TRK-", "#"),
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: "700",
                  }}
                  icon={{
                    path: PIN_PATH,
                    fillColor: statusColor(d.status),
                    fillOpacity: 1,
                    strokeColor: i === selected ? "#ffffff" : "rgba(0,0,0,0.25)",
                    strokeWeight: i === selected ? 2 : 1,
                    scale: i === selected ? 2.4 : 1.8,
                    anchor: new window.google.maps.Point(12, 22),
                    labelOrigin: new window.google.maps.Point(12, 9),
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>

      {/* Right: Live ELD */}
      <div style={{ width: 210, background: "var(--surface)", borderLeft: "1px solid var(--border)", paddingTop: 10, paddingInline: 8, overflow: "auto", flexShrink: 0 }}>
        {!driver ? (
          <div style={{ fontSize: 12, color: "var(--text3)", padding: 12, textAlign: "center" }}>No drivers synced yet</div>
        ) : (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Live ELD — {driver.id}</div>
            <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 8 }}>{driver.name}</div>

            {driver.eld === null || driver.eld === undefined ? (
              <div style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: "var(--radius-md)", padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🔴</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red-text)" }}>No ELD signal</div>
                <div style={{ fontSize: 11, color: "var(--red-text)", marginTop: 4 }}>Last known: I-10 MM188</div>
                <button
                  onClick={() => alert("📞 Calling driver...")}
                  style={{ marginTop: 8, background: "var(--red)", border: "none", borderRadius: "var(--radius-md)", padding: "5px 14px", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                >
                  Call Driver
                </button>
              </div>
            ) : (
              <>
                {ELD_FIELDS.map((field) => {
                  const raw = driver.eld[field.key];
                  const sev = field.thresh(raw);
                  const cfg = SEV[sev];
                  const display = field.display ? field.display(raw) : `${raw}${field.unit}`;
                  return (
                    <div key={field.key} style={{ display: "flex", alignItems: "center", gap: 8, background: cfg.bg, border: `1px solid ${cfg.val}44`, borderRadius: "var(--radius-md)", padding: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{field.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 1 }}>{field.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: cfg.val, fontFamily: "var(--font-mono)" }}>{display}</div>
                      </div>
                      <div style={{ border: `1px solid ${cfg.val}66`, borderRadius: "var(--radius-full)", padding: "2px 5px", background: cfg.val + "22" }}>
                        <span style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", color: cfg.val }}>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                  {[
                    ["Odometer", `${driver.eld.odometer?.toLocaleString()} mi`],
                    ["RPM", driver.eld.rpm],
                    ["Qualify", driver.qual, "var(--primary)"],
                    ["On-Time", `${driver.ontime}%`, driver.ontime >= 90 ? "var(--green)" : "var(--amber)"],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ background: "var(--bg)", borderRadius: 5, border: "1px solid var(--border)", padding: 6, minWidth: "45%", flex: 1 }}>
                      <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)", color: color || "var(--text)" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

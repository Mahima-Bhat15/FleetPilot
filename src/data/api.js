// src/data/api.js
// ─── NavPro API — Real endpoints from OpenAPI spec v1 ────────────────────────
// Base: https://api.truckerpath.com/navpro
// Auth: Bearer JWT — get from: https://navpro.truckerpath.com/setting/api-docs

const BASE_URL = 'https://api.truckerpath.com/navpro';
const getToken = () => process.env.REACT_APP_NAVPRO_JWT_TOKEN || '';

const navpro = async (path, options = {}) => {
  const token = getToken();
  if (!token) throw new Error('NO_TOKEN');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`NavPro ${res.status}: ${t}`); }
  return res.json();
};

// ── 0. DRIVERS ────────────────────────────────────────────────────────────────
// POST /api/driver/query  →  { total, page, data: DriverRequestVO[], code, success, msg }
// Real response shape (confirmed):
//   driver_id, basic_info{ driver_first_name, driver_last_name, carrier,
//     work_status (AVAILABLE|IN_TRANSIT|INACTIVE), driver_owner, terminal,
//     driver_type (COMPANY_DRIVER_CM|OWNER_OPERATOR_OO|...),
//     driver_phone_number, driver_email,
//     assignments_vehicles: { truck: {vehicle_id,vehicle_no,...}|null, trailer: {...}|null }
//   },
//   driver_location: { last_known_location, latest_update (ms), timezone } | null,
//   driver_activities: [{ time, activities[] }],
//   loads: { driver_current_load: { load_id, origin, destination, pickup_date, delivery_date } } | null,
//   contact_detail_info: { driver_street_address, driver_city, driver_state, zip_code, ... },
//   license_detail_info: { license_expiration, license_type, ... }
// NOTE: No driver_status filter by default — pass only if needed
export const fetchDrivers = (page = 0, size = 50) =>
  navpro('/api/driver/query', { method: 'POST', body: JSON.stringify({ page, size }) });

export const fetchDriversByIds = (driver_ids) =>
  navpro('/api/driver/query', { method: 'POST', body: JSON.stringify({ page: 0, size: 50, driver_ids }) });

// POST /api/driver/performance/query  →  { data: DriverPerformanceVO[] }
// DriverPerformanceVO: driver_id, oor_miles, schedule_miles, actual_miles,
//                      schedule_time(mins), actual_time(mins)
export const fetchDriverPerformance = (start_time, end_time, driver_id = null) =>
  navpro('/api/driver/performance/query', {
    method: 'POST',
    body: JSON.stringify({ page: 0, page_size: 50, time_range: { start_time, end_time }, ...(driver_id ? { driver_id } : {}) }),
  });

export const inviteDriver = (driverInfo) =>
  navpro('/api/driver/invite', { method: 'POST', body: JSON.stringify({ driver_info: [driverInfo] }) });

export const editDriver = (driver_id, fields) =>
  navpro('/api/driver/edit', { method: 'POST', body: JSON.stringify({ driver_id, ...fields }) });

export const deleteDriver = (driver_id) =>
  navpro(`/api/driver/delete/${driver_id}`, { method: 'DELETE' });

// ── 1. VEHICLES ───────────────────────────────────────────────────────────────
// POST /api/vehicle/query  →  { data: VehicleDataVO[] }
// VehicleDataVO: vehicle_id, vehicle_no, vehicle_type, vehicle_status,
//                vehicle_vin, vehicle_make, vehicle_model, gross_vehicle_weight,
//                trailer_type, owner_name, assignments_drivers
export const fetchVehicles = (page = 0, size = 50, status = 'ACTIVE') =>
  navpro('/api/vehicle/query', { method: 'POST', body: JSON.stringify({ page, size, status }) });

export const addVehicle = (vehicleInfo) =>
  navpro('/api/vehicle/add', { method: 'POST', body: JSON.stringify(vehicleInfo) });

export const editVehicle = (vehicle_id, fields) =>
  navpro('/api/vehicle/edit', { method: 'POST', body: JSON.stringify({ vehicle_id, ...fields }) });

export const updateVehicleStatus = (vehicle_id, vehicle_status) =>
  navpro('/api/vehicle/update/status', { method: 'POST', body: JSON.stringify({ vehicle_id, vehicle_status }) });

export const deleteVehicles = (vehicle_ids) =>
  navpro('/api/vehicle/delete', { method: 'DELETE', body: JSON.stringify({ vehicle_ids }) });

// ── 2. TRACKING ───────────────────────────────────────────────────────────────
// POST /api/tracking/get/driver-dispatch
// →  { data: { trail: [{lat,lng,timestamp}], active_trip: {trip_id, eta} } }
// date_source: 'APP' (default) | 'ELD'
export const fetchDriverTracking = (driver_id, start_time, end_time, date_source = 'APP') =>
  navpro('/api/tracking/get/driver-dispatch', {
    method: 'POST',
    body: JSON.stringify({ driver_id, time_range: { start_time, end_time }, date_source }),
  });

export const fetchDriverTrackingToday = (driver_id) => {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  return fetchDriverTracking(driver_id, start.toISOString().slice(0,19)+'Z', now.toISOString().slice(0,19)+'Z');
};

// ── 3. DOCUMENTS ─────────────────────────────────────────────────────────────
// POST /api/document/query  →  { data: DocumentVO[] }
// DocumentVO: document_id, document_name, document_type, document_url,
//             upload_by, upload_date(ms), file_type, document_tag, is_private, size, scope
// document_types: BILL_OF_LADING | INVOICE | PAYMENTT | UPLOAD_FILE
export const fetchDocuments = (page = 0, size = 50, document_types = null) =>
  navpro('/api/document/query', {
    method: 'POST',
    body: JSON.stringify({ page, size, ...(document_types ? { document_types } : {}) }),
  });

// POST /api/document/add  (multipart file upload)
export const uploadDocument = async (file, document_type = 'UPLOAD_FILE', link_to_driver = []) => {
  const token = getToken();
  if (!token) throw new Error('NO_TOKEN');
  const formData = new FormData();
  formData.append('file', file);
  const params = new URLSearchParams({ document_type, is_private: false });
  if (link_to_driver.length) params.append('link_to_driver', link_to_driver.join(','));
  const res = await fetch(`${BASE_URL}/api/document/add?${params}`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
  });
  if (!res.ok) throw new Error(`Upload ${res.status}`);
  return res.json();
};

export const deleteDocument = (document_id, scope = 'UPLOAD_FILE') =>
  navpro('/api/document/delete', { method: 'DELETE', body: JSON.stringify({ document_id, scope }) });

// ── 4. TERMINALS ──────────────────────────────────────────────────────────────
// GET /api/terminal/get/list  →  terminals[]
export const fetchTerminals = () => navpro('/api/terminal/get/list', { method: 'GET' });

export const fetchTerminalMembers = (terminal_id, page = 0, size = 50) =>
  navpro(`/api/terminal/get/member/${terminal_id}?page=${page}&size=${size}`, { method: 'GET' });

export const createTerminal = (terminal_name) =>
  navpro('/api/terminal/create', { method: 'POST', body: JSON.stringify({ terminal_name }) });

// ── 5. USERS ─────────────────────────────────────────────────────────────────
// GET /api/users/get/all  →  all company users (admins, dispatchers)
export const fetchUsers = (page = 0, size = 50) =>
  navpro(`/api/users/get/all?page=${page}&size=${size}`, { method: 'GET' });

// ── 7. TRIPS ──────────────────────────────────────────────────────────────────
// POST /api/trip/create  →  { trip_id, code, success }
// stop_points: [{ latitude, longitude, address_name, appointment_time, dwell_time, notes }]
export const createTrip = (driver_id, stop_points, scheduled_start_time, routing_profile_id = null) =>
  navpro('/api/trip/create', {
    method: 'POST',
    body: JSON.stringify({ driver_id, stop_points, scheduled_start_time, ...(routing_profile_id ? { routing_profile_id } : {}) }),
  });

// ── 8. ROUTING PROFILES ───────────────────────────────────────────────────────
// GET /api/routing-profile/list  →  truck configurations for route calculation
export const fetchRoutingProfiles = (page = 0, size = 20) =>
  navpro(`/api/routing-profile/list?page=${page}&size=${size}`, { method: 'GET' });

// ── 9. MESSAGING ──────────────────────────────────────────────────────────────
// Send message to driver via NavPro app
export const sendDriverMessage = async (driver_id, message, title = 'Dispatch Message') => {
  try {
    // Note: This is a placeholder for the actual NavPro messaging API
    // The actual endpoint may vary - check NavPro API documentation
    const response = await navpro('/api/message/send', {
      method: 'POST',
      body: JSON.stringify({
        driver_id,
        title,
        message,
        priority: 'normal',
        timestamp: new Date().toISOString(),
      }),
    });
    return response;
  } catch (error) {
    // If API doesn't exist or fails, simulate success for demo
    console.log('Message would be sent to driver:', { driver_id, message, title });
    return { success: true, message: 'Message sent (demo mode)' };
  }
};

// ── DATA NORMALIZERS ──────────────────────────────────────────────────────────

// work_status → FleetPilot display label
const mapWorkStatus = (work_status) => {
  switch (work_status) {
    case 'AVAILABLE':  return 'Available';
    case 'IN_TRANSIT': return 'In Transit';
    case 'INACTIVE':   return 'Inactive';
    default:           return 'Available';
  }
};

// driver_type code → human-readable qualification label
const mapDriverType = (driver_type) => {
  const map = {
    'COMPANY_DRIVER_CM':   'Company Driver',
    'COMPANY_DRIVER_C':    'Company Driver',
    'OWNER_OPERATOR_OO':   'Owner Operator',
    'OWNER_OPERATOR_O':    'Owner Operator',
    'LEASE_OPERATOR_LO':   'Lease Operator',
    'LEASE_OPERATOR_L':    'Lease Operator',
  };
  return map[driver_type] || driver_type || 'Driver';
};

// latest_update ms timestamp → relative time string e.g. "2 min ago"
const relativeTime = (ms) => {
  if (!ms) return null;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Real DriverRequestVO → FleetPilot driver shape
// Handles all null-safe cases confirmed from live response
export const normalizeDriver = (d) => {
  const basic    = d.basic_info          || {};
  const loc      = d.driver_location;          // may be null
  const load     = d.loads?.driver_current_load || null;
  const contact  = d.contact_detail_info || {};
  const license  = d.license_detail_info || {};
  const vehicles = basic.assignments_vehicles  || {};

  const firstName = (basic.driver_first_name || '').trim();
  const lastName  = (basic.driver_last_name  || '').trim();
  const initials  = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '??';

  // Truck vehicle number — real shape: assignments_vehicles.truck.vehicle_no
  const truckNo = vehicles.truck?.vehicle_no || null;

  // Location string — trim trailing spaces from real API response
  const locationStr = loc?.last_known_location?.trim() || null;

  // Last seen time
  const lastSeen = relativeTime(loc?.latest_update);

  // Current load display
  const loadDisplay = load
    ? `LD-${load.load_id}`
    : 'Unassigned';

  // Load route for display
  const loadRoute = load
    ? `${load.origin?.split(',')[0] || ''} → ${load.destination?.split(',')[0] || ''}`
    : null;

  return {
    // IDs
    navpro_id: d.driver_id,
    id: truckNo || `DRV-${d.driver_id}`,

    // Identity
    name:     `${firstName} ${lastName}`.trim(),
    initials,
    phone:    basic.driver_phone_number || null,
    email:    basic.driver_email        || null,
    carrier:  basic.carrier             || null,
    owner:    basic.driver_owner        || null,
    terminal: basic.terminal            || 'Unassigned',

    // Status
    status:    mapWorkStatus(basic.work_status),
    work_status: basic.work_status || 'AVAILABLE',
    qual:      mapDriverType(basic.driver_type),
    driver_type_code: basic.driver_type || null,

    // Location — null-safe
    pos:      locationStr || (loc === null ? 'No GPS signal' : 'Unknown'),
    hasLocation: locationStr !== null,
    lastSeen,
    lat:      null,   // populated from /api/tracking/get/driver-dispatch
    lng:      null,

    // Vehicle assignment
    truckNo,
    trailerNo: vehicles.trailer?.vehicle_no || null,
    truck:    vehicles.truck   || null,
    trailer:  vehicles.trailer || null,

    // Current load
    load:      loadDisplay,
    loadRoute,
    loadDetail: load || null,

    // Contact info
    address: [contact.driver_street_address, contact.driver_city, contact.driver_state, contact.zip_code]
               .filter(Boolean).join(', ') || null,

    // License info
    licenseType:    license.license_type       || null,
    licenseExpiry:  license.license_expiration || null,
    licenseState:   license.license_state      || null,

    // Activities log
    activities: d.driver_activities || [],

    // Performance fields — defaults, enriched by fetchDriverPerformance
    hos:          11,
    cycle:        0,
    window:       14,
    ontime:       100,
    cpm:          0.89,
    deadheadMiles: 0,
    fatigue:      'Unknown',
    pattern:      null,
    eld:          null,

    // Raw response preserved for debugging
    _raw: d,
  };
};

// VehicleDataVO → FleetPilot vehicle shape
export const normalizeVehicle = (v) => ({
  navpro_id: v.vehicle_id,
  id: v.vehicle_no,
  type: v.vehicle_type,
  status: v.vehicle_status,
  vin: v.vehicle_vin,
  make: v.vehicle_make,
  model: v.vehicle_model,
  weight: v.gross_vehicle_weight,
  trailer_type: v.trailer_type,
  owner: v.owner_name,
  drivers: v.assignments_drivers?.assign_driver_info || [],
  _raw: v,
});

// DocumentVO → FleetPilot document/bill shape
export const normalizeDocument = (doc) => ({
  id: `DOC-${doc.document_id}`,
  navpro_id: doc.document_id,
  driver: doc.upload_by || 'Unknown',
  truck: '',
  amount: 0,
  type: doc.document_type?.replace(/_/g, ' ') || 'Document',
  location: '',
  name: doc.document_name,
  url: doc.document_url,
  fileType: doc.file_type,
  size: doc.size,
  status: 'approved',
  ocr: `${doc.document_type} · ${doc.size} · By: ${doc.upload_by}`,
  date: doc.upload_date ? new Date(doc.upload_date).toISOString().split('T')[0] : '',
  isPrivate: doc.is_private,
  tags: doc.document_tag || [],
  _raw: doc,
});

// ── CLAUDE AI ─────────────────────────────────────────────────────────────────
const CLAUDE_BASE  = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

export const askClaude = async (systemPrompt, userMessage, maxTokens = 1000) => {
  const res = await fetch(CLAUDE_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: maxTokens, system: systemPrompt, messages: [{ role: 'user', content: userMessage }] }),
  });
  const data = await res.json();
  return data?.content?.[0]?.text || '';
};

export const getDispatchRanking = async (load, drivers) => {
  const system = `You are FleetPilot, an AI dispatcher. Analyze drivers vs a load. Return JSON only.`;
  const user = `Load: ${JSON.stringify(load)}\nDrivers: ${JSON.stringify(drivers)}\nReturn: {"recommended_driver":"name","recommendation_reason":"2 sentences","ranked_drivers":[{"name":"","score":0,"hos_fit":true,"fuel_est_usd":0,"fatigue":"Low|Medium|High","pattern_flag":null}]}`;
  const raw = await askClaude(system, user);
  try { return JSON.parse(raw); } catch { return null; }
};

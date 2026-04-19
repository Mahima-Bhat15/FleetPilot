// src/utils/hosUtils.js
// ─── FMCSA HOS Calculation Engine (49 CFR Part 395) ─────────────────────────
// Purely functional — no side effects. Used by SmartDispatch for eligibility
// checks and by the AI dispatch ranking prompt.

import { HOS } from './constants';

/**
 * Check whether a driver is legally eligible to take a load.
 * Returns { eligible, reason, ruleViolated }
 */
export const checkHOSEligibility = (driver, loadDriveHours) => {
  // Gate 1 — 11-hour daily drive limit (§395.3(a)(3))
  if (driver.hos < loadDriveHours) {
    return {
      eligible: false,
      reason: `Insufficient drive time: ${driver.hos}h remaining, load needs ${loadDriveHours}h`,
      ruleViolated: '§395.3(a)(3) — 11-hour driving limit',
    };
  }

  // Gate 2 — 14-hour window (§395.3(a)(2))
  if (driver.window !== null && driver.window < loadDriveHours) {
    return {
      eligible: false,
      reason: `Driving window closes in ${driver.window}h, before load completes`,
      ruleViolated: '§395.3(a)(2) — 14-hour driving window',
    };
  }

  // Gate 3 — 60/70-hour cycle (§395.3(b))
  if (driver.cycle >= HOS.CRIT_CYCLE_THRESHOLD) {
    return {
      eligible: false,
      reason: `${driver.cycle}h of 70h cycle used — approaching limit`,
      ruleViolated: '§395.3(b) — 60/70-hour rule',
    };
  }

  // Warning zone (not a block, but flag it)
  if (driver.hos < HOS.WARN_HOS_THRESHOLD) {
    return {
      eligible: true,
      warning: true,
      reason: `Driver has only ${driver.hos}h remaining — close to limit`,
      ruleViolated: null,
    };
  }

  return { eligible: true, warning: false, reason: null, ruleViolated: null };
};

/**
 * Predict when the driver will breach HOS given current speed and distance.
 * Returns ISO timestamp string or null.
 */
export const predictHOSBreach = (driver, remainingMiles, currentSpeedMph) => {
  if (!currentSpeedMph || currentSpeedMph === 0) return null;
  const hoursToDestination = remainingMiles / currentSpeedMph;
  if (hoursToDestination > driver.hos) {
    const breachInMs = driver.hos * 60 * 60 * 1000;
    return new Date(Date.now() + breachInMs).toISOString();
  }
  return null;
};

/**
 * Determine whether a driver needs a 30-minute break before continuing.
 * @param {number} continuousDriveHours — hours since last qualifying break
 */
export const needsBreak = (continuousDriveHours) =>
  continuousDriveHours >= HOS.BREAK_AFTER_HOURS;

/**
 * Calculate dispatch score for a driver against a load.
 * Returns 0–100 integer.
 */
export const calcDispatchScore = (driver, load, weights = {}) => {
  const w = {
    hos:      0.35,
    deadhead: 0.25,
    fuel:     0.20,
    fatigue:  0.10,
    pattern:  0.10,
    ...weights,
  };

  // HOS fitness (0–1)
  const hosScore = driver.hos >= load.hosNeeded
    ? Math.min(1, driver.hos / HOS.MAX_DRIVE_HOURS)
    : 0;

  // Deadhead (0–1, lower miles = higher score; cap at 300mi)
  const deadheadScore = Math.max(0, 1 - driver.deadheadMiles / 300);

  // Fuel (0–1, normalize against fleet avg cost of $0.90/mi)
  const fuelScore = Math.max(0, 1 - (driver.cpm - 0.80) / 0.20);

  // Fatigue (0–1)
  const fatigueMap = { Low: 1, Medium: 0.6, High: 0.2, Unknown: 0.4 };
  const fatigueScore = fatigueMap[driver.fatigue] ?? 0.4;

  // Pattern (0–1)
  const patternScore = driver.pattern ? 0.5 : 1.0;

  const raw =
    hosScore    * w.hos     +
    deadheadScore * w.deadhead +
    fuelScore   * w.fuel    +
    fatigueScore * w.fatigue +
    patternScore * w.pattern;

  return Math.round(raw * 100);
};

/**
 * Check for ripple: does assigning this driver today block a future load?
 * @param {Object} driver
 * @param {Array}  tomorrowLoads
 * @returns {string|null} ripple warning text or null
 */
export const checkRipple = (driver, tomorrowLoads = []) => {
  for (const load of tomorrowLoads) {
    // Flatbed qualification check
    if (load.type === 'Flatbed' && driver.qual !== 'Flatbed') {
      return `Only flatbed-qualified driver for tomorrow's Load ${load.id} (${load.pickupTime})`;
    }
    // Reefer qualification check
    if (load.type === 'Reefer' && driver.qual !== 'Reefer') {
      return `Only reefer-qualified driver for tomorrow's Load ${load.id} (${load.pickupTime})`;
    }
  }
  return null;
};

/**
 * Format HOS remaining as human-readable string.
 */
export const formatHOS = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

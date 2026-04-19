// src/utils/constants.js
// ─── App-wide constants ───────────────────────────────────────────────────────

export const APP_VERSION = '1.0.0';

// NavPro API
export const NAVPRO_BASE_URL = 'https://api.truckerpath.com/navpro/v1';

// Claude AI
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
export const CLAUDE_BASE_URL = 'https://api.anthropic.com/v1/messages';

// Polling
export const POLL_INTERVAL_MS = 30_000;

// HOS thresholds (FMCSA 49 CFR §395)
export const HOS = {
  MAX_DRIVE_HOURS:      11,    // §395.3(a)(3) — max driving after 10h off
  WINDOW_HOURS:         14,    // §395.3(a)(2) — driving window
  BREAK_AFTER_HOURS:    8,     // §395.3(a)(3)(ii) — break required after 8h driving
  BREAK_DURATION_MIN:   30,    // 30-minute minimum break
  CYCLE_7_DAY_HOURS:    60,    // §395.3(b)(1)
  CYCLE_8_DAY_HOURS:    70,    // §395.3(b)(2)
  OFF_DUTY_RESET_HOURS: 10,    // Consecutive off-duty required to reset drive window
  RESTART_HOURS:        34,    // 34h restart to reset 60/70h cycle
  WARN_HOS_THRESHOLD:   4,     // Yellow warning at 4h remaining
  CRIT_HOS_THRESHOLD:   2,     // Red alert at 2h remaining
  WARN_CYCLE_THRESHOLD: 55,    // Yellow warning at 55h of cycle
  CRIT_CYCLE_THRESHOLD: 65,    // Red alert at 65h of cycle
};

// ELD thresholds
export const ELD = {
  FUEL_WARN_PCT:        50,    // Warn below 50% fuel
  FUEL_CRIT_PCT:        30,    // Critical below 30% fuel
  SPEED_LIMIT_MPH:      65,    // Over-speed warning
  COOLANT_WARN_F:       220,   // Coolant temp warning
  COOLANT_CRIT_F:       225,   // Coolant temp critical
};

// Dispatch scoring weights
export const DISPATCH_WEIGHTS = {
  HOS_FIT:    0.35,   // 35% — can the driver legally complete this load?
  DEADHEAD:   0.25,   // 25% — proximity to pickup
  FUEL_COST:  0.20,   // 20% — estimated fuel economy
  FATIGUE:    0.10,   // 10% — driver rest/fatigue state
  PATTERN:    0.10,   // 10% — historical performance on similar lanes
};

// Bonus program
export const BONUS = {
  BASELINE_CPM:      0.90,   // Fleet average cost per mile
  DRIVER_SHARE_PCT:  0.30,   // Driver keeps 30% of savings vs baseline
  MIN_MILES:         200,    // Minimum consignment miles to qualify
};

// Map defaults
export const MAP_DEFAULTS = {
  latitude:       34.05,
  longitude:     -111.09,
  latitudeDelta:  5.0,
  longitudeDelta: 6.0,
};

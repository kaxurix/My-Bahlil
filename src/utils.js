// LocalStorage keys
export const STORAGE_KEY          = 'mybahlil_fuel_tracker';
export const STORAGE_KEY_VEHICLES = 'mybahlil_vehicles';

// Default fuel prices (IDR per liter)
export const DEFAULT_PRICES = {
  pertalite: 10000,
  pertamax:  16250,
};

// ─── Vehicles ────────────────────────────────────────────────────────────────

/** @typedef {{ id: string, name: string, tankCapacity: number, createdAt: string }} Vehicle */

/** Load vehicles from localStorage */
export function loadVehicles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Save vehicles to localStorage */
export function saveVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
}

// ─── Fuel gauge (dynamic per tankCapacity) ───────────────────────────────────

/**
 * Build gauge level thresholds for a given tank capacity.
 * Divides the tank into 6 equal bars.
 * Bar 1 amber  = 1–2 bars worth (low)
 * Bar 1 red    = below 1 bar worth (critical)
 */
export function buildGaugeLevels(tankCapacity) {
  const step = tankCapacity / 6;
  return [
    { min: step * 5, max: tankCapacity, bars: 6 },
    { min: step * 4, max: step * 5,    bars: 5 },
    { min: step * 3, max: step * 4,    bars: 4 },
    { min: step * 2, max: step * 3,    bars: 3 },
    { min: step * 1, max: step * 2,    bars: 2 },
    { min: step * 0.6, max: step * 1, bars: 1, color: 'amber' },
    { min: 0,          max: step * 0.6, bars: 1, color: 'red', critical: true },
  ];
}

/**
 * Returns bar count, color, and critical flag for a given fuel level.
 * @param {number} liters
 * @param {number} tankCapacity
 */
export function getBarsForLevel(liters, tankCapacity) {
  const levels = buildGaugeLevels(tankCapacity);
  for (const level of levels) {
    if (liters > level.min && liters <= level.max) {
      return { bars: level.bars, color: level.color || 'green', critical: level.critical || false };
    }
  }
  if (liters <= 0)              return { bars: 1, color: 'red',   critical: true  };
  if (liters >= tankCapacity)   return { bars: 6, color: 'green', critical: false };
  return { bars: 1, color: 'amber', critical: false };
}

/**
 * Build BAR_META array for the gauge visual (6 bars, proportional labels).
 * @param {number} tankCapacity
 */
export function buildBarMeta(tankCapacity) {
  const step = tankCapacity / 6;
  return [
    { bar: 1, min: 0,        max: step * 1, label: `<${step.toFixed(1)}L` },
    { bar: 2, min: step * 1, max: step * 2, label: `~${(step * 2).toFixed(1)}L` },
    { bar: 3, min: step * 2, max: step * 3, label: `~${(step * 3).toFixed(1)}L` },
    { bar: 4, min: step * 3, max: step * 4, label: `~${(step * 4).toFixed(1)}L` },
    { bar: 5, min: step * 4, max: step * 5, label: `~${(step * 5).toFixed(1)}L` },
    { bar: 6, min: step * 5, max: tankCapacity, label: `~${tankCapacity.toFixed(1)}L` },
  ];
}

// ─── Logs ────────────────────────────────────────────────────────────────────

/** Load logs from localStorage */
export function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Save logs to localStorage */
export function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/** Format IDR currency */
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format ISO date string to Indonesian locale */
export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Get "Month YYYY" key for grouping */
export function getMonthKey(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

/** Current month key */
export function currentMonthKey() {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

/** Generate unique ID */
export function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

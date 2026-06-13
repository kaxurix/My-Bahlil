// LocalStorage key
export const STORAGE_KEY = 'mybahlil_fuel_tracker';

// Tank specs
export const MAX_TANK = 5.5;

// Default fuel prices (IDR per liter)
export const DEFAULT_PRICES = {
  pertalite: 10000,
  pertamax: 16250,
};

// Fuel gauge level thresholds
export const GAUGE_LEVELS = [
  { min: 4.8, max: 5.5, bars: 6 },
  { min: 4.0, max: 4.8, bars: 5 },
  { min: 3.2, max: 4.0, bars: 4 },
  { min: 2.4, max: 3.2, bars: 3 },
  { min: 1.6, max: 2.4, bars: 2 },
  { min: 1.0, max: 1.6, bars: 1, color: 'amber' },
  { min: 0,   max: 1.0, bars: 1, color: 'red', critical: true },
];

export function getBarsForLevel(liters) {
  for (const level of GAUGE_LEVELS) {
    if (liters > level.min && liters <= level.max) {
      return { bars: level.bars, color: level.color || 'green', critical: level.critical || false };
    }
  }
  // Edge: exactly 0
  if (liters <= 0) return { bars: 1, color: 'red', critical: true };
  // Edge: full
  if (liters >= 5.5) return { bars: 6, color: 'green', critical: false };
  return { bars: 1, color: 'amber', critical: false };
}

// Load logs from localStorage
export function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save logs to localStorage
export function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// Format currency (IDR)
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date for display
export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get "Month YYYY" key for grouping
export function getMonthKey(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// Current month key
export function currentMonthKey() {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// Generate unique ID
export function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

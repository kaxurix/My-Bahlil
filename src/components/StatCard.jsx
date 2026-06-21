import { formatRupiah } from '../utils';

const STAT_MOBILE_CSS = `
  .metric-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    gap: 12px;
  }
  .metric-icon {
    flex-shrink: 0;
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
  }
  .metric-label {
    font-size: 12px; font-weight: 600; color: var(--ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .metric-sub {
    font-size: 11px; color: var(--ink-3); margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .metric-value {
    font-size: 20px; font-weight: 700; line-height: 1;
    text-align: right; flex-shrink: 0;
  }
  .metric-range {
    font-size: 11px; font-weight: 600; color: var(--ink-3);
    text-align: right; margin-top: 3px;
  }
  @media (max-width: 400px) {
    .metric-row { padding: 11px 14px; gap: 10px; }
    .metric-icon { width: 30px; height: 30px; }
    .metric-value { font-size: 16px; }
    .metric-label { font-size: 11px; }
    .metric-sub   { font-size: 10px; }
    .metric-range { font-size: 10px; }
  }
`;

/* ── Single unified card with metrics ── */
export function AnalyticsDashboard({ logs, vehicleId, tankCapacity = 5.5 }) {
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();

  // Filter by active vehicle AND current month
  const vLogs = vehicleId ? logs.filter(l => l.vehicleId === vehicleId) : logs;
  const ml = vLogs.filter(l => {
    const d = new Date(l.date);
    return d.getMonth() === cm && d.getFullYear() === cy;
  });

  const spent   = ml.reduce((s, l) => s + l.nominal, 0);
  const liters  = ml.reduce((s, l) => s + l.liters,  0);
  const avgFill = ml.length ? spent / ml.length : 0;

  // Real efficiency: last 2 logs with odometer for this vehicle
  let eff = null;
  const odo = [...vLogs]
    .filter(l => l.odometer != null)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  if (odo.length >= 2) {
    const diff = odo[0].odometer - odo[1].odometer;
    if (diff > 0 && odo[1].liters > 0) eff = diff / odo[1].liters;
  }

  // Default efficiency based on tank size — only shown if user has at least one log
  const defaultEff   = tankCapacity < 15 ? 50 : 14;
  const hasAnyLogs   = vLogs.length > 0;
  const effDisplay   = eff ?? (hasAnyLogs ? defaultEff : null);
  const isDefaultEff = effDisplay !== null && eff === null;  // using placeholder, not real data

  // Last odometer reading
  const lastOdo = odo[0]?.odometer ?? null;

  const effLabel = effDisplay == null ? '—'
    : effDisplay >= 20 ? 'Sangat Irit'
    : effDisplay >= 12 ? 'Normal'
    : 'Boros';

  const effColor = effDisplay == null ? 'var(--ink-3)'
    : effDisplay >= 12 ? 'var(--blue)'
    : 'var(--amber)';

  // Full-tank range
  const range = effDisplay != null ? Math.round(effDisplay * tankCapacity) : null;

  const metrics = [
    {
      label: 'Pengeluaran Bulan Ini',
      value: formatRupiah(spent),
      sub: ml.length
        ? `${ml.length} pengisian · ~${formatRupiah(Math.round(avgFill))}/isi`
        : 'Belum ada pengisian',
      valueColor: 'var(--red)',
      bg: 'var(--red-faint)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="13" rx="2.5"/>
          <path d="M2 10h20"/>
          <circle cx="17" cy="15.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
    {
      label: 'Total Liter Bulan Ini',
      value: `${liters.toFixed(2)} L`,
      sub: ml.length ? `dari ${ml.length} pengisian` : 'Belum ada data',
      valueColor: 'var(--blue)',
      bg: 'var(--blue-faint)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      ),
    },
    {
      label: 'Efisiensi BBM',
      value: effDisplay != null
        ? `${isDefaultEff ? '~' : ''}${effDisplay.toFixed(1)} km/L`
        : '—',
      sub: isDefaultEff
        ? `Estimasi awal · isi odometer untuk data nyata`
        : eff != null
        ? effLabel
        : lastOdo != null
        ? 'Butuh 2+ log odometer'
        : 'Isi odometer saat mencatat',
      valueColor: effColor,
      bg: effDisplay != null && effDisplay >= 12 ? 'var(--blue-faint)' : 'var(--amb-bg)',
      // Extra: full tank range shown below value
      range: range != null
        ? `~${range.toLocaleString('id-ID')} km full tank`
        : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.34 15a10 10 0 1 1 17.32 0"/>
          <line x1="12" y1="12" x2="15.5" y2="8.5"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
  ];

  // Odometer row — only if there's data
  if (lastOdo != null) {
    metrics.push({
      label: 'Odometer Terakhir',
      value: `${lastOdo.toLocaleString('id-ID')} km`,
      sub: odo[0]
        ? `per ${new Date(odo[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
        : '',
      valueColor: 'var(--ink-2)',
      bg: 'var(--surf-2)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    });
  }

  return (
    <>
      <style>{STAT_MOBILE_CSS}</style>
      <div className="card" style={{ overflow: 'hidden' }}>
        {metrics.map((m, i) => (
          <div key={i} className="metric-row" style={{
            borderBottom: i < metrics.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            {/* Left: icon + label + sub */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <div className="metric-icon" style={{
                background: m.bg,
                color: m.valueColor,
              }}>
                {m.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="metric-label">{m.label}</p>
                <p className="metric-sub">{m.sub}</p>
              </div>
            </div>

            {/* Right: value + optional range */}
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <p className="metric-value" style={{ color: m.valueColor }}>
                {m.value}
              </p>
              {m.range && (
                <p className="metric-range">{m.range}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function StatCard() { return null; } // legacy — tidak dipakai lagi

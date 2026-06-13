import { formatRupiah } from '../utils';

/* ── Single unified card with 3 metrics side-by-side ── */
export function AnalyticsDashboard({ logs }) {
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();
  const ml = logs.filter(l => {
    const d = new Date(l.date);
    return d.getMonth() === cm && d.getFullYear() === cy;
  });

  const spent   = ml.reduce((s, l) => s + l.nominal, 0);
  const liters  = ml.reduce((s, l) => s + l.liters,  0);
  const avgFill = ml.length ? spent / ml.length : 0;

  let eff = null;
  const odo = [...logs]
    .filter(l => l.odometer != null)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  if (odo.length >= 2) {
    const diff = odo[0].odometer - odo[1].odometer;
    if (diff > 0 && odo[1].liters > 0) eff = diff / odo[1].liters;
  }

  const effLabel = eff == null
    ? '—'
    : eff >= 45 ? 'Sangat irit'
    : eff >= 35 ? 'Normal'
    : 'Boros';

  const effColor = eff == null ? 'var(--ink-3)'
    : eff >= 35   ? 'var(--blue)'
    : 'var(--amber)';

  const metrics = [
    {
      label: 'Pengeluaran Bulan Ini',
      value: formatRupiah(spent),
      sub: ml.length
        ? `${ml.length} pengisian · ~${formatRupiah(Math.round(avgFill))}/isi`
        : 'Belum ada pengisian',
      color: 'var(--red)',
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
      color: 'var(--blue)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      ),
    },
    {
      label: 'Efisiensi BBM',
      value: eff != null ? `${eff.toFixed(1)} km/L` : '—',
      sub: eff != null ? effLabel : 'Butuh 2+ log odometer',
      color: effColor,
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

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: i < metrics.length - 1 ? '1px solid var(--border)' : 'none',
          gap: 16,
        }}>
          {/* Left: icon + label + sub */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              flexShrink: 0,
              width: 34, height: 34, borderRadius: 9,
              background: m.color === 'var(--red)'
                ? 'var(--red-faint)'
                : m.color === 'var(--blue)'
                ? 'var(--blue-faint)'
                : 'var(--amb-bg)',
              color: m.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {m.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 12, fontWeight: 600, color: 'var(--ink-3)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {m.label}
              </p>
              <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>
                {m.sub}
              </p>
            </div>
          </div>

          {/* Right: big value */}
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: m.color,
              lineHeight: 1,
            }}>
              {m.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatCard() { return null; } // legacy — tidak dipakai lagi

import { formatRupiah } from '../utils';

/* Clean SVG icons */
const icons = {
  wallet: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2.5"/>
      <path d="M2 10h20"/>
      <circle cx="17" cy="15.5" r="1" fill={c} stroke="none"/>
    </svg>
  ),
  drop: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  speed: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.34 15a10 10 0 1 1 17.32 0"/>
      <line x1="12" y1="12" x2="15.5" y2="8.5"/>
      <circle cx="12" cy="12" r="1.5" fill={c} stroke="none"/>
    </svg>
  ),
};

function StatCard({ iconKey, label, value, sub, color = 'blue' }) {
  const palette = {
    blue:  { bg: 'var(--blue-faint)',  icon: 'var(--blue)',  val: 'var(--blue)',  border: 'var(--blue-tint)' },
    red:   { bg: 'var(--red-faint)',   icon: 'var(--red)',   val: 'var(--red)',   border: 'var(--red-tint)'  },
    amber: { bg: 'var(--amb-bg)',      icon: 'var(--amber)', val: 'var(--amber)', border: 'var(--amb-tint)'  },
  }[color];

  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        {icons[iconKey]?.(palette.icon)}
      </div>
      <p className="section-label" style={{ marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: palette.val, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 5, lineHeight: 1.4 }}>{sub}</p>}
    </div>
  );
}

export function AnalyticsDashboard({ logs, className }) {
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();
  const ml = logs.filter(l => {
    const d = new Date(l.date);
    return d.getMonth() === cm && d.getFullYear() === cy;
  });
  const spent  = ml.reduce((s,l) => s + l.nominal, 0);
  const liters = ml.reduce((s,l) => s + l.liters,  0);
  const avgFill = ml.length ? spent / ml.length : 0;

  let eff = null;
  const odo = [...logs].filter(l => l.odometer != null)
    .sort((a,b) => new Date(b.date) - new Date(a.date));
  if (odo.length >= 2) {
    const d = odo[0].odometer - odo[1].odometer;
    if (d > 0 && odo[1].liters > 0) eff = d / odo[1].liters;
  }

  const effColor = eff == null ? 'blue' : eff >= 35 ? 'blue' : 'amber';
  const effSub   = eff == null
    ? 'Perlu 2+ log dengan odometer'
    : eff >= 45 ? 'Sangat irit'
    : eff >= 35 ? 'Normal'
    : 'Konsumsi tinggi';

  return (
    <div className={className} style={{ display: 'contents' }}>
      <StatCard iconKey="wallet" label="Pengeluaran Bulan Ini"
        value={formatRupiah(spent)}
        sub={`${ml.length} pengisian${ml.length && avgFill ? ` · ~${formatRupiah(Math.round(avgFill))}/isi` : ''}`}
        color="red" />
      <StatCard iconKey="drop" label="Total Liter Bulan Ini"
        value={`${liters.toFixed(2)} L`}
        sub={ml.length ? `dari ${ml.length} pengisian` : 'Belum ada data'}
        color="blue" />
      <StatCard iconKey="speed" label="Efisiensi BBM"
        value={eff != null ? `${eff.toFixed(1)} km/L` : '—'}
        sub={effSub}
        color={effColor} />
    </div>
  );
}

export default StatCard;

import { getBarsForLevel, MAX_TANK } from '../utils';

/** FuelGauge — 6-bar digital meter */
export default function FuelGauge({ liters, previewLiters }) {
  const { bars, color, critical } = getBarsForLevel(liters);

  const hasPreview  = previewLiters != null && previewLiters > liters;
  const previewBars = hasPreview ? getBarsForLevel(previewLiters).bars : 0;
  const pct = Math.min(100, (liters / MAX_TANK) * 100);
  const prevPct = hasPreview ? Math.min(100, (previewLiters / MAX_TANK) * 100) : 0;

  const barColor = color === 'red' ? 'var(--red)' : color === 'amber' ? 'var(--amber)' : 'var(--blue)';
  const barGlow  = color === 'red'
    ? '0 0 12px rgba(210,27,27,.5)'
    : color === 'amber'
    ? '0 0 12px rgba(197,126,10,.4)'
    : '0 0 12px rgba(26,84,160,.4)';

  const statusLabel = { green: 'Normal', amber: 'Rendah', red: 'Kritis' }[color];
  const statusClass = { green: 'badge-blue', amber: 'badge-amber', red: 'badge-red' }[color];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Bars row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        {[1,2,3,4,5,6].map((bar) => {
          const active   = bar <= bars;
          const preview  = !active && hasPreview && bar <= previewBars;
          const inactive = !active && !preview;
          return (
            <div key={bar} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                className={active && critical ? 'pulse-red' : ''}
                style={{
                  width: '100%',
                  height: 18 + bar * 10,
                  borderRadius: 6,
                  background: active   ? barColor
                             : preview  ? 'var(--cyan)'
                             : 'var(--border)',
                  boxShadow: active  ? barGlow
                           : preview ? '0 0 10px rgba(2,132,199,.4)'
                           : 'none',
                  opacity: preview ? 0.7 : 1,
                  transition: 'background .3s, box-shadow .3s',
                }}
              />
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? barColor : 'var(--ink-3)' }}>
                {bar}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div style={{ position: 'relative', height: 6, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`,
          background: color === 'red'
            ? 'linear-gradient(90deg,#b01616,var(--red))'
            : color === 'amber'
            ? 'linear-gradient(90deg,#a36308,var(--amber))'
            : 'linear-gradient(90deg,var(--blue-dark),var(--blue))',
          borderRadius: 100,
          transition: 'width .5s cubic-bezier(.4,0,.2,1)',
        }} />
        {hasPreview && (
          <div style={{
            position: 'absolute', top: 0, height: '100%',
            left: `${pct}%`, width: `${prevPct - pct}%`,
            background: 'var(--cyan)',
            opacity: .55,
            borderRadius: 100,
            transition: 'width .3s',
          }} />
        )}
      </div>

      {/* E–F tick labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -12 }}>
        {['E','¼','½','¾','F'].map(t => (
          <span key={t} style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)' }}>{t}</span>
        ))}
      </div>

      {/* Readout row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: "'JetBrains Mono','Menlo','Courier New',monospace",
            fontSize: 34, fontWeight: 700, color: barColor,
            lineHeight: 1, letterSpacing: '-0.03em',
          }}>
            {liters.toFixed(2)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-3)' }}>L</span>
          {hasPreview && (
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', marginLeft: 4 }}>
              → {previewLiters.toFixed(2)} L
            </span>
          )}
        </div>
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
      </div>
    </div>
  );
}

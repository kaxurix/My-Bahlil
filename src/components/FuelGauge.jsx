import { getBarsForLevel, buildBarMeta } from '../utils';

export default function FuelGauge({ liters, previewLiters, tankCapacity = 5.5 }) {
  const { bars, color, critical } = getBarsForLevel(liters, tankCapacity);
  const barMeta = buildBarMeta(tankCapacity);

  const hasPreview  = previewLiters != null && previewLiters > liters;
  const previewBars = hasPreview ? getBarsForLevel(previewLiters, tankCapacity).bars : 0;

  const pct     = Math.min(100, (liters / tankCapacity) * 100);
  const prevPct = hasPreview ? Math.min(100, (previewLiters / tankCapacity) * 100) : 0;

  // Colors per state
  const barColor = color === 'red' ? 'var(--red)' : color === 'amber' ? 'var(--amber)' : 'var(--blue)';
  const barGlow  = color === 'red'
    ? '0 0 10px rgba(210,27,27,.5)'
    : color === 'amber'
    ? '0 0 10px rgba(197,126,10,.4)'
    : '0 0 10px rgba(26,84,160,.4)';

  const trackGradient = color === 'red'
    ? 'linear-gradient(90deg,#b01616,var(--red))'
    : color === 'amber'
    ? 'linear-gradient(90deg,#a36308,var(--amber))'
    : 'linear-gradient(90deg,var(--blue-dark),var(--blue))';

  const statusLabel = { green: 'Normal', amber: 'Rendah', red: 'Kritis!' }[color];
  const statusClass = { green: 'badge-blue', amber: 'badge-amber', red: 'badge-red' }[color];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── 6 bars ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        {barMeta.map(({ bar, label }) => {
          const active  = bar <= bars;
          const preview = !active && hasPreview && bar <= previewBars;

          const activeColor = active && bar === 1
            ? (critical ? 'var(--red)' : 'var(--amber)')
            : active
            ? barColor
            : 'none';

          const activeGlow = active && bar === 1
            ? (critical
              ? '0 0 10px rgba(210,27,27,.5)'
              : '0 0 8px rgba(197,126,10,.35)')
            : active ? barGlow : 'none';

          return (
            <div key={bar} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            }}>
              {/* Bar segment */}
              <div
                className={active && bar === 1 && critical ? 'pulse-red' : ''}
                style={{
                  width: '100%',
                  height: 16 + bar * 10,
                  borderRadius: 5,
                  background: active
                    ? activeColor
                    : preview
                    ? 'var(--cyan)'
                    : 'var(--border)',
                  boxShadow: active
                    ? activeGlow
                    : preview ? '0 0 8px rgba(2,132,199,.35)' : 'none',
                  opacity: preview ? 0.7 : 1,
                  transition: 'background .3s, box-shadow .3s',
                }}
              />

              {/* Bar number */}
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: active ? activeColor : 'var(--border-2)',
                lineHeight: 1,
              }}>
                {bar}
              </span>

              {/* Liter range label */}
              <span style={{
                fontSize: 9.5, fontWeight: 500,
                color: active ? activeColor : 'var(--ink-3)',
                opacity: active ? 0.8 : 0.55,
                lineHeight: 1, textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Progress track ── */}
      <div style={{
        position: 'relative', height: 5,
        background: 'var(--border)', borderRadius: 100, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`,
          background: trackGradient,
          borderRadius: 100,
          transition: 'width .5s cubic-bezier(.4,0,.2,1)',
        }} />
        {hasPreview && (
          <div style={{
            position: 'absolute', top: 0, height: '100%',
            left: `${pct}%`, width: `${prevPct - pct}%`,
            background: 'var(--cyan)', opacity: .55,
            borderRadius: 100, transition: 'width .3s',
          }} />
        )}
      </div>

      {/* ── E — F labels ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -8 }}>
        {['E', '¼', '½', '¾', 'F'].map(t => (
          <span key={t} style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--ink-3)' }}>{t}</span>
        ))}
      </div>

      {/* ── Numeric readout ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{
            fontSize: 32, fontWeight: 700,
            color: barColor, lineHeight: 1,
          }}>
            {liters.toFixed(2)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-3)' }}>
            / {tankCapacity} L
          </span>
          {hasPreview && (
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', marginLeft: 6 }}>
              → {previewLiters.toFixed(2)} L
            </span>
          )}
        </div>
        <span className={`badge ${statusClass}`}>{statusLabel}</span>
      </div>

    </div>
  );
}

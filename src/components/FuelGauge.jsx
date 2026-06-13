import { getBarsForLevel, MAX_TANK } from '../utils';

/**
 * Liter threshold per bar — "jika bar ini menyala, berarti bensin di atas X liter"
 * Bar 1 aktif (amber)  = 1.0–1.6 L
 * Bar 1 aktif (red)    = <1.0 L (kritis)
 * Bar 2 aktif          = 1.6–2.4 L
 * Bar 3 aktif          = 2.4–3.2 L
 * Bar 4 aktif          = 3.2–4.0 L
 * Bar 5 aktif          = 4.0–4.8 L
 * Bar 6 aktif          = 4.8–5.5 L
 */
const BAR_META = [
  { bar: 1, min: 0,   max: 1.6,  label: '<1.6 L' },
  { bar: 2, min: 1.6, max: 2.4,  label: '~2.4 L' },
  { bar: 3, min: 2.4, max: 3.2,  label: '~3.2 L' },
  { bar: 4, min: 3.2, max: 4.0,  label: '~4.0 L' },
  { bar: 5, min: 4.0, max: 4.8,  label: '~4.8 L' },
  { bar: 6, min: 4.8, max: 5.5,  label: '~5.5 L' },
];

export default function FuelGauge({ liters, previewLiters }) {
  const { bars, color, critical } = getBarsForLevel(liters);

  const hasPreview  = previewLiters != null && previewLiters > liters;
  const previewBars = hasPreview ? getBarsForLevel(previewLiters).bars : 0;

  const pct     = Math.min(100, (liters / MAX_TANK) * 100);
  const prevPct = hasPreview ? Math.min(100, (previewLiters / MAX_TANK) * 100) : 0;

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
        {BAR_META.map(({ bar, label }) => {
          const active  = bar <= bars;
          const preview = !active && hasPreview && bar <= previewBars;

          // Active color: bar 1 special (amber = rendah, red = kritis)
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
                  height: 16 + bar * 10,    /* stepped height: 26, 36, 46, 56, 66, 76 */
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

              {/* Liter range label — key addition */}
              <span style={{
                fontSize: 9.5,
                fontWeight: 500,
                color: active ? activeColor : 'var(--ink-3)',
                opacity: active ? 0.8 : 0.55,
                lineHeight: 1,
                textAlign: 'center',
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
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-3)' }}>L</span>
          {hasPreview && (
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', marginLeft: 6 }}>
              → {previewLiters.toFixed(2)} L
            </span>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
            ~{Math.round(liters * 50).toLocaleString('id-ID')} km
          </p>
          <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>estimasi jarak</p>
        </div>
      </div>


    </div>
  );
}

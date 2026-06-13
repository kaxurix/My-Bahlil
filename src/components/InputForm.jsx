import { useState, useEffect } from 'react';
import { MAX_TANK, formatRupiah } from '../utils';

const Chevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const FieldLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} style={{
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--ink-2)', marginBottom: 7,
  }}>
    {children}
  </label>
);

export default function InputForm({ currentFuel, prices, onSubmit, onPricesChange, onPreviewChange }) {
  const [fuelLevel,    setFuelLevel]    = useState(currentFuel);
  const [fuelType,     setFuelType]     = useState('pertalite');
  const [nominal,      setNominal]      = useState('');
  const [odometer,     setOdometer]     = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { setFuelLevel(currentFuel); }, [currentFuel]);

  const ppl           = prices[fuelType];
  const bought        = nominal ? parseFloat(nominal) / ppl : 0;
  const projected     = fuelLevel + bought;
  const isLuber       = projected > MAX_TANK;
  const maxNominal    = Math.floor((MAX_TANK - fuelLevel) * ppl);
  const canSubmit     = !!(nominal && !isLuber && bought > 0);
  const sliderPct     = (fuelLevel / MAX_TANK) * 100;
  const hasNominal    = nominal && !isLuber && bought > 0;

  useEffect(() => {
    if (!onPreviewChange) return;
    onPreviewChange(hasNominal ? Math.min(MAX_TANK, projected) : null);
  }, [nominal, projected, isLuber, bought, onPreviewChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ fuelLevel, fuelType, nominal: parseFloat(nominal), liters: bought, odometer: odometer ? parseFloat(odometer) : null });
    setNominal(''); setOdometer('');
    if (onPreviewChange) onPreviewChange(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Level bensin ── */}
      <div className="card" style={{ padding: '20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <FieldLabel>Level Bensin Saat Ini</FieldLabel>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>
            {fuelLevel.toFixed(2)} L
          </span>
        </div>

        <input
          id="fuel-level-slider"
          type="range" min="0" max={MAX_TANK} step="0.1"
          value={fuelLevel}
          onChange={e => setFuelLevel(parseFloat(e.target.value))}
          style={{ '--pct': `${sliderPct}%` }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>0 L (Kosong)</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{MAX_TANK} L (Penuh)</span>
        </div>

        <button type="button" id="btn-kritis" onClick={() => setFuelLevel(0.8)}
          className="btn btn-danger-ghost" style={{ width: '100%', marginTop: 14, fontSize: 13 }}>
          Indikator Berkedip
        </button>
      </div>

      {/* ── Jenis BBM ── */}
      <div className="card" style={{ padding: '20px 20px' }}>
        <FieldLabel>Jenis BBM</FieldLabel>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {['pertalite', 'pertamax'].map(type => {
            const sel = fuelType === type;
            const isP = type === 'pertalite';
            return (
              <button key={type} type="button" id={`fuel-type-${type}`}
                onClick={() => setFuelType(type)}
                style={{
                  padding: '12px 10px', borderRadius: 10,
                  border: sel
                    ? `2px solid ${isP ? 'var(--blue)' : 'var(--red)'}`
                    : '2px solid var(--border)',
                  background: sel ? (isP ? 'var(--blue-faint)' : 'var(--red-faint)') : 'var(--surf-2)',
                  color: sel ? (isP ? 'var(--blue)' : 'var(--red)') : 'var(--ink-3)',
                  cursor: 'pointer', transition: 'all .15s',
                  fontFamily: 'inherit', textAlign: 'center',
                }}>
              <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', display: 'block' }}>{type}</span>
                </div>
                <p style={{ fontSize: 11.5, marginTop: 4, fontWeight: 500, opacity: .8 }}>
                  {formatRupiah(prices[type])}/L
                </p>
              </button>
            );
          })}
        </div>

        {/* Settings toggle */}
        <button type="button" id="btn-settings-toggle"
          onClick={() => setShowSettings(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '8px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-3)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            borderTop: '1px solid var(--border)',
          }}>
          <span>Atur Harga per Liter</span>
          <Chevron open={showSettings} />
        </button>

        {showSettings && (
          <div className="slide-down" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 12,
          }}>
            {['pertalite', 'pertamax'].map(type => (
              <div key={type}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'capitalize', display: 'block', marginBottom: 5 }}>
                  {type}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>Rp</span>
                  <input id={`price-${type}`} type="number" value={prices[type]}
                    onChange={e => onPricesChange(type, parseInt(e.target.value) || 0)}
                    className="field" style={{ paddingLeft: 30, fontSize: 13 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Nominal & Odometer ── */}
      <div className="card" style={{ padding: '20px 20px' }}>
        {/* Nominal */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel htmlFor="nominal-input">Nominal Pembelian (IDR)</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, fontWeight: 700, color: 'var(--ink-3)',
            }}>Rp</span>
            <input id="nominal-input" type="number" min="0" step="1000"
              placeholder="50000" value={nominal}
              onChange={e => setNominal(e.target.value)}
              className={`field ${isLuber ? 'error' : hasNominal ? 'valid' : ''}`}
              style={{ paddingLeft: 38, fontWeight: 700, fontSize: 16 }} />
          </div>

          {/* Preview hint */}
          {hasNominal && (
            <div className="fade-in" style={{
              display: 'flex', alignItems: 'center', gap: 7, marginTop: 10,
              padding: '9px 12px', borderRadius: 8,
              background: 'var(--cyan-bg)', border: '1px solid #bae6fd',
            }}>
              <InfoIcon />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cyan)' }}>
                +{bought.toFixed(2)} L — total menjadi {projected.toFixed(2)} L
              </span>
            </div>
          )}

          {/* Anti-luber warning */}
          {isLuber && (
            <div className="slide-down" style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10,
              padding: '10px 13px', borderRadius: 8,
              background: 'var(--red-faint)', border: '1px solid var(--red-tint)',
              color: 'var(--red)',
            }}>
              <AlertIcon />
              <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
                Awas luber! Maksimal yang bisa diisi:{' '}
                <strong>{formatRupiah(maxNominal)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Odometer */}
        <div>
          <FieldLabel htmlFor="odometer-input">
            Odometer <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>(opsional — untuk hitung efisiensi)</span>
          </FieldLabel>
          <div style={{ position: 'relative' }}>
            <input id="odometer-input" type="number" min="0" step="1"
              placeholder="12500" value={odometer}
              onChange={e => setOdometer(e.target.value)}
              className="field"
              style={{ paddingRight: 38, fontWeight: 700, fontSize: 16 }} />
            <span style={{
              position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
              fontSize: 12, fontWeight: 600, color: 'var(--ink-3)',
            }}>km</span>
          </div>
        </div>

        <button id="btn-submit-fuel" type="submit" disabled={!canSubmit}
          className="btn btn-primary" style={{ marginTop: 18 }}>
          Catat Pengisian
        </button>
      </div>
    </form>
  );
}

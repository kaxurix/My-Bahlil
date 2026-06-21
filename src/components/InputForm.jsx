import { useState, useEffect } from 'react';
import { formatRupiah } from '../utils';

/* ─── Icons ─── */
const Chevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>
    <polyline points="6 9 12 15 18 9"/>
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

export default function InputForm({
  tankCapacity = 5.5,
  prices,
  onSubmit,
  onPricesChange,
}) {
  const [fuelType,     setFuelType]     = useState('pertalite');
  const [nominal,      setNominal]      = useState('');
  const [odometer,     setOdometer]     = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const ppl        = prices[fuelType];
  const liters     = nominal && parseFloat(nominal) > 0 ? parseFloat(nominal) / ppl : 0;
  const hasNominal = nominal && parseFloat(nominal) > 0;

  // Anti-luber: warn if nominal buys more than a full tank
  const isOverTank = liters > tankCapacity;

  const canSubmit = hasNominal && !isOverTank;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      fuelType,
      nominal:  parseFloat(nominal),
      liters,
      odometer: odometer ? parseFloat(odometer) : null,
    });
    setNominal(''); setOdometer('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

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
                <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', display: 'block' }}>{type}</span>
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

      {/* ── Nominal & Liter Calculator ── */}
      <div className="card" style={{ padding: '20px 20px' }}>

        {/* Nominal input */}
        <div style={{ marginBottom: 14 }}>
          <FieldLabel htmlFor="nominal-input">Nominal Pembelian (IDR)</FieldLabel>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, fontWeight: 700, color: 'var(--ink-3)',
            }}>Rp</span>
            <input id="nominal-input" type="number" min="0" step="1000"
              placeholder="50000" value={nominal}
              onChange={e => setNominal(e.target.value)}
              className={`field ${isOverTank ? 'error' : hasNominal ? 'valid' : ''}`}
              style={{ paddingLeft: 38, fontWeight: 700, fontSize: 16 }} />
          </div>
        </div>

        {/* Live liter calculation — always shown when typing */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 10,
          background: hasNominal && !isOverTank
            ? (fuelType === 'pertalite' ? 'var(--blue-faint)' : 'var(--red-faint)')
            : 'var(--surf-2)',
          border: hasNominal && !isOverTank
            ? `1.5px solid ${fuelType === 'pertalite' ? 'var(--blue)' : 'var(--red)'}33`
            : '1.5px solid var(--border)',
          transition: 'all .2s',
          marginBottom: 14,
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 3 }}>
              Setara dengan
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{
                fontSize: 28, fontWeight: 800, lineHeight: 1,
                color: hasNominal && !isOverTank
                  ? (fuelType === 'pertalite' ? 'var(--blue)' : 'var(--red)')
                  : 'var(--border-2)',
              }}>
                {liters > 0 ? liters.toFixed(2) : '—'}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)' }}>liter</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>
              {formatRupiah(ppl)}/L
            </p>
            <p style={{
              fontSize: 12, fontWeight: 700, marginTop: 2,
              color: hasNominal && !isOverTank
                ? (fuelType === 'pertalite' ? 'var(--blue)' : 'var(--red)')
                : 'var(--ink-3)',
              textTransform: 'capitalize',
            }}>
              {fuelType}
            </p>
          </div>
        </div>

        {/* Over tank warning */}
        {isOverTank && (
          <div className="slide-down" style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            padding: '10px 13px', borderRadius: 8,
            background: 'var(--red-faint)', border: '1px solid var(--red-tint)',
            color: 'var(--red)',
          }}>
            <InfoIcon />
            <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
              Melebihi kapasitas tangki ({tankCapacity} L). Cek kembali nominalnya.
            </span>
          </div>
        )}

        {/* Odometer */}
        <div style={{ marginBottom: 18 }}>
          <FieldLabel htmlFor="odometer-input">
            Odometer{' '}
            <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>(opsional — untuk hitung efisiensi)</span>
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
          className="btn btn-primary" style={{ marginTop: 0 }}>
          Catat Pengisian
        </button>
      </div>
    </form>
  );
}

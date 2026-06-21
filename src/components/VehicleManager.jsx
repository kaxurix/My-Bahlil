import { useState } from 'react';
import { genId, formatDate } from '../utils';

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4 2 1v4a2 2 0 0 1-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Field Label ──────────────────────────────────────────────────────────── */
const FieldLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} style={{
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--ink-2)', marginBottom: 6,
  }}>
    {children}
  </label>
);

/* ─── Add Vehicle Form ─────────────────────────────────────────────────────── */
function AddVehicleForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');

  const canAdd = name.trim() && parseFloat(capacity) > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canAdd) return;
    onAdd({
      id: genId(),
      name: name.trim(),
      tankCapacity: parseFloat(capacity),
      initialOdometer: odometer ? parseFloat(odometer) : null,
      createdAt: new Date().toISOString(),
    });
    setName(''); setCapacity(''); setOdometer('');
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--blue-faint)',
      border: '1.5px solid var(--blue)',
      borderRadius: 12, padding: '18px 18px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: -2 }}>
        Tambah Kendaraan Baru
      </p>

      {/* Name */}
      <div>
        <FieldLabel htmlFor="veh-name">Nama Kendaraan</FieldLabel>
        <input id="veh-name" type="text" value={name}
          onChange={e => setName(e.target.value)}
          placeholder="contoh: Vario / Avanza"
          className="field" style={{ fontSize: 14 }}
          autoFocus
        />
      </div>

      {/* Tank capacity */}
      <div>
        <FieldLabel htmlFor="veh-capacity">Kapasitas Tangki (Liter)</FieldLabel>
        <div style={{ position: 'relative' }}>
          <input id="veh-capacity" type="number" min="1" max="200" step="0.5"
            value={capacity} onChange={e => setCapacity(e.target.value)}
            placeholder="contoh: 5.5 (motor) atau 40 (mobil)"
            className="field" style={{ paddingRight: 40, fontSize: 14 }}
          />
          <span style={{
            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
            fontSize: 12, fontWeight: 600, color: 'var(--ink-3)',
          }}>L</span>
        </div>
      </div>

      {/* Odometer */}
      <div>
        <FieldLabel htmlFor="veh-odo">
          Odometer Saat Ini{' '}
          <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 11 }}>(opsional)</span>
        </FieldLabel>
        <div style={{ position: 'relative' }}>
          <input id="veh-odo" type="number" min="0" step="1"
            value={odometer} onChange={e => setOdometer(e.target.value)}
            placeholder="contoh: 12500"
            className="field" style={{ paddingRight: 40, fontSize: 14 }}
          />
          <span style={{
            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
            fontSize: 12, fontWeight: 600, color: 'var(--ink-3)',
          }}>km</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={!canAdd}
          className="btn btn-primary" style={{ flex: 1, fontSize: 13 }}>
          <PlusIcon /> Tambah
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="btn btn-ghost" style={{ fontSize: 13 }}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}

/* ─── Main VehicleManager ──────────────────────────────────────────────────── */
/**
 * @param {{
 *   vehicles: import('../utils').Vehicle[],
 *   activeVehicleId: string,
 *   logs: object[],
 *   onSelect: (id: string) => void,
 *   onAdd: (vehicle: object) => void,
 *   onDelete: (id: string) => void,
 *   onClose: () => void,
 * }} props
 */
export default function VehicleManager({
  vehicles, activeVehicleId, logs, onSelect, onAdd, onDelete, onClose,
}) {
  const [showForm, setShowForm] = useState(vehicles.length === 0);

  const handleAdd = (vehicle) => {
    onAdd(vehicle);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    const v = vehicles.find(v => v.id === id);
    const count = logs.filter(l => l.vehicleId === id).length;
    const msg = count > 0
      ? `Hapus "${v?.name}"? Semua ${count} catatan pengisian untuk kendaraan ini juga akan dihapus.`
      : `Hapus kendaraan "${v?.name}"?`;
    if (!window.confirm(msg)) return;
    onDelete(id);
  };

  const getLastOdo = (id) => {
    const vLogs = logs.filter(l => l.vehicleId === id && l.odometer != null)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return vLogs[0]?.odometer ?? null;
  };

  const getLogCount = (id) => logs.filter(l => l.vehicleId === id).length;

  return (
    /* Backdrop */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: 'var(--white)',
        borderRadius: 16, padding: '24px',
        width: '100%', maxWidth: 480,
        maxHeight: '88dvh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>Kelola Kendaraan</h2>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {vehicles.length} kendaraan terdaftar
            </p>
          </div>
          <button type="button" onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 8,
            border: 'none', background: 'var(--surf-2)',
            color: 'var(--ink-3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CloseIcon />
          </button>
        </div>

        {/* Vehicle list */}
        {vehicles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vehicles.map(v => {
              const active = v.id === activeVehicleId;
              const lastOdo = getLastOdo(v.id);
              const logCount = getLogCount(v.id);
              return (
                <div key={v.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 12,
                  border: active ? '2px solid var(--blue)' : '1.5px solid var(--border)',
                  background: active ? 'var(--blue-faint)' : 'var(--surf-2)',
                  transition: 'all .15s',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: active ? 'var(--blue)' : 'var(--border)',
                    color: active ? '#fff' : 'var(--ink-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CarIcon />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: 'var(--ink)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {v.name}
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                      Tangki {v.tankCapacity} L
                      {lastOdo != null && ` · Odo ${lastOdo.toLocaleString('id-ID')} km`}
                      {logCount > 0 && ` · ${logCount} pengisian`}
                    </p>
                  </div>

                  {/* Select / Delete */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!active && (
                      <button type="button" onClick={() => { onSelect(v.id); onClose(); }}
                        className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}>
                        Pilih
                      </button>
                    )}
                    {active && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: 'var(--blue)',
                        padding: '5px 10px', borderRadius: 8,
                        background: 'rgba(26,84,160,.1)',
                      }}>
                        <CheckIcon /> Aktif
                      </span>
                    )}
                    <button type="button" onClick={() => handleDelete(v.id)}
                      disabled={vehicles.length === 1}
                      title={vehicles.length === 1 ? 'Minimal 1 kendaraan' : 'Hapus'}
                      style={{
                        width: 30, height: 30, borderRadius: 7,
                        border: 'none', background: 'none',
                        color: 'var(--border-2)', cursor: vehicles.length === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: vehicles.length === 1 ? .35 : 1,
                        transition: 'all .15s',
                      }}
                      onMouseEnter={e => { if (vehicles.length > 1) { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-faint)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--border-2)'; e.currentTarget.style.background = ''; }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add form or Add button */}
        {showForm ? (
          <AddVehicleForm
            onAdd={handleAdd}
            onCancel={vehicles.length > 0 ? () => setShowForm(false) : null}
          />
        ) : (
          <button type="button" onClick={() => setShowForm(true)}
            className="btn btn-ghost" style={{ fontSize: 13, justifyContent: 'center' }}>
            <PlusIcon /> Tambah Kendaraan
          </button>
        )}

        {/* Empty hint */}
        {vehicles.length === 0 && !showForm && (
          <p style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginTop: -8 }}>
            Tambahkan kendaraan pertama kamu untuk mulai mencatat.
          </p>
        )}
      </div>
    </div>
  );
}

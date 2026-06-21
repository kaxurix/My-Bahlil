import { useState, useEffect, useCallback, useMemo } from 'react';
import InputForm      from './components/InputForm';
import { AnalyticsDashboard } from './components/StatCard';
import HistoryList    from './components/HistoryList';
import VehicleManager from './components/VehicleManager';
import {
  loadLogs, saveLogs, genId, DEFAULT_PRICES,
  loadVehicles, saveVehicles,
} from './utils';

/* ─── Inline responsive styles ─── */
const RESPONSIVE_CSS = `
  .main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 1024px) {
    .main-grid {
      grid-template-columns: 380px 1fr;
      gap: 24px;
      align-items: start;
    }
  }

  @media (max-width: 640px) {
    .page-header { height: 52px; }
    .header-logo { height: 26px; }
    .page-pad { padding: 14px 16px; }
  }
  @media (min-width: 641px) {
    .page-header { height: 64px; }
    .header-logo { height: 36px; }
    .page-pad { padding: 24px 32px; }
  }
  @media (min-width: 1280px) {
    .page-pad { padding: 28px 40px; }
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .veh-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 5px 10px; border-radius: 100px;
    border: 1.5px solid var(--border);
    background: var(--surf-2);
    color: var(--ink); font-family: inherit;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all .15s;
    max-width: 180px;
  }
  @media (max-width: 400px) {
    .veh-btn { max-width: 130px; font-size: 12px; padding: 5px 9px; }
  }
  .veh-btn:hover {
    border-color: var(--blue);
    background: var(--blue-faint);
    color: var(--blue);
  }
  .veh-btn-name {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
`;

/* ─── Icons ─── */
const CarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h11l4 4 2 1v4a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ─── App ─────────────────────────────────────────────────────────────────── */
function App() {
  // ── Vehicles ──
  const [vehicles, setVehicles] = useState(() => {
    const stored = loadVehicles();
    return stored.length > 0 ? stored : [];
  });

  const [activeVehicleId, setActiveVehicleId] = useState(() => {
    const stored = loadVehicles();
    return stored.length > 0 ? stored[0].id : null;
  });

  const [showVehicleManager, setShowVehicleManager] = useState(() => {
    return loadVehicles().length === 0;
  });

  // ── Logs ──
  const [logs, setLogs] = useState(() => loadLogs());

  // ── UI state ──
  const [prices, setPrices] = useState(DEFAULT_PRICES);

  // Save side-effects
  useEffect(() => { saveLogs(logs);         }, [logs]);
  useEffect(() => { saveVehicles(vehicles);  }, [vehicles]);

  // Active vehicle object
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) ?? null;
  const tankCapacity  = activeVehicle?.tankCapacity ?? 5.5;

  // Logs for active vehicle (with backward-compat for old logs without vehicleId)
  const vehicleLogs = useMemo(() =>
    activeVehicleId
      ? logs.filter(l => l.vehicleId === activeVehicleId || (!l.vehicleId && activeVehicleId === vehicles[0]?.id))
      : logs,
  [logs, activeVehicleId, vehicles]);

  // ── Handlers ──
  const handleSubmit = useCallback(({ fuelType, nominal, liters, odometer }) => {
    if (!activeVehicleId) return;
    setLogs(prev => [{
      id: genId(), date: new Date().toISOString(),
      vehicleId: activeVehicleId,
      fuelType, nominal, liters, odometer,
    }, ...prev]);
  }, [activeVehicleId]);

  const handleDelete = useCallback((id) => {
    if (!window.confirm('Hapus catatan ini?')) return;
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  const handleImport = useCallback((imported) => {
    if (!window.confirm(`Import ${imported.length} log? Data lama akan digabung.`)) return;
    setLogs(prev => {
      const ids = new Set(prev.map(l => l.id));
      return [...imported.filter(l => !ids.has(l.id)), ...prev]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  }, []);

  const handlePriceChange = useCallback((type, val) => {
    setPrices(prev => ({ ...prev, [type]: val }));
  }, []);

  const handleAddVehicle = useCallback((vehicle) => {
    setVehicles(prev => [...prev, vehicle]);
    setActiveVehicleId(vehicle.id);
  }, []);

  const handleDeleteVehicle = useCallback((id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    setLogs(prev => prev.filter(l => l.vehicleId !== id));
    setActiveVehicleId(prev => {
      if (prev !== id) return prev;
      const remaining = vehicles.filter(v => v.id !== id);
      return remaining[0]?.id ?? null;
    });
  }, [vehicles]);

  const handleSelectVehicle = useCallback((id) => {
    setActiveVehicleId(id);
  }, []);

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>

      {/* VehicleManager modal */}
      {showVehicleManager && (
        <VehicleManager
          vehicles={vehicles}
          activeVehicleId={activeVehicleId}
          logs={logs}
          onSelect={handleSelectVehicle}
          onAdd={handleAddVehicle}
          onDelete={handleDeleteVehicle}
          onClose={() => {
            if (vehicles.length > 0) setShowVehicleManager(false);
          }}
        />
      )}

      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

        {/* ── Header ── */}
        <header className="page-header" style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 0 var(--border)',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            maxWidth: 1280, width: '100%', margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 0, paddingBottom: 0,
          }} className="page-pad">

            <img src="/logo.png" alt="MyBahlil" className="header-logo" />

            {/* Vehicle switcher */}
            <button
              id="btn-vehicle-switcher"
              type="button"
              className="veh-btn"
              onClick={() => setShowVehicleManager(true)}
            >
              <CarIcon />
              <span className="veh-btn-name">
                {activeVehicle ? activeVehicle.name : 'Pilih Kendaraan'}
              </span>
              <ChevronDown />
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto' }}
          className="page-pad">

          {/* No vehicle state */}
          {vehicles.length === 0 && (
            <div className="card" style={{ padding: '52px 20px', textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Belum ada kendaraan terdaftar</p>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 5, marginBottom: 18 }}>
                Tambahkan kendaraan untuk mulai mencatat pengisian BBM
              </p>
              <button type="button" onClick={() => setShowVehicleManager(true)}
                className="btn btn-primary" style={{ margin: '0 auto' }}>
                Tambah Kendaraan
              </button>
            </div>
          )}

          {vehicles.length > 0 && (
            <>
              {/* Analytics */}
              <section style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
                }}>
                  <h2 className="section-label">Ringkasan Bulan Ini</h2>
                  <span className="badge badge-blue">
                    {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <AnalyticsDashboard
                  logs={logs}
                  vehicleId={activeVehicleId}
                  tankCapacity={tankCapacity}
                />
              </section>

              {/* Main content grid */}
              <div className="main-grid">

                {/* LEFT: Form */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <InputForm
                    tankCapacity={tankCapacity}
                    prices={prices}
                    onSubmit={handleSubmit}
                    onPricesChange={handlePriceChange}
                  />
                </aside>

                {/* RIGHT: History */}
                <div className="right-col">
                  <HistoryList
                    logs={vehicleLogs}
                    onDelete={handleDelete}
                    onImport={handleImport}
                  />
                </div>
              </div>
            </>
          )}
        </main>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--white)',
          marginTop: 40,
        }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
            paddingTop: 14, paddingBottom: 14,
          }} className="page-pad">
            <img src="/logo.png" alt="MyBahlil" style={{ height: 20, opacity: .5 }} />
            <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              Made by Kautsar Rifqi Aditya · 2026
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;

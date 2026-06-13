import { useState, useEffect, useCallback } from 'react';
import FuelGauge from './components/FuelGauge';
import InputForm from './components/InputForm';
import { AnalyticsDashboard } from './components/StatCard';
import HistoryList from './components/HistoryList';
import { loadLogs, saveLogs, genId, DEFAULT_PRICES, MAX_TANK } from './utils';

/* ─── Inline responsive styles injected once ─── */
const RESPONSIVE_CSS = `
  /* Mobile-first: analytics scroll on small screens */
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  @media (max-width: 640px) {
    .analytics-grid {
      /* Horizontal scroll on mobile */
      display: flex;
      overflow-x: auto;
      gap: 10px;
      padding-bottom: 6px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .analytics-grid::-webkit-scrollbar { display: none; }
    .analytics-grid > * {
      min-width: 170px;
      flex-shrink: 0;
    }
  }

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

  /* Mobile: gauge card compact */
  @media (max-width: 640px) {
    .page-header { height: 56px; }
    .header-logo { height: 30px; }
    .page-pad { padding: 16px; }
  }
  @media (min-width: 641px) {
    .page-header { height: 64px; }
    .header-logo { height: 36px; }
    .page-pad { padding: 24px 32px; }
  }
  @media (min-width: 1280px) {
    .page-pad { padding: 28px 40px; }
  }

  /* Right column: history panel */
  .right-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

function App() {
  const [logs, setLogs] = useState(() => loadLogs());
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [previewFuel, setPreviewFuel] = useState(null);
  const [currentFuel, setCurrentFuel] = useState(() => {
    const stored = loadLogs();
    if (stored.length > 0) {
      const last = [...stored].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return Math.min(MAX_TANK, last.fuelAfter ?? 2.5);
    }
    return 2.5;
  });

  useEffect(() => { saveLogs(logs); }, [logs]);

  const handleSubmit = useCallback(({ fuelLevel, fuelType, nominal, liters, odometer }) => {
    const fuelAfter = Math.min(MAX_TANK, fuelLevel + liters);
    setLogs(prev => [{
      id: genId(), date: new Date().toISOString(),
      fuelBefore: fuelLevel, fuelAfter, fuelType, nominal, liters, odometer,
    }, ...prev]);
    setCurrentFuel(fuelAfter);
    setPreviewFuel(null);
  }, []);

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

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>

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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 11px', borderRadius: 100,
                background: 'var(--blue-faint)',

                fontSize: 12, fontWeight: 600, color: 'var(--blue)',
              }}>
                kaxurix
              </span>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto' }}
          className="page-pad">

          {/* Analytics */}
          <section style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
            }}>
              <h2 className="section-label">Ringkasan Bulan Ini</h2>
              <span className="badge badge-blue">
                {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <AnalyticsDashboard logs={logs} className="analytics-grid" />
          </section>

          {/* Main content grid */}
          <div className="main-grid">

            {/* LEFT: Gauge + Form */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Gauge card */}
              <div className="card" style={{ padding: '20px 20px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18,
                }}>
                  <h2 className="section-label">Indikator Bensin</h2>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)' }}>Honda Vario 160</span>
                </div>
                <FuelGauge liters={currentFuel} previewLiters={previewFuel} />
              </div>

              {/* Form */}
              <InputForm
                currentFuel={currentFuel}
                prices={prices}
                onSubmit={handleSubmit}
                onPricesChange={handlePriceChange}
                onPreviewChange={setPreviewFuel}
              />
            </aside>

            {/* RIGHT: History */}
            <div className="right-col">
              <HistoryList
                logs={logs}
                onDelete={handleDelete}
                onImport={handleImport}
              />
            </div>
          </div>
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
            paddingTop: 16, paddingBottom: 16,
          }} className="page-pad">
            <img src="/logo.png" alt="MyBahlil" style={{ height: 22, opacity: .55 }} />
            <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              Made by Kautsar Rifqi Aditya · 2026
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;

import { useRef } from 'react';
import { formatRupiah, formatDate, getMonthKey } from '../utils';

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const FuelIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M3 22h12"/>
    <path d="M15 8h2a2 2 0 0 1 2 2v3a1 1 0 0 0 2 0V8l-2-3"/>
    <rect x="6" y="10" width="6" height="4" rx="1" fill="var(--blue)" stroke="none"/>
  </svg>
);

export default function HistoryList({ logs, onDelete, onImport }) {
  const fileRef = useRef(null);

  const grouped = logs.reduce((acc, log) => {
    const k = getMonthKey(log.date);
    if (!acc[k]) acc[k] = [];
    acc[k].push(log);
    return acc;
  }, {});

  const monthKeys = Object.keys(grouped).sort(
    (a, b) => new Date(grouped[b][0].date) - new Date(grouped[a][0].date)
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `mybahlil_${new Date().toISOString().slice(0,10)}.json` });
    a.click(); URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed)) onImport(parsed);
        else alert('Format file tidak valid.');
      } catch { alert('Gagal membaca file JSON.'); }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Riwayat Pengisian</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{logs.length} catatan tersimpan</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button id="btn-export" type="button" onClick={handleExport}
            disabled={logs.length === 0} className="btn btn-ghost"
            style={{ opacity: logs.length === 0 ? .4 : 1 }}>
            <DownloadIcon /> Ekspor
          </button>
          <button id="btn-import" type="button" onClick={() => fileRef.current?.click()}
            className="btn btn-ghost">
            <UploadIcon /> Impor
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      </div>

      {/* Empty state */}
      {logs.length === 0 && (
        <div className="card" style={{ padding: '52px 20px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'var(--blue-faint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FuelIcon />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Belum ada catatan pengisian</p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 5 }}>Gunakan form di atas untuk mulai mencatat</p>
        </div>
      )}

      {/* Month groups */}
      {monthKeys.map(mk => {
        const ml     = grouped[mk];
        const total  = ml.reduce((s,l) => s + l.nominal, 0);
        const liters = ml.reduce((s,l) => s + l.liters,  0);

        return (
          <div key={mk} className="card" style={{ overflow: 'hidden' }}>
            {/* Month header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px',
              background: 'var(--surf-2)',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{mk}</span>
                <span className="badge badge-blue">{ml.length} isi</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{formatRupiah(total)}</p>
                <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>{liters.toFixed(2)} L</p>
              </div>
            </div>

            {/* Log rows */}
            {[...ml].sort((a,b) => new Date(b.date) - new Date(a.date)).map((log, idx, arr) => (
              <div key={log.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 18px',
                  borderBottom: idx < arr.length-1 ? '1px solid var(--border)' : 'none',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surf-2)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                {/* Type dot + pill */}
                <div style={{ flexShrink: 0 }}>
                  <span
                    className={`badge ${log.fuelType === 'pertalite' ? 'badge-blue' : 'badge-red'}`}
                    style={{ textTransform: 'capitalize' }}>
                    {log.fuelType}
                  </span>
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                      {formatRupiah(log.nominal)}
                    </span>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
                    }}>
                      {log.liters.toFixed(2)} L
                    </span>
                    {log.odometer != null && (
                      <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>
                        · {log.odometer.toLocaleString('id-ID')} km
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>
                    {formatDate(log.date)}
                  </p>
                </div>

                {/* Delete */}
                <button type="button" onClick={() => onDelete(log.id)}
                  style={{
                    flexShrink: 0, width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, border: 'none', background: 'none',
                    color: 'var(--border-2)', cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-faint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--border-2)'; e.currentTarget.style.background = ''; }}
                  title="Hapus">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

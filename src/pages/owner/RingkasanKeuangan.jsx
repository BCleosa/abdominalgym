import { useState, useEffect } from "react";
import { ownerApi } from "../../utils/api";
import { exportToExcel } from "../../utils/exportExcel";

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

function BarChart({ series, mode }) {
  if (!series || series.length === 0) {
    return <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "center", padding: 40 }}>Belum ada data.</p>;
  }
  const W = 900, H = 260, padBottom = 36, padTop = 16, padX = 10;
  const chartH = H - padBottom - padTop;
  const maxVal = Math.max(1, ...series.flatMap(s => [s.pemasukan, s.pengeluaran]));
  const groupW = (W - padX * 2) / series.length;
  const barW = Math.min(18, groupW * 0.35);

  const formatLabel = (key) => {
    if (mode === "bulanan") {
      const [y, m] = key.split("-");
      const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
      return `${bulan[parseInt(m,10)-1]} ${y.slice(2)}`;
    }
    return key.slice(5).split("-").reverse().join("/");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={padX} x2={W - padX} y1={padTop + chartH * (1 - f)} y2={padTop + chartH * (1 - f)} stroke="#f0f0f0" strokeWidth={1} />
      ))}
      {series.map((s, i) => {
        const x = padX + i * groupW + groupW / 2;
        const hIn = (s.pemasukan / maxVal) * chartH;
        const hOut = (s.pengeluaran / maxVal) * chartH;
        const showLabel = series.length <= 14 || i % Math.ceil(series.length / 12) === 0;
        return (
          <g key={s.key || s.tanggal}>
            <rect x={x - barW - 2} y={padTop + chartH - hIn} width={barW} height={hIn} fill="#2e7d32" rx={1} />
            <rect x={x + 2} y={padTop + chartH - hOut} width={barW} height={hOut} fill="#c62828" rx={1} />
            {showLabel && (
              <text x={x} y={H - padBottom + 14} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#999">
                {formatLabel(s.key || s.tanggal)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function toMonthlySeries(series) {
  const map = {};
  series.forEach(s => {
    const key = (s.tanggal || "").slice(0, 7);
    if (!key) return;
    if (!map[key]) map[key] = { key, pemasukan: 0, pengeluaran: 0 };
    map[key].pemasukan += s.pemasukan || 0;
    map[key].pengeluaran += s.pengeluaran || 0;
  });
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
}

export default function RingkasanKeuangan() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [awal, setAwal] = useState(new Date(Date.now() - 89 * 86400000).toISOString().split("T")[0]);
  const [akhir, setAkhir] = useState(new Date().toISOString().split("T")[0]);
  const [chartMode, setChartMode] = useState("harian");

  const fetchSummary = async () => {
    setLoading(true); setError("");
    try {
      const data = await ownerApi.get(`/owner/keuangan-summary?awal=${awal}&akhir=${akhir}`);
      setSummary(data);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchSummary(); }, []);

  const inputStyle = { background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" };
  const selisih = summary ? summary.totalPemasukan - summary.totalPengeluaran : 0;
  const chartSeries = summary ? (chartMode === "bulanan" ? toMonthlySeries(summary.series) : summary.series.map(s => ({ ...s, key: s.tanggal }))) : [];

  const handleExport = () => {
    if (!summary) return;
    const rows = chartSeries.map(s => ({
      [chartMode === "bulanan" ? "Bulan" : "Tanggal"]: s.key,
      "Pemasukan": s.pemasukan,
      "Pengeluaran": s.pengeluaran,
      "Selisih": s.pemasukan - s.pengeluaran,
    }));
    exportToExcel(rows, `Ringkasan_Keuangan_${awal}_${akhir}`, "Keuangan");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <input type="date" value={awal} onChange={e => setAwal(e.target.value)} style={inputStyle} />
        <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>s/d</span>
        <input type="date" value={akhir} onChange={e => setAkhir(e.target.value)} style={inputStyle} />
        <button onClick={fetchSummary} style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 18px", cursor: "pointer" }}>Terapkan</button>
        <button onClick={handleExport} style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>Export Excel</button>
      </div>

      {error && <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", padding: "10px 14px", marginBottom: 16, fontSize: "0.825rem", color: "#c62828" }}>{error}</div>}

      {loading || !summary ? (
        <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Memuat...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total Pemasukan", val: summary.totalPemasukan, color: "#2e7d32" },
              { label: "Total Pengeluaran", val: summary.totalPengeluaran, color: "#c62828" },
              { label: "Selisih (Laba Kotor)", val: selisih, color: selisih >= 0 ? "#1565c0" : "#f57f17" },
              { label: "Cash", val: summary.byMetode?.["Cash"] || 0, color: "#1565c0" },
              { label: "QRIS", val: summary.byMetode?.["QRIS"] || 0, color: "#6a1b9a" },
            ].map(s => (
              <div key={s.label} style={{ flex: "1 1 180px", background: "#fff", border: "1px solid #e0e0e0", borderLeft: `4px solid ${s.color}`, padding: "16px 20px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: s.color }}>{fmt(s.val)}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
       const [awal, setAwal] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);       <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a" }}>Grafik Pendapatan</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {["harian", "bulanan"].map(m => (
                  <button key={m} onClick={() => setChartMode(m)}
                    style={{ background: chartMode === m ? "#1a1a1a" : "#fff", color: chartMode === m ? "#fff" : "#555", border: "1px solid #ddd", fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "5px 12px", cursor: "pointer", textTransform: "capitalize" }}>
                    {m}
                  </button>
                ))}
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#666" }}>
                  <span style={{ width: 10, height: 10, background: "#2e7d32", display: "inline-block" }} /> Masuk
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#666" }}>
                  <span style={{ width: 10, height: 10, background: "#c62828", display: "inline-block" }} /> Keluar
                </span>
              </div>
            </div>
            <BarChart series={chartSeries} mode={chartMode} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a", marginBottom: 14 }}>Pemasukan per Metode</div>
              {Object.keys(summary.byMetode).length === 0 ? <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data.</p>
                : Object.entries(summary.byMetode).sort((a, b) => b[1] - a[1]).map(([metode, jumlah]) => {
                  const pct = summary.totalPemasukan > 0 ? (jumlah / summary.totalPemasukan) * 100 : 0;
                  return (
                    <div key={metode} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "#1a1a1a", fontWeight: 600 }}>{metode}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#666" }}>{fmt(jumlah)}</span>
                      </div>
                      <div style={{ background: "#f0f0f0", height: 6, borderRadius: 3 }}>
                        <div style={{ background: "#2e7d32", height: 6, borderRadius: 3, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a", marginBottom: 14 }}>Pengeluaran per Kategori</div>
              {Object.keys(summary.byKategoriKeluar).length === 0 ? <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data.</p>
                : Object.entries(summary.byKategoriKeluar).sort((a, b) => b[1] - a[1]).map(([kategori, jumlah]) => {
                  const pct = summary.totalPengeluaran > 0 ? (jumlah / summary.totalPengeluaran) * 100 : 0;
                  return (
                    <div key={kategori} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "#1a1a1a", fontWeight: 600 }}>{kategori}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#666" }}>{fmt(jumlah)}</span>
                      </div>
                      <div style={{ background: "#f0f0f0", height: 6, borderRadius: 3 }}>
                        <div style={{ background: "#c62828", height: 6, borderRadius: 3, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
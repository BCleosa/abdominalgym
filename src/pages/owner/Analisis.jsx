import { useState, useEffect } from "react";
import { ownerApi } from "../../utils/api";
import { exportToExcel } from "../../utils/exportExcel";

const fmt = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
const PAKET_LABEL = { trial: "1x Trial", "8x": "8x Coaching", "12x": "12x Coaching", "16x": "16x Coaching" };

export default function Analisis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [awal, setAwal] = useState(new Date(Date.now() - 89 * 86400000).toISOString().split("T")[0]);
  const [akhir, setAkhir] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const res = await ownerApi.get(`/owner/analisis?awal=${awal}&akhir=${akhir}`);
      setData(res);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const inputStyle = { background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" };

  const handleExport = () => {
    if (!data) return;
    exportToExcel([
      ...data.paketRanking.map(p => ({ "Paket": PAKET_LABEL[p.paket] || p.paket, "Jumlah Sesi": p.count })),
    ], `Analisis_${awal}_${akhir}`, "Analisis");
  };

  return (
    <div>
      {/* Filter — export di pojok kanan */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="date" value={awal} onChange={e => setAwal(e.target.value)} style={inputStyle} />
          <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>s/d</span>
          <input type="date" value={akhir} onChange={e => setAkhir(e.target.value)} style={inputStyle} />
          <button onClick={fetchData} style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 18px", cursor: "pointer" }}>Terapkan</button>
        </div>
        <button onClick={handleExport} style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>Export Excel</button>
      </div>

      {error && <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", padding: "10px 14px", marginBottom: 16, fontSize: "0.825rem", color: "#c62828" }}>{error}</div>}

      {loading || !data ? (
        <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Memuat analisis...</p>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Member Aktif", val: data.totalMemberAktif, color: "#2e7d32" },
              { label: "Total Member", val: data.totalMember, color: "#1565c0" },
              { label: "Total Sesi PT", val: data.memberPTRanking.reduce((s, m) => s + m.count, 0), color: "#6a1b9a" },
            ].map(s => (
              <div key={s.label} style={{ flex: "1 1 180px", background: "#fff", border: "1px solid #e0e0e0", borderLeft: `4px solid ${s.color}`, padding: "14px 18px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Paket PT Terlaris */}
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 20, marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a", marginBottom: 14 }}>Paket PT Terlaris</div>
            {data.paketRanking.length === 0 ? (
              <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada sesi PT.</p>
            ) : data.paketRanking.map((item, i) => {
              const maxVal = data.paketRanking[0].count || 1;
              const pct = (item.count / maxVal) * 100;
              const color = i === 0 ? "#f57f17" : i === 1 ? "#888" : i === 2 ? "#8d6e63" : "#1565c0";
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.8rem", color, minWidth: 20 }}>#{i + 1}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.825rem", color: "#1a1a1a" }}>{PAKET_LABEL[item.paket] || item.paket}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#666" }}>{item.count} sesi</span>
                  </div>
                  <div style={{ background: "#f0f0f0", height: 5, borderRadius: 3 }}>
                    <div style={{ background: color, height: 5, borderRadius: 3, width: `${pct}%`, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sumber Pemasukan Terbesar — tanpa Iuran Member/Member */}
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a", marginBottom: 14 }}>Sumber Pemasukan Terbesar</div>
            {(() => {
              const filtered = data.kategoriRanking.filter(k => k.kategori !== "Iuran Member" && k.kategori !== "Member");
              if (filtered.length === 0) return <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data.</p>;
              const maxVal = filtered[0]?.total || 1;
              const colors = ["#2e7d32", "#1565c0", "#6a1b9a", "#c62828", "#f57f17"];
              return filtered.map((k, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.825rem", color: "#1a1a1a" }}>#{i + 1} {k.kategori}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#666" }}>{fmt(k.total)}</span>
                  </div>
                  <div style={{ background: "#f0f0f0", height: 6, borderRadius: 3 }}>
                    <div style={{ background: colors[i % colors.length], height: 6, borderRadius: 3, width: `${(k.total / maxVal) * 100}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </>
      )}
    </div>
  );
}
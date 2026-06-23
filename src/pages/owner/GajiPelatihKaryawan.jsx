import { useState, useEffect } from "react";
import { ownerApi } from "../../utils/api";
import { exportToExcel } from "../../utils/exportExcel";

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const namaBulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const formatBulan = (ym) => { const [y,m]=ym.split("-"); return `${namaBulan[parseInt(m,10)-1]} ${y}`; };

function computeRingkasanBulanan(riwayatPelatih, gajiKaryawan) {
  const map = {};
  riwayatPelatih.forEach(c => {
    const ym = (c.tanggalBayar || "").slice(0,7);
    if (!ym) return;
    if (!map[ym]) map[ym] = { bulan: ym, gajiPelatih: 0, gajiKaryawan: 0 };
    map[ym].gajiPelatih += c.jumlah || 0;
  });
  gajiKaryawan.forEach(g => {
    const ym = (g.tanggal || "").slice(0,7);
    if (!ym) return;
    if (!map[ym]) map[ym] = { bulan: ym, gajiPelatih: 0, gajiKaryawan: 0 };
    map[ym].gajiKaryawan += g.jumlah || 0;
  });
  return Object.values(map).map(m => ({ ...m, total: m.gajiPelatih + m.gajiKaryawan })).sort((a,b) => b.bulan.localeCompare(a.bulan));
}

export default function GajiPelatihKaryawan() {
  const [activeTab, setActiveTab] = useState("pelatih");
  const [gajiPelatih, setGajiPelatih] = useState({ siapDibayar: [], riwayatDibayar: [] });
  const [gajiKaryawan, setGajiKaryawan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bayarCycle, setBayarCycle] = useState(null);
  const [bayarForm, setBayarForm] = useState({ jumlah: "", metode: "Cash", keterangan: "" });
  const [bayarLoading, setBayarLoading] = useState(false);
  const [bayarError, setBayarError] = useState("");
  const [showKaryawanForm, setShowKaryawanForm] = useState(false);
  const [karyawanForm, setKaryawanForm] = useState({ namaKaryawan: "", bulan: new Date().toISOString().slice(0,7), jumlah: "60000", metode: "Cash", keterangan: "", tanggal: new Date().toISOString().split("T")[0] });
  const [absenInfo, setAbsenInfo] = useState(null);
  const [absenLoading, setAbsenLoading] = useState(false);
  const karyawanList = ["Tyo","Osa","Wisnu","Lutfi","Galang"];

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const [gp, gk] = await Promise.all([ownerApi.get("/owner/gaji-pelatih"), ownerApi.get("/owner/gaji-karyawan")]);
      setGajiPelatih(gp); setGajiKaryawan(gk);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openBayar = (cycle) => { setBayarCycle(cycle); setBayarForm({ jumlah: cycle.gajiDisarankan ? String(cycle.gajiDisarankan) : "", metode: "Cash", keterangan: "" }); setBayarError(""); };

  const handleBayarSubmit = async (e) => {
    e.preventDefault(); setBayarError(""); setBayarLoading(true);
    try {
      await ownerApi.post("/owner/gaji-pelatih/bayar", { cycleId: bayarCycle.cycleId, pelatih: bayarCycle.pelatih, member: bayarCycle.member, paket: bayarCycle.paket, jumlah: bayarForm.jumlah, metode: bayarForm.metode, keterangan: bayarForm.keterangan });
      setBayarCycle(null); fetchData();
    } catch (err) { setBayarError(err.message); }
    setBayarLoading(false);
  };

  const fetchAbsen = async (nama, bulan) => {
    if (!nama || !bulan) { setAbsenInfo(null); return; }
    setAbsenLoading(true);
    try {
      const res = await ownerApi.get(`/owner/absen-hitung?nama=${encodeURIComponent(nama)}&bulan=${bulan}`);
      setAbsenInfo(res);
      setKaryawanForm(p => ({ ...p, jumlah: String(res.totalGaji || 60000), keterangan: `Gaji bulan ${bulan} (${res.hadir} hari hadir)` }));
    } catch { setAbsenInfo(null); }
    setAbsenLoading(false);
  };

  const handleKaryawanSubmit = async (e) => {
    e.preventDefault();
    try {
      await ownerApi.post("/owner/gaji-karyawan", karyawanForm);
      setShowKaryawanForm(false);
      setKaryawanForm({ namaKaryawan: "", bulan: new Date().toISOString().slice(0,7), jumlah: "60000", metode: "Cash", keterangan: "", tanggal: new Date().toISOString().split("T")[0] });
      setAbsenInfo(null); fetchData();
    } catch (err) { alert("Gagal mencatat gaji karyawan: " + err.message); }
  };

  const handleExportRiwayatPelatih = () => {
    exportToExcel(gajiPelatih.riwayatDibayar.map(c => ({ "Tanggal Bayar": c.tanggalBayar, "Pelatih": c.pelatih, "Member": c.member, "Paket": c.paket, "Harga Paket": c.hargaPaket||"-", "Profit Gym": c.profitGym||"-", "Jumlah Dibayar": c.jumlah, "Metode": c.metode })), "Riwayat_Gaji_Pelatih", "Gaji Pelatih");
  };

  const handleExportKaryawan = () => {
    exportToExcel(gajiKaryawan.map(g => ({ "Tanggal": g.tanggal, "Keterangan": g.keterangan, "Jumlah": g.jumlah, "Metode": g.metode })), "Gaji_Karyawan", "Gaji Karyawan");
  };

  const ringkasanBulanan = computeRingkasanBulanan(gajiPelatih.riwayatDibayar, gajiKaryawan);

  const handleExportRingkasanBulanan = () => {
    exportToExcel(ringkasanBulanan.map(m => ({ "Bulan": formatBulan(m.bulan), "Gaji Pelatih": m.gajiPelatih, "Gaji Karyawan": m.gajiKaryawan, "Total": m.total })), "Ringkasan_Gaji_Bulanan", "Ringkasan Bulanan");
  };

  const inputStyle = { width: "100%", background: "#f5f5f5", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 5 };

  return (
    <div>
      {error && <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", padding: "10px 14px", marginBottom: 16, fontSize: "0.825rem", color: "#c62828" }}>{error}</div>}

      {/* Ringkasan Bulanan */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a" }}>Ringkasan Gaji per Bulan</div>
          <button onClick={handleExportRingkasanBulanan} style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.75rem", padding: "7px 14px", cursor: "pointer" }}>Export Excel</button>
        </div>
        {ringkasanBulanan.length === 0 ? (
          <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data gaji yang tercatat.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
            <thead><tr>
              {["Bulan","Gaji Pelatih","Gaji Karyawan","Total"].map(h => (
                <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 12px", textAlign: h==="Bulan"?"left":"right", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {ringkasanBulanan.map(m => (
                <tr key={m.bulan} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1a1a1a" }}>{formatBulan(m.bulan)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--font-mono)", color: "#555" }}>{fmt(m.gajiPelatih)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--font-mono)", color: "#555" }}>{fmt(m.gajiKaryawan)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#c62828" }}>{fmt(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
        {[["pelatih",`Gaji Pelatih${gajiPelatih.siapDibayar.length>0?` (${gajiPelatih.siapDibayar.length})`:""}`],["karyawan","Gaji Karyawan"]].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ background: "none", border: "none", borderBottom: activeTab===id?"2px solid #1a1a1a":"2px solid transparent", padding: "9px 20px", marginBottom: -1, fontFamily: "var(--font-body)", fontWeight: activeTab===id?600:400, fontSize: "0.875rem", color: activeTab===id?"#1a1a1a":"#888", cursor: "pointer", transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Memuat...</p>
      ) : activeTab === "pelatih" ? (
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a", marginBottom: 4 }}>Siap Dibayar</div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#999", marginBottom: 14 }}>Paket PT yang udah selesai full sesinya tapi belum ditandai dibayar ke pelatihnya.</p>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto", marginBottom: 28 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead><tr>
                {["Pelatih","Member","Paket","Progress","Selesai","Saran Gaji","Aksi"].map(h => (
                  <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {gajiPelatih.siapDibayar.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada paket yang siap dibayar.</td></tr>
                ) : gajiPelatih.siapDibayar.map(c => (
                  <tr key={c.cycleId} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a" }}>{c.pelatih}</td>
                    <td style={{ padding: "10px 14px", color: "#555" }}>{c.member}</td>
                    <td style={{ padding: "10px 14px" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#1565c0", background: "#e3f2fd", padding: "2px 8px" }}>{c.paket}</span></td>
                    <td style={{ padding: "10px 14px", color: "#2e7d32", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{c.completed}/{c.total} ✓</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{c.selesai||"-"}</td>
                    <td style={{ padding: "10px 14px", color: "#1a1a1a", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.8rem" }}>{fmt(c.gajiDisarankan)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <button onClick={() => openBayar(c)} style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.7rem", padding: "6px 14px", cursor: "pointer" }}>Tandai Dibayar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a" }}>Riwayat Pembayaran</div>
            <button onClick={handleExportRiwayatPelatih} style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.75rem", padding: "7px 14px", cursor: "pointer" }}>Export Excel</button>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead><tr>
                {["Tanggal Bayar","Pelatih","Member","Paket","Jumlah","Metode"].map(h => (
                  <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {gajiPelatih.riwayatDibayar.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 28, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada riwayat pembayaran.</td></tr>
                ) : gajiPelatih.riwayatDibayar.map(c => (
                  <tr key={c.cycleId} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{c.tanggalBayar}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a" }}>{c.pelatih}</td>
                    <td style={{ padding: "10px 14px", color: "#555" }}>{c.member}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{c.paket}</td>
                    <td style={{ padding: "10px 14px", color: "#2e7d32", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmt(c.jumlah)}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{c.metode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
            <button onClick={handleExportKaryawan} style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "9px 16px", cursor: "pointer" }}>Export Excel</button>
            <button onClick={() => setShowKaryawanForm(true)} style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>+ Catat Gaji Karyawan</button>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead><tr>
                {["Tanggal","Keterangan","Jumlah","Metode"].map(h => (
                  <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {gajiKaryawan.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 28, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada catatan gaji karyawan.</td></tr>
                ) : gajiKaryawan.map(g => (
                  <tr key={g.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{g.tanggal}</td>
                    <td style={{ padding: "10px 14px", color: "#1a1a1a" }}>{g.keterangan}</td>
                    <td style={{ padding: "10px 14px", color: "#c62828", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmt(g.jumlah)}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{g.metode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tandai Dibayar */}
      {bayarCycle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setBayarCycle(null); }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 420, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 4 }}>Tandai Gaji Dibayar</div>
            <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: 14 }}>{bayarCycle.pelatih} — {bayarCycle.member} ({bayarCycle.paket})</p>
            {bayarCycle.hargaPaket > 0 && (
              <div style={{ background: "#fafafa", border: "1px solid #eee", padding: "10px 14px", marginBottom: 16, fontSize: "0.75rem", color: "#666", lineHeight: 1.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Harga paket</span><span>{fmt(bayarCycle.hargaPaket)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Profit gym ({bayarCycle.profitGymPersen}%)</span><span style={{ color: "#c62828" }}>- {fmt(bayarCycle.profitGym)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#1a1a1a", borderTop: "1px solid #e0e0e0", marginTop: 4, paddingTop: 4 }}><span>Saran gaji pelatih</span><span>{fmt(bayarCycle.gajiDisarankan)}</span></div>
              </div>
            )}
            <form onSubmit={handleBayarSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Jumlah Gaji (Rp) *</label>
                <input style={inputStyle} type="number" min={1} value={bayarForm.jumlah} onChange={e => setBayarForm(p => ({ ...p, jumlah: e.target.value }))} required onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Metode</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={bayarForm.metode} onChange={e => setBayarForm(p => ({ ...p, metode: e.target.value }))}>
                  <option>Cash</option><option>Transfer</option><option>QRIS</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Keterangan</label>
                <input style={inputStyle} value={bayarForm.keterangan} onChange={e => setBayarForm(p => ({ ...p, keterangan: e.target.value }))} placeholder="Opsional" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              {bayarError && <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", padding: "10px 14px", marginBottom: 14, fontSize: "0.8rem", color: "#c62828" }}>{bayarError}</div>}
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#aaa", marginBottom: 16 }}>Otomatis tercatat juga ke Keuangan sebagai pengeluaran kategori "Gaji".</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setBayarCycle(null)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={bayarLoading} style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: bayarLoading ? "default" : "pointer", opacity: bayarLoading ? 0.6 : 1 }}>
                  {bayarLoading ? "Memproses..." : "Konfirmasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Gaji Karyawan */}
      {showKaryawanForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowKaryawanForm(false); setAbsenInfo(null); } }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 440, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e0e0e0" }}>Catat Gaji Karyawan</div>
            <form onSubmit={handleKaryawanSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Nama Karyawan *</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={karyawanForm.namaKaryawan}
                    onChange={e => { setKaryawanForm(p => ({ ...p, namaKaryawan: e.target.value })); fetchAbsen(e.target.value, karyawanForm.bulan); }} required>
                    <option value="">Pilih...</option>
                    {karyawanList.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Bulan *</label>
                  <input type="month" style={inputStyle} value={karyawanForm.bulan}
                    onChange={e => { setKaryawanForm(p => ({ ...p, bulan: e.target.value })); fetchAbsen(karyawanForm.namaKaryawan, e.target.value); }}
                    onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
                </div>
              </div>
              {absenLoading && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#999", marginBottom: 14 }}>Menghitung dari data absen...</p>}
              {!absenLoading && absenInfo && (
                <div style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                    {[{ label:"Hadir", val:absenInfo.hadir, color:"#2e7d32" },{ label:"Izin", val:absenInfo.izin, color:"#f57f17" },{ label:"Sakit", val:absenInfo.sakit, color:"#1565c0" },{ label:"Alpha", val:absenInfo.alpha, color:"#c62828" }].map(s => (
                      <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: s.color }}>{s.val}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "#888" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#555" }}>
                    Auto: {absenInfo.hadir} hari × Rp {Number(absenInfo.gajiHarian).toLocaleString("id-ID")} = <strong style={{ color: "#1a1a1a" }}>Rp {Number(absenInfo.totalGaji).toLocaleString("id-ID")}</strong>
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Jumlah (Rp) *</label>
                  <input style={inputStyle} type="number" min={1} value={karyawanForm.jumlah} onChange={e => setKaryawanForm(p => ({ ...p, jumlah: e.target.value }))} required onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal Bayar</label>
                  <input style={inputStyle} type="date" value={karyawanForm.tanggal} onChange={e => setKaryawanForm(p => ({ ...p, tanggal: e.target.value }))} onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Metode</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={karyawanForm.metode} onChange={e => setKaryawanForm(p => ({ ...p, metode: e.target.value }))}>
                  <option>Cash</option><option>Transfer</option><option>QRIS</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Keterangan</label>
                <input style={inputStyle} value={karyawanForm.keterangan} onChange={e => setKaryawanForm(p => ({ ...p, keterangan: e.target.value }))} placeholder="Otomatis terisi dari data absen" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => { setShowKaryawanForm(false); setAbsenInfo(null); }} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
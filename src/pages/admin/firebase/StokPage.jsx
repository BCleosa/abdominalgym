import { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import { exportToExcel } from "../../../utils/exportExcel";

const kategoriBarang = ["Minuman", "Suplemen", "Merchandise", "Peralatan", "Lain-lain"];
const emptyForm = { nama: "", kategori: "Minuman", stokKardus: 0, stokShowcase: 0, hargaBeli: "", hargaJual: "", satuan: "pcs", keterangan: "" };
const emptyTrxForm = { barangId: "", barangNama: "", tipe: "masuk_kardus", jumlah: 1, keterangan: "" };

// Gabungin transaksi flat jadi ringkasan harian per barang, format kartu stok ala Excel:
// Stok Awal | Masuk | Keluar | Stok Akhir, masing-masing buat Kardus & Showcase.
// "Masuk Showcase" otomatis sama dengan "Keluar Kardus" karena itu perpindahan fisik yang sama,
// dicatat sebagai satu transaksi tipe "pindah_showcase".
function computeRingkasan(transaksi) {
  const groups = {};
  transaksi.forEach(t => {
    const key = `${t.tanggal}__${t.barangId}`;
    if (!groups[key]) groups[key] = { tanggal: t.tanggal, barangId: t.barangId, barangNama: t.barangNama, entries: [] };
    groups[key].entries.push(t);
  });
  return Object.values(groups).map(g => {
    const sorted = [...g.entries].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const masukKardus = sorted.filter(e => e.tipe === "masuk_kardus").reduce((s, e) => s + e.jumlah, 0);
    const keluarKardus = sorted.filter(e => e.tipe === "pindah_showcase").reduce((s, e) => s + e.jumlah, 0);
    const masukShowcase = keluarKardus;
    const keluarShowcase = sorted.filter(e => e.tipe === "keluar_showcase").reduce((s, e) => s + e.jumlah, 0);
    return {
      tanggal: g.tanggal,
      barangNama: g.barangNama,
      stokAwalKardus: first.stokKardusSebelum ?? 0,
      masukKardus, keluarKardus,
      stokAkhirKardus: last.stokKardusSesudah ?? 0,
      stokAwalShowcase: first.stokShowcaseSebelum ?? 0,
      masukShowcase, keluarShowcase,
      stokAkhirShowcase: last.stokShowcaseSesudah ?? 0,
    };
  }).sort((a, b) => b.tanggal.localeCompare(a.tanggal) || a.barangNama.localeCompare(b.barangNama));
}

export default function StokPage() {
  const [data, setData] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTrxForm, setShowTrxForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [trxForm, setTrxForm] = useState(emptyTrxForm);
  const [trxError, setTrxError] = useState("");
  const [activeTab, setActiveTab] = useState("stok");
  const [selectedStok, setSelectedStok] = useState(new Set());
  const [searchRingkasan, setSearchRingkasan] = useState("");
  const [filterAwal, setFilterAwal] = useState("");
  const [filterAkhir, setFilterAkhir] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stokData, trxData] = await Promise.all([
        api.get("/stok/barang"),
        api.get("/stok/transaksi"),
      ]);
      setData(stokData);
      setTransaksi(trxData);
    } catch (err) {
      alert("Gagal memuat data stok: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/stok/barang/${editId}`, form);
      } else {
        await api.post("/stok/barang", form);
      }
      setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
    } catch (err) {
      alert("Gagal menyimpan barang: " + err.message);
    }
  };

  const handleTrxSubmit = async (e) => {
    e.preventDefault();
    setTrxError("");
    try {
      await api.post("/stok/transaksi", trxForm);
      setShowTrxForm(false);
      setTrxForm(emptyTrxForm);
      fetchData();
    } catch (err) {
      setTrxError(err.message || "Gagal memproses transaksi stok");
    }
  };

  const openEdit = (d) => {
    setForm({ nama: d.nama, kategori: d.kategori, stokKardus: d.stokKardus ?? 0, stokShowcase: d.stokShowcase ?? 0, hargaBeli: d.hargaBeli?.toString() || "", hargaJual: d.hargaJual?.toString() || "", satuan: d.satuan || "pcs", keterangan: d.keterangan || "" });
    setEditId(d.id); setShowForm(true);
  };

  const openTrx = (d) => {
    setTrxForm({ barangId: d.id, barangNama: d.nama, tipe: "masuk_kardus", jumlah: 1, keterangan: "" });
    setTrxError("");
    setShowTrxForm(true);
  };

  const fmt = n => "Rp " + Number(n).toLocaleString("id-ID");

  const inputStyle = { width: "100%", background: "#f5f5f5", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 5 };
  const exportBtnStyle = { background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "9px 16px", cursor: "pointer" };

  const toggleSelectStok = (id) => {
    setSelectedStok(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAllStok = () => {
    setSelectedStok(prev => prev.size === data.length ? new Set() : new Set(data.map(d => d.id)));
  };

  const ringkasan = computeRingkasan(transaksi).filter(r =>
    (!searchRingkasan || r.barangNama?.toLowerCase().includes(searchRingkasan.toLowerCase())) &&
    (!filterAwal || r.tanggal >= filterAwal) &&
    (!filterAkhir || r.tanggal <= filterAkhir)
  );

  const handleExportStok = () => {
    const source = selectedStok.size > 0 ? data.filter(b => selectedStok.has(b.id)) : data;
    const rows = source.map(b => ({
      "Nama Barang": b.nama,
      "Kategori": b.kategori,
      "Stok Kardus": b.stokKardus || 0,
      "Stok Showcase": b.stokShowcase || 0,
      "Total Stok": (b.stokKardus || 0) + (b.stokShowcase || 0),
      "Harga Beli": b.hargaBeli,
      "Harga Jual": b.hargaJual,
      "Satuan": b.satuan,
      "Keterangan": b.keterangan || "",
    }));
    exportToExcel(rows, "Data_Stok", "Stok");
  };

  const handleExportRingkasan = () => {
    const rows = ringkasan.map(r => ({
      "Tanggal": r.tanggal,
      "Barang": r.barangNama,
      "Stok Awal Kardus": r.stokAwalKardus,
      "Masuk Kardus": r.masukKardus,
      "Keluar Kardus": r.keluarKardus,
      "Stok Akhir Kardus": r.stokAkhirKardus,
      "Stok Awal Showcase": r.stokAwalShowcase,
      "Masuk Showcase": r.masukShowcase,
      "Keluar Showcase": r.keluarShowcase,
      "Stok Akhir Showcase": r.stokAkhirShowcase,
    }));
    exportToExcel(rows, "Ringkasan_Stok_Harian", "Ringkasan");
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Item", val: data.length, color: "#1a1a1a" },
          { label: "Total Stok Kardus", val: data.reduce((s, d) => s + (d.stokKardus || 0), 0), color: "#5d4037" },
          { label: "Total Stok Showcase", val: data.reduce((s, d) => s + (d.stokShowcase || 0), 0), color: "#1565c0" },
          { label: "Showcase Kosong", val: data.filter(d => (d.stokShowcase || 0) === 0).length, color: "#c62828" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: s.color }}>{s.val}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
        {[["stok", "Data Stok"], ["ringkasan", "Ringkasan Harian"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #1a1a1a" : "2px solid transparent", padding: "9px 20px", marginBottom: -1, fontFamily: "var(--font-body)", fontWeight: activeTab === id ? 600 : 400, fontSize: "0.875rem", color: activeTab === id ? "#1a1a1a" : "#888", cursor: "pointer", transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Data Stok Tab */}
      {activeTab === "stok" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14, alignItems: "center" }}>
            {selectedStok.size > 0 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#1565c0" }}>{selectedStok.size} dipilih</span>
            )}
            <button onClick={handleExportStok} style={exportBtnStyle}>Export Excel</button>
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
              style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
              + Tambah Barang
            </button>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr>
                  <th style={{ background: "#f5f5f5", padding: "10px 14px", width: 36, borderBottom: "1px solid #1a1a1a" }}>
                    <input type="checkbox" checked={data.length > 0 && selectedStok.size === data.length} onChange={toggleSelectAllStok} />
                  </th>
                  {["Nama Barang", "Kategori", "Stok Kardus", "Stok Showcase", "Total", "Satuan", "Harga Beli", "Harga Jual", "Aksi"].map(h => (
                    <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Memuat...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data stok</td></tr>
                ) : data.map(d => {
                  const total = (d.stokKardus || 0) + (d.stokShowcase || 0);
                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid #f0f0f0", background: selectedStok.has(d.id) ? "#f5faff" : "transparent" }}
                      onMouseOver={e => e.currentTarget.style.background = selectedStok.has(d.id) ? "#eef6ff" : "#fafafa"}
                      onMouseOut={e => e.currentTarget.style.background = selectedStok.has(d.id) ? "#f5faff" : "transparent"}
                    >
                      <td style={{ padding: "10px 14px" }}>
                        <input type="checkbox" checked={selectedStok.has(d.id)} onChange={() => toggleSelectStok(d.id)} />
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a" }}>{d.nama}</td>
                      <td style={{ padding: "10px 14px", color: "#666" }}>{d.kategori}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: "#5d4037" }}>{d.stokKardus || 0}</span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: (d.stokShowcase || 0) === 0 ? "#c62828" : "#1565c0" }}>{d.stokShowcase || 0}</span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: total === 0 ? "#c62828" : total <= 5 ? "#f57f17" : "#2e7d32" }}>{total}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#555", fontSize: "0.8rem" }}>{d.satuan}</td>
                      <td style={{ padding: "10px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{fmt(d.hargaBeli)}</td>
                      <td style={{ padding: "10px 14px", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{fmt(d.hargaJual)}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <button onClick={() => openTrx(d)} style={{ background: "none", border: "none", color: "#1565c0", fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer", padding: "2px 6px" }}>± Transaksi</button>
                        <button onClick={() => openEdit(d)} style={{ background: "none", border: "none", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                        <button onClick={() => setDeleteId(d.id)} style={{ background: "none", border: "none", color: "#c62828", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ringkasan Harian Tab */}
      {activeTab === "ringkasan" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input value={searchRingkasan} onChange={e => setSearchRingkasan(e.target.value)} placeholder="🔍 Cari nama barang..."
                style={{ ...inputStyle, width: 200 }} />
              <input type="date" value={filterAwal} onChange={e => setFilterAwal(e.target.value)} style={{ ...inputStyle, width: "auto" }} />
              <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>s/d</span>
              <input type="date" value={filterAkhir} onChange={e => setFilterAkhir(e.target.value)} style={{ ...inputStyle, width: "auto" }} />
              {(filterAwal || filterAkhir || searchRingkasan) && (
                <button onClick={() => { setFilterAwal(""); setFilterAkhir(""); setSearchRingkasan(""); }}
                  style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "8px 14px", cursor: "pointer" }}>Reset</button>
              )}
            </div>
            <button onClick={handleExportRingkasan} style={exportBtnStyle}>Export Excel</button>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#999", marginBottom: 10 }}>
            Format kartu stok harian per barang, lengkap Kardus & Showcase — sama kayak di Excel.
          </p>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #1a1a1a", borderRight: "1px solid #e0e0e0", verticalAlign: "bottom" }}>Tanggal</th>
                  <th rowSpan={2} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #1a1a1a", borderRight: "1px solid #e0e0e0", verticalAlign: "bottom" }}>Barang</th>
                  <th colSpan={4} style={{ background: "#efebe9", color: "#5d4037", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px", textAlign: "center", borderBottom: "1px solid #1a1a1a", borderRight: "1px solid #e0e0e0" }}>Kardus</th>
                  <th colSpan={4} style={{ background: "#e3f2fd", color: "#1565c0", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>Showcase</th>
                </tr>
                <tr>
                  {["Awal", "Masuk", "Keluar", "Akhir"].map(h => (
                    <th key={"k" + h} style={{ background: "#f5f5f5", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.6rem", padding: "6px 10px", textAlign: "center", borderBottom: "1px solid #1a1a1a", borderRight: h === "Akhir" ? "1px solid #e0e0e0" : "none" }}>{h}</th>
                  ))}
                  {["Awal", "Masuk", "Keluar", "Akhir"].map(h => (
                    <th key={"s" + h} style={{ background: "#f5f5f5", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.6rem", padding: "6px 10px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Memuat...</td></tr>
                ) : ringkasan.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada transaksi stok</td></tr>
                ) : ringkasan.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseOver={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "8px 12px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.75rem", borderRight: "1px solid #f5f5f5" }}>{r.tanggal}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1a1a1a", borderRight: "1px solid #f5f5f5" }}>{r.barangNama}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#888", fontFamily: "var(--font-mono)" }}>{r.stokAwalKardus}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#2e7d32", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.masukKardus > 0 ? `+${r.masukKardus}` : "-"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#c62828", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.keluarKardus > 0 ? `-${r.keluarKardus}` : "-"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#1a1a1a", fontFamily: "var(--font-mono)", fontWeight: 700, borderRight: "1px solid #f5f5f5" }}>{r.stokAkhirKardus}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#888", fontFamily: "var(--font-mono)" }}>{r.stokAwalShowcase}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#2e7d32", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.masukShowcase > 0 ? `+${r.masukShowcase}` : "-"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#c62828", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.keluarShowcase > 0 ? `-${r.keluarShowcase}` : "-"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#1a1a1a", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{r.stokAkhirShowcase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Barang Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e0e0e0" }}>
              {editId ? "Edit Barang" : "Tambah Barang"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Nama Barang *</label><input style={inputStyle} value={form.nama} onChange={e => sf("nama", e.target.value)} required onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} /></div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.kategori} onChange={e => sf("kategori", e.target.value)}>
                    {kategoriBarang.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 6 }}>
                <div><label style={labelStyle}>Stok Kardus (di luar)</label><input style={inputStyle} type="number" min={0} value={form.stokKardus} onChange={e => sf("stokKardus", e.target.value)} onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} /></div>
                <div><label style={labelStyle}>Stok Showcase (di kulkas)</label><input style={inputStyle} type="number" min={0} value={form.stokShowcase} onChange={e => sf("stokShowcase", e.target.value)} onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} /></div>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#aaa", marginBottom: 14 }}>
                {editId ? 'Mengubah angka ini langsung menimpa stok saat ini (gak tercatat di Ringkasan Harian). Buat transaksi masuk/pindah/keluar normal, pakai tombol "± Transaksi" di tabel.' : "Jumlah stok awal saat barang pertama kali didaftarkan."}
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Satuan</label>
                <input style={inputStyle} value={form.satuan} onChange={e => sf("satuan", e.target.value)} placeholder="pcs / botol / dus" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Harga Beli (Rp)</label><input style={inputStyle} type="number" min={0} value={form.hargaBeli} onChange={e => sf("hargaBeli", e.target.value)} onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} /></div>
                <div><label style={labelStyle}>Harga Jual (Rp)</label><input style={inputStyle} type="number" min={0} value={form.hargaJual} onChange={e => sf("hargaJual", e.target.value)} onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} /></div>
              </div>
              <div style={{ marginBottom: 20 }}><label style={labelStyle}>Keterangan</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.keterangan} onChange={e => sf("keterangan", e.target.value)} onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Transaksi Modal */}
      {showTrxForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTrxForm(false); }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 440, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e0e0e0" }}>
              Catat Transaksi Stok
            </div>
            <form onSubmit={handleTrxSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Pilih Barang *</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={trxForm.barangId}
                  onChange={e => {
                    const b = data.find(d => d.id === e.target.value);
                    setTrxForm(p => ({ ...p, barangId: e.target.value, barangNama: b?.nama || "" }));
                  }} required>
                  <option value="">Pilih barang...</option>
                  {data.map(d => <option key={d.id} value={d.id}>{d.nama} (Kardus: {d.stokKardus || 0} · Showcase: {d.stokShowcase || 0})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Jenis Transaksi</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={trxForm.tipe} onChange={e => setTrxForm(p => ({ ...p, tipe: e.target.value }))}>
                  <option value="masuk_kardus">Masuk Kardus (stok baru datang)</option>
                  <option value="pindah_showcase">Pindah ke Showcase (kardus → kulkas)</option>
                  <option value="keluar_showcase">Keluar Showcase (terjual)</option>
                </select>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#999", marginTop: 5 }}>
                  {trxForm.tipe === "masuk_kardus" && "Nambah stok Kardus dari kiriman supplier."}
                  {trxForm.tipe === "pindah_showcase" && "Kardus berkurang, Showcase bertambah jumlah yang sama."}
                  {trxForm.tipe === "keluar_showcase" && "Stok Showcase berkurang karena ada yang beli."}
                </p>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Jumlah *</label>
                <input style={inputStyle} type="number" min={1} value={trxForm.jumlah} onChange={e => setTrxForm(p => ({ ...p, jumlah: e.target.value }))} required onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Keterangan</label>
                <input style={inputStyle} value={trxForm.keterangan} onChange={e => setTrxForm(p => ({ ...p, keterangan: e.target.value }))} placeholder="Opsional" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              {trxError && (
                <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", padding: "10px 14px", marginBottom: 14, fontSize: "0.8rem", color: "#c62828" }}>{trxError}</div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowTrxForm(false)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 28, maxWidth: 360 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#1a1a1a", marginBottom: 12 }}>Hapus Barang?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data barang ini akan dihapus permanen.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={async () => { try { await api.delete(`/stok/barang/${deleteId}`); setDeleteId(null); fetchData(); } catch (err) { alert("Gagal menghapus barang: " + err.message); } }} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
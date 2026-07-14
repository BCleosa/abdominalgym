import { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import { exportToExcel } from "../../../utils/exportExcel";

const fmt = n => "Rp " + Number(n).toLocaleString("id-ID");
const emptyForm = { tanggal: new Date().toISOString().split("T")[0], tipe: "pemasukan", kategori: "Member", keterangan: "", jumlah: "", metode: "Cash" };
const kategoriMasuk = ["Member", "Personal Training", "Penjualan Barang", "Lain-lain"];
const kategoriKeluar = ["Gaji", "Operasional", "Perawatan", "Pembelian Barang", "Utilitas", "Tarik Tunai", "Lain-lain"];
const metodes = ["Cash", "Transfer", "QRIS"];

export default function KeuanganPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterTipe, setFilterTipe] = useState("semua");
  const [filterBulan, setFilterBulan] = useState("");
  const [selected, setSelected] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const docs = await api.get("/keuangan");
      setData(docs);
    } catch (err) {
      alert("Gagal memuat data keuangan: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/keuangan/${editId}`, form);
      } else {
        await api.post("/keuangan", form);
      }
      setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
    } catch (err) {
      alert("Gagal menyimpan transaksi: " + err.message);
    }
  };

  const openEdit = (d) => {
    setForm({ tanggal: d.tanggal, tipe: d.tipe, kategori: d.kategori, keterangan: d.keterangan, jumlah: d.jumlah.toString(), metode: d.metode });
    setEditId(d.id); setShowForm(true);
  };

  const filtered = data.filter(d => {
    const matchTipe = filterTipe === "semua" || d.tipe === filterTipe;
    const matchBulan = !filterBulan || d.tanggal?.startsWith(filterBulan);
    return matchTipe && matchBulan;
  });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(d => d.id)));
  };

  const handleExport = () => {
    const source = selected.size > 0 ? filtered.filter(d => selected.has(d.id)) : filtered;
    const rows = source.map(d => ({
      "Tanggal": d.tanggal,
      "Tipe": d.tipe,
      "Kategori": d.kategori,
      "Keterangan": d.keterangan || "",
      "Jumlah": d.jumlah,
      "Metode": d.metode,
    }));
    exportToExcel(rows, "Keuangan", "Keuangan");
  };

  const totalMasuk = filtered.filter(d => d.tipe === "pemasukan").reduce((s, d) => s + d.jumlah, 0);
  const totalKeluar = filtered.filter(d => d.tipe === "pengeluaran").reduce((s, d) => s + d.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;
  const totalCash = filtered.filter(d => d.tipe === "pemasukan" && (d.metode || "").toLowerCase() === "cash").reduce((s, d) => s + d.jumlah, 0);
  const totalQris = filtered.filter(d => d.tipe === "pemasukan" && (d.metode || "").toLowerCase() === "qris").reduce((s, d) => s + d.jumlah, 0);

  const inputStyle = { width: "100%", background: "#f5f5f5", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 5 };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pemasukan", val: fmt(totalMasuk), color: "#2e7d32" },
          { label: "Pengeluaran", val: fmt(totalKeluar), color: "#c62828" },
          { label: "Saldo Bersih", val: fmt(saldo), color: saldo >= 0 ? "#1a1a1a" : "#c62828" },
          { label: "Cash", val: fmt(totalCash), color: "#1565c0" },
          { label: "QRIS", val: fmt(totalQris), color: "#6a1b9a" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e0e0e0", padding: "14px 16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: s.color, lineHeight: 1, marginTop: 8 }}>{s.val}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={filterTipe} onChange={e => setFilterTipe(e.target.value)}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none", appearance: "none" }}>
            <option value="semua">Semua</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
          <input type="month" value={filterBulan} onChange={e => setFilterBulan(e.target.value)}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" }} />
          <button onClick={handleExport}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "9px 16px", cursor: "pointer" }}>
            Export Excel
          </button>
          {selected.size > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#1565c0", alignSelf: "center" }}>{selected.size} dipilih</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setForm({ ...emptyForm, tipe: "pemasukan" }); setEditId(null); setShowForm(true); }}
            style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", color: "#2e7d32", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>
            + Pemasukan
          </button>
          <button onClick={() => { setForm({ ...emptyForm, tipe: "pengeluaran", kategori: "Gaji" }); setEditId(null); setShowForm(true); }}
            style={{ background: "#ffebee", border: "1px solid #ef9a9a", color: "#c62828", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>
            + Pengeluaran
          </button>
          <button onClick={() => { setForm({ ...emptyForm, tipe: "pengeluaran", kategori: "Tarik Tunai", keterangan: "Tarik Tunai" }); setEditId(null); setShowForm(true); }}
            style={{ background: "#efebe9", border: "1px solid #bcaaa4", color: "#5d4037", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>
            💵 Tarik Tunai
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
          <thead>
            <tr>
              <th style={{ background: "#f5f5f5", padding: "10px 14px", width: 36, borderBottom: "1px solid #1a1a1a" }}>
                <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleSelectAll} />
              </th>
              {["Tanggal", "Tipe", "Kategori", "Keterangan", "Metode", "Jumlah", "Aksi"].map(h => (
                <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} style={{ borderBottom: "1px solid #f0f0f0", background: selected.has(d.id) ? "#f5faff" : "transparent" }}
                onMouseOver={e => e.currentTarget.style.background = selected.has(d.id) ? "#eef6ff" : "#fafafa"}
                onMouseOut={e => e.currentTarget.style.background = selected.has(d.id) ? "#f5faff" : "transparent"}
              >
                <td style={{ padding: "10px 14px" }}>
                  <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)} />
                </td>
                <td style={{ padding: "10px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{d.tanggal}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: d.tipe === "pemasukan" ? "#e8f5e9" : "#ffebee", color: d.tipe === "pemasukan" ? "#2e7d32" : "#c62828", border: `1px solid ${d.tipe === "pemasukan" ? "#a5d6a7" : "#ef9a9a"}`, fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 8px" }}>
                    {d.tipe === "pemasukan" ? "↑ Masuk" : "↓ Keluar"}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", color: "#555", fontSize: "0.8rem" }}>{d.kategori}</td>
                <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem", maxWidth: 200 }}>{d.keterangan}</td>
                <td style={{ padding: "10px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{d.metode}</td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: 600, color: d.tipe === "pemasukan" ? "#2e7d32" : "#c62828" }}>
                  {d.tipe === "pemasukan" ? "+" : "-"}{fmt(d.jumlah)}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <button onClick={() => openEdit(d)} style={{ background: "none", border: "none", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                  <button onClick={() => setDeleteId(d.id)} style={{ background: "none", border: "none", color: "#c62828", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div style={{ padding: "10px 14px", background: "#f5f5f5", borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "flex-end", gap: 24 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#2e7d32" }}>Masuk: {fmt(totalMasuk)}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#c62828" }}>Keluar: {fmt(totalKeluar)}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600, color: saldo >= 0 ? "#1a1a1a" : "#c62828" }}>Saldo: {fmt(saldo)}</span>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 480, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e0e0e0" }}>
              {editId ? "Edit Transaksi" : form.tipe === "pemasukan" ? "Tambah Pemasukan" : "Tambah Pengeluaran"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Tipe</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.tipe} onChange={e => sf("tipe", e.target.value)}>
                    <option value="pemasukan">Pemasukan</option>
                    <option value="pengeluaran">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tanggal *</label>
                  <input style={inputStyle} type="date" value={form.tanggal} onChange={e => sf("tanggal", e.target.value)} required onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.kategori} onChange={e => sf("kategori", e.target.value)}>
                    {(form.tipe === "pemasukan" ? kategoriMasuk : kategoriKeluar).map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Metode</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.metode} onChange={e => sf("metode", e.target.value)}>
                    {metodes.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Keterangan *</label>
                <input style={inputStyle} value={form.keterangan} onChange={e => sf("keterangan", e.target.value)} required placeholder="Deskripsi transaksi" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Jumlah (Rp) *</label>
                <input style={inputStyle} type="number" min={0} value={form.jumlah} onChange={e => sf("jumlah", e.target.value)} required placeholder="Nominal" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 28, maxWidth: 360 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#1a1a1a", marginBottom: 12 }}>Hapus Transaksi?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data transaksi ini akan dihapus permanen.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={async () => { try { await api.delete(`/keuangan/${deleteId}`); setDeleteId(null); fetchData(); } catch (err) { alert("Gagal menghapus transaksi: " + err.message); } }} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

const fmt = n => "Rp " + Number(n).toLocaleString("id-ID");
const emptyForm = { tanggal: new Date().toISOString().split("T")[0], tipe: "pemasukan", kategori: "Iuran Member", keterangan: "", jumlah: "", metode: "Cash" };
const kategoriMasuk = ["Iuran Member", "Personal Training", "Penjualan Barang", "Lain-lain"];
const kategoriKeluar = ["Gaji", "Operasional", "Perawatan", "Pembelian Barang", "Utilitas", "Lain-lain"];
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

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "keuangan"));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.tanggal?.localeCompare(a.tanggal));
    setData(docs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, jumlah: parseFloat(form.jumlah) || 0 };
    if (editId) {
      await updateDoc(doc(db, "keuangan", editId), { ...payload, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "keuangan"), { ...payload, createdAt: serverTimestamp() });
    }
    setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
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

  const totalMasuk = filtered.filter(d => d.tipe === "pemasukan").reduce((s, d) => s + d.jumlah, 0);
  const totalKeluar = filtered.filter(d => d.tipe === "pengeluaran").reduce((s, d) => s + d.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  const inputStyle = { width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: 5 };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pemasukan", val: fmt(totalMasuk), color: "#4caf50" },
          { label: "Pengeluaran", val: fmt(totalKeluar), color: "#f44336" },
          { label: "Saldo Bersih", val: fmt(saldo), color: saldo >= 0 ? "#f0ede8" : "#f44336" },
          { label: "Transaksi", val: filtered.length, color: "#888" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#141414", border: "1px solid #1e1e1e", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: s.color, lineHeight: 1, marginTop: 8 }}>{s.val}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={filterTipe} onChange={e => setFilterTipe(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none", appearance: "none" }}>
            <option value="semua">Semua</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
          <input type="month" value={filterBulan} onChange={e => setFilterBulan(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setForm({ ...emptyForm, tipe: "pemasukan" }); setEditId(null); setShowForm(true); }}
            style={{ background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.4)", color: "#4caf50", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>
            + Pemasukan
          </button>
          <button onClick={() => { setForm({ ...emptyForm, tipe: "pengeluaran", kategori: "Gaji" }); setEditId(null); setShowForm(true); }}
            style={{ background: "rgba(244,67,54,0.15)", border: "1px solid rgba(244,67,54,0.4)", color: "#f44336", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>
            + Pengeluaran
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
          <thead>
            <tr>
              {["Tanggal", "Tipe", "Kategori", "Keterangan", "Metode", "Jumlah", "Aksi"].map(h => (
                <th key={h} style={{ background: "#1a1a1a", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#333" }}>Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                onMouseOver={e => e.currentTarget.style.background = "#141414"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px 14px", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{d.tanggal}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: d.tipe === "pemasukan" ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)", color: d.tipe === "pemasukan" ? "#4caf50" : "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 8px" }}>
                    {d.tipe === "pemasukan" ? "↑ Masuk" : "↓ Keluar"}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", color: "#aaa", fontSize: "0.8rem" }}>{d.kategori}</td>
                <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem", maxWidth: 200 }}>{d.keterangan}</td>
                <td style={{ padding: "10px 14px", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{d.metode}</td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: 600, color: d.tipe === "pemasukan" ? "#4caf50" : "#f44336" }}>
                  {d.tipe === "pemasukan" ? "+" : "-"}{fmt(d.jumlah)}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <button onClick={() => openEdit(d)} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                  <button onClick={() => setDeleteId(d.id)} style={{ background: "none", border: "none", color: "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div style={{ padding: "10px 14px", background: "#1a1a1a", borderTop: "1px solid #222", display: "flex", justifyContent: "flex-end", gap: 24 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#4caf50" }}>Masuk: {fmt(totalMasuk)}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#f44336" }}>Keluar: {fmt(totalKeluar)}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600, color: saldo >= 0 ? "#f0ede8" : "#f44336" }}>Saldo: {fmt(saldo)}</span>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 480, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e1e1e" }}>
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
                  <input style={inputStyle} type="date" value={form.tanggal} onChange={e => sf("tanggal", e.target.value)} required onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
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
                <input style={inputStyle} value={form.keterangan} onChange={e => sf("keterangan", e.target.value)} required placeholder="Deskripsi transaksi" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Jumlah (Rp) *</label>
                <input style={inputStyle} type="number" min={0} value={form.jumlah} onChange={e => sf("jumlah", e.target.value)} required placeholder="Nominal" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#141414", border: "1px solid #222", padding: 28, maxWidth: 360 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#f0ede8", marginBottom: 12 }}>Hapus Transaksi?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data transaksi ini akan dihapus permanen.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={async () => { await deleteDoc(doc(db, "keuangan", deleteId)); setDeleteId(null); fetchData(); }} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
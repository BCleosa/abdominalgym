import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

const kategoriBarang = ["Minuman", "Suplemen", "Merchandise", "Peralatan", "Lain-lain"];
const emptyForm = { nama: "", kategori: "Minuman", stok: 0, hargaBeli: "", hargaJual: "", satuan: "pcs", keterangan: "" };

export default function StokPage() {
  const [data, setData] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTrxForm, setShowTrxForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [trxForm, setTrxForm] = useState({ barangId: "", barangNama: "", tipe: "keluar", jumlah: 1, keterangan: "" });
  const [activeTab, setActiveTab] = useState("stok");

  const fetchData = async () => {
    setLoading(true);
    const [stokSnap, trxSnap] = await Promise.all([
      getDocs(collection(db, "stok")),
      getDocs(collection(db, "transaksi_stok")),
    ]);
    setData(stokSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setTransaksi(trxSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, stok: parseInt(form.stok) || 0, hargaBeli: parseFloat(form.hargaBeli) || 0, hargaJual: parseFloat(form.hargaJual) || 0 };
    if (editId) {
      await updateDoc(doc(db, "stok", editId), { ...payload, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "stok"), { ...payload, createdAt: serverTimestamp() });
    }
    setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
  };

  const handleTrxSubmit = async (e) => {
    e.preventDefault();
    const barang = data.find(d => d.id === trxForm.barangId);
    if (!barang) return;
    const jumlah = parseInt(trxForm.jumlah) || 0;
    const newStok = trxForm.tipe === "masuk" ? barang.stok + jumlah : barang.stok - jumlah;
    if (newStok < 0) { alert("Stok tidak mencukupi!"); return; }
    await updateDoc(doc(db, "stok", trxForm.barangId), { stok: newStok });
    await addDoc(collection(db, "transaksi_stok"), {
      ...trxForm, jumlah, stokSebelum: barang.stok, stokSesudah: newStok,
      tanggal: new Date().toISOString().split("T")[0], createdAt: serverTimestamp(),
    });
    setShowTrxForm(false);
    setTrxForm({ barangId: "", barangNama: "", tipe: "keluar", jumlah: 1, keterangan: "" });
    fetchData();
  };

  const openEdit = (d) => {
    setForm({ nama: d.nama, kategori: d.kategori, stok: d.stok, hargaBeli: d.hargaBeli?.toString() || "", hargaJual: d.hargaJual?.toString() || "", satuan: d.satuan || "pcs", keterangan: d.keterangan || "" });
    setEditId(d.id); setShowForm(true);
  };

  const fmt = n => "Rp " + Number(n).toLocaleString("id-ID");

  const inputStyle = { width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: 5 };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Item", val: data.length, color: "#f0ede8" },
          { label: "Stok Habis", val: data.filter(d => d.stok === 0).length, color: "#f44336" },
          { label: "Stok Menipis", val: data.filter(d => d.stok > 0 && d.stok <= 5).length, color: "#ffc107" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#141414", border: "1px solid #1e1e1e", padding: "14px 20px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: s.color }}>{s.val}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
        {[["stok", "Data Stok"], ["transaksi", "Riwayat Transaksi"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #fff" : "2px solid transparent", padding: "9px 20px", marginBottom: -1, fontFamily: "var(--font-body)", fontWeight: activeTab === id ? 600 : 400, fontSize: "0.875rem", color: activeTab === id ? "#f0ede8" : "#555", cursor: "pointer", transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "stok" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
            <button onClick={() => setShowTrxForm(true)}
              style={{ background: "rgba(91,163,217,0.15)", border: "1px solid rgba(91,163,217,0.4)", color: "#5ba3d9", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>
              ± Update Stok
            </button>
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
              style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
              + Tambah Barang
            </button>
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr>
                  {["Nama Barang", "Kategori", "Stok", "Satuan", "Harga Beli", "Harga Jual", "Aksi"].map(h => (
                    <th key={h} style={{ background: "#1a1a1a", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#333" }}>Memuat...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data stok</td></tr>
                ) : data.map(d => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                    onMouseOver={e => e.currentTarget.style.background = "#141414"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#f0ede8" }}>{d.nama}</td>
                    <td style={{ padding: "10px 14px", color: "#888" }}>{d.kategori}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: d.stok === 0 ? "#f44336" : d.stok <= 5 ? "#ffc107" : "#4caf50" }}>{d.stok}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#555", fontSize: "0.8rem" }}>{d.satuan}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{fmt(d.hargaBeli)}</td>
                    <td style={{ padding: "10px 14px", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{fmt(d.hargaJual)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <button onClick={() => openEdit(d)} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                      <button onClick={() => setDeleteId(d.id)} style={{ background: "none", border: "none", color: "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "transaksi" && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
            <thead>
              <tr>
                {["Tanggal", "Barang", "Tipe", "Jumlah", "Stok Sebelum", "Stok Sesudah", "Keterangan"].map(h => (
                  <th key={h} style={{ background: "#1a1a1a", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transaksi.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada transaksi stok</td></tr>
              ) : transaksi.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                  onMouseOver={e => e.currentTarget.style.background = "#141414"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 14px", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{t.tanggal}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#f0ede8" }}>{t.barangNama}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: t.tipe === "masuk" ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)", color: t.tipe === "masuk" ? "#4caf50" : "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 8px" }}>
                      {t.tipe === "masuk" ? "↑ Masuk" : "↓ Keluar"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "#f0ede8" }}>{t.jumlah}</td>
                  <td style={{ padding: "10px 14px", color: "#555", fontFamily: "var(--font-mono)" }}>{t.stokSebelum}</td>
                  <td style={{ padding: "10px 14px", color: "#aaa", fontFamily: "var(--font-mono)" }}>{t.stokSesudah}</td>
                  <td style={{ padding: "10px 14px", color: "#555", fontSize: "0.8rem" }}>{t.keterangan || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Barang Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 500, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e1e1e" }}>
              {editId ? "Edit Barang" : "Tambah Barang"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Nama Barang *</label><input style={inputStyle} value={form.nama} onChange={e => sf("nama", e.target.value)} required onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.kategori} onChange={e => sf("kategori", e.target.value)}>
                    {kategoriBarang.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Stok Awal</label><input style={inputStyle} type="number" min={0} value={form.stok} onChange={e => sf("stok", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
                <div><label style={labelStyle}>Satuan</label><input style={inputStyle} value={form.satuan} onChange={e => sf("satuan", e.target.value)} placeholder="pcs / botol / dus" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Harga Beli (Rp)</label><input style={inputStyle} type="number" min={0} value={form.hargaBeli} onChange={e => sf("hargaBeli", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
                <div><label style={labelStyle}>Harga Jual (Rp)</label><input style={inputStyle} type="number" min={0} value={form.hargaJual} onChange={e => sf("hargaJual", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
              </div>
              <div style={{ marginBottom: 20 }}><label style={labelStyle}>Keterangan</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.keterangan} onChange={e => sf("keterangan", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Update Stok Modal */}
      {showTrxForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTrxForm(false); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 420, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e1e1e" }}>
              Update Stok Barang
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
                  {data.map(d => <option key={d.id} value={d.id}>{d.nama} (stok: {d.stok})</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Tipe</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={trxForm.tipe} onChange={e => setTrxForm(p => ({ ...p, tipe: e.target.value }))}>
                    <option value="masuk">Stok Masuk</option>
                    <option value="keluar">Stok Keluar / Terjual</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jumlah *</label>
                  <input style={inputStyle} type="number" min={1} value={trxForm.jumlah} onChange={e => setTrxForm(p => ({ ...p, jumlah: e.target.value }))} required onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Keterangan</label>
                <input style={inputStyle} value={trxForm.keterangan} onChange={e => setTrxForm(p => ({ ...p, keterangan: e.target.value }))} placeholder="Opsional" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowTrxForm(false)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#141414", border: "1px solid #222", padding: 28, maxWidth: 360 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#f0ede8", marginBottom: 12 }}>Hapus Barang?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data barang ini akan dihapus permanen.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={async () => { await deleteDoc(doc(db, "stok", deleteId)); setDeleteId(null); fetchData(); }} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
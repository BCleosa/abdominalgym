import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

const karyawan = ["Tyo", "Osa", "Wisnu", "Lutfi", "Galang"];
const shifts = ["Shift 1 (07.00-15.00)", "Shift 2 (15.00-22.00)", "Full Day"];
const statuses = ["hadir", "izin", "sakit", "alpha"];
const statusColors = {
  hadir: { bg: "rgba(76,175,80,0.15)", color: "#4caf50" },
  izin: { bg: "rgba(91,163,217,0.15)", color: "#5ba3d9" },
  sakit: { bg: "rgba(255,193,7,0.15)", color: "#ffc107" },
  alpha: { bg: "rgba(244,67,54,0.15)", color: "#f44336" },
};
const emptyForm = { nama: "Tyo", tanggal: new Date().toISOString().split("T")[0], shift: "Shift 1 (07.00-15.00)", checkIn: "", checkOut: "", status: "hadir", keterangan: "" };

export default function AbsenPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterNama, setFilterNama] = useState("Semua");

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "absen"));
    setData(snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.tanggal?.localeCompare(a.tanggal)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateDoc(doc(db, "absen", editId), { ...form, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "absen"), { ...form, createdAt: serverTimestamp() });
    }
    setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
  };

  const openEdit = (d) => {
    setForm({ nama: d.nama, tanggal: d.tanggal, shift: d.shift, checkIn: d.checkIn || "", checkOut: d.checkOut || "", status: d.status, keterangan: d.keterangan || "" });
    setEditId(d.id); setShowForm(true);
  };

  const filtered = data.filter(d => {
    const matchTanggal = !filterTanggal || d.tanggal === filterTanggal;
    const matchNama = filterNama === "Semua" || d.nama === filterNama;
    return matchTanggal && matchNama;
  });

  // Summary hari ini
  const today = new Date().toISOString().split("T")[0];
  const todayData = data.filter(d => d.tanggal === today);

  const inputStyle = { width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: 5 };

  return (
    <div>
      {/* Summary hari ini */}
      <div style={{ background: "#141414", border: "1px solid #1e1e1e", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444" }}>Hari Ini</div>
        {statuses.map(s => {
          const sc = statusColors[s];
          const count = todayData.filter(d => d.status === s).length;
          return (
            <div key={s} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 10px", borderRadius: 2, textTransform: "capitalize" }}>{s}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: sc.color }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" }} />
          <select value={filterNama} onChange={e => setFilterNama(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none", appearance: "none" }}>
            <option>Semua</option>
            {karyawan.map(k => <option key={k}>{k}</option>)}
          </select>
          {(filterTanggal || filterNama !== "Semua") && (
            <button onClick={() => { setFilterTanggal(""); setFilterNama("Semua"); }}
              style={{ background: "none", border: "1px solid #222", color: "#555", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "8px 14px", cursor: "pointer" }}>Reset</button>
          )}
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
          + Tambah Absen
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
          <thead>
            <tr>
              {["Nama", "Tanggal", "Shift", "Check In", "Check Out", "Status", "Keterangan", "Aksi"].map(h => (
                <th key={h} style={{ background: "#1a1a1a", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#333" }}>Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data absensi</td></tr>
            ) : filtered.map(d => {
              const sc = statusColors[d.status] || statusColors.hadir;
              return (
                <tr key={d.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                  onMouseOver={e => e.currentTarget.style.background = "#141414"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#f0ede8" }}>{d.nama}</td>
                  <td style={{ padding: "10px 14px", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{d.tanggal}</td>
                  <td style={{ padding: "10px 14px", color: "#666", fontSize: "0.8rem" }}>{d.shift}</td>
                  <td style={{ padding: "10px 14px", color: "#4caf50", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{d.checkIn || "-"}</td>
                  <td style={{ padding: "10px 14px", color: "#5ba3d9", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{d.checkOut || "-"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: sc.bg, color: sc.color, fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 8px", borderRadius: 2, textTransform: "capitalize" }}>{d.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#555", fontSize: "0.8rem" }}>{d.keterangan || "-"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => openEdit(d)} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                    <button onClick={() => setDeleteId(d.id)} style={{ background: "none", border: "none", color: "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 500, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e1e1e" }}>
              {editId ? "Edit Absensi" : "Tambah Absensi"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Nama Karyawan *</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.nama} onChange={e => sf("nama", e.target.value)}>
                    {karyawan.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tanggal *</label>
                  <input style={inputStyle} type="date" value={form.tanggal} onChange={e => sf("tanggal", e.target.value)} required onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Shift</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.shift} onChange={e => sf("shift", e.target.value)}>
                    {shifts.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.status} onChange={e => sf("status", e.target.value)}>
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Check In</label>
                  <input style={inputStyle} type="time" value={form.checkIn} onChange={e => sf("checkIn", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
                <div>
                  <label style={labelStyle}>Check Out</label>
                  <input style={inputStyle} type="time" value={form.checkOut} onChange={e => sf("checkOut", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Keterangan</label>
                <input style={inputStyle} value={form.keterangan} onChange={e => sf("keterangan", e.target.value)} placeholder="Opsional" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#141414", border: "1px solid #222", padding: 28, maxWidth: 360 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#f0ede8", marginBottom: 12 }}>Hapus Data Absen?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data absensi ini akan dihapus permanen.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={async () => { await deleteDoc(doc(db, "absen", deleteId)); setDeleteId(null); fetchData(); }} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
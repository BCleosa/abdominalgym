import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

const emptyForm = { nama: "", spesialisasi: "", noHp: "", jadwal: "", catatan: "" };
const pelatihList = ["Tyo", "Elia", "Indah"];

export default function PelatihPage() {
  const [data, setData] = useState([]);
  const [sesi, setSesi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSesiForm, setShowSesiForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [sesiForm, setSesiForm] = useState({ pelatih: "Tyo", member: "", tanggal: new Date().toISOString().split("T")[0], catatan: "" });
  const [activeTab, setActiveTab] = useState("pelatih");

  const fetchData = async () => {
    setLoading(true);
    const [pelatihSnap, sesiSnap] = await Promise.all([
      getDocs(collection(db, "pelatih")),
      getDocs(collection(db, "sesi_pelatih")),
    ]);
    setData(pelatihSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setSesi(sesiSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.tanggal?.localeCompare(a.tanggal)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateDoc(doc(db, "pelatih", editId), { ...form, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "pelatih"), { ...form, createdAt: serverTimestamp() });
    }
    setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
  };

  const handleSesiSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "sesi_pelatih"), { ...sesiForm, createdAt: serverTimestamp() });
    setShowSesiForm(false);
    setSesiForm({ pelatih: "Tyo", member: "", tanggal: new Date().toISOString().split("T")[0], catatan: "" });
    fetchData();
  };

  const inputStyle = { width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: 5 };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
        {[["pelatih", "Data Pelatih"], ["sesi", "Sesi Latihan"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #fff" : "2px solid transparent", padding: "9px 20px", marginBottom: -1, fontFamily: "var(--font-body)", fontWeight: activeTab === id ? 600 : 400, fontSize: "0.875rem", color: activeTab === id ? "#f0ede8" : "#555", cursor: "pointer", transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "pelatih" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
              style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
              + Tambah Pelatih
            </button>
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr>
                  {["Nama", "Spesialisasi", "No HP", "Jadwal", "Aksi"].map(h => (
                    <th key={h} style={{ background: "#1a1a1a", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#333" }}>Memuat...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data pelatih</td></tr>
                ) : data.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                    onMouseOver={e => e.currentTarget.style.background = "#141414"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#f0ede8" }}>{p.nama}</td>
                    <td style={{ padding: "10px 14px", color: "#888" }}>{p.spesialisasi}</td>
                    <td style={{ padding: "10px 14px", color: "#888" }}>{p.noHp}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{p.jadwal}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <button onClick={() => { setForm({ nama: p.nama, spesialisasi: p.spesialisasi, noHp: p.noHp, jadwal: p.jadwal, catatan: p.catatan || "" }); setEditId(p.id); setShowForm(true); }} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                      <button onClick={() => setDeleteId(p.id)} style={{ background: "none", border: "none", color: "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "sesi" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={() => setShowSesiForm(true)}
              style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
              + Catat Sesi Latihan
            </button>
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr>
                  {["Tanggal", "Pelatih", "Member", "Catatan", "Aksi"].map(h => (
                    <th key={h} style={{ background: "#1a1a1a", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#333" }}>Memuat...</td></tr>
                ) : sesi.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada sesi latihan</td></tr>
                ) : sesi.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                    onMouseOver={e => e.currentTarget.style.background = "#141414"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 14px", color: "#888" }}>{s.tanggal}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#f0ede8" }}>{s.pelatih}</td>
                    <td style={{ padding: "10px 14px", color: "#aaa" }}>{s.member}</td>
                    <td style={{ padding: "10px 14px", color: "#555", fontSize: "0.8rem" }}>{s.catatan || "-"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <button onClick={async () => { await deleteDoc(doc(db, "sesi_pelatih", s.id)); fetchData(); }} style={{ background: "none", border: "none", color: "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Pelatih Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 480, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e1e1e" }}>
              {editId ? "Edit Pelatih" : "Tambah Pelatih"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><label style={labelStyle}>Nama *</label><input style={inputStyle} value={form.nama} onChange={e => sf("nama", e.target.value)} required onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
                <div><label style={labelStyle}>No HP</label><input style={inputStyle} value={form.noHp} onChange={e => sf("noHp", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Spesialisasi</label><input style={inputStyle} value={form.spesialisasi} onChange={e => sf("spesialisasi", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Jadwal</label><input style={inputStyle} value={form.jadwal} onChange={e => sf("jadwal", e.target.value)} placeholder="misal: Senin-Sabtu" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
              <div style={{ marginBottom: 20 }}><label style={labelStyle}>Catatan</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.catatan} onChange={e => sf("catatan", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Sesi Modal */}
      {showSesiForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowSesiForm(false); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 440, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e1e1e" }}>Catat Sesi Latihan</div>
            <form onSubmit={handleSesiSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Pelatih *</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={sesiForm.pelatih} onChange={e => setSesiForm(p => ({ ...p, pelatih: e.target.value }))}>
                    {pelatihList.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tanggal *</label>
                  <input style={inputStyle} type="date" value={sesiForm.tanggal} onChange={e => setSesiForm(p => ({ ...p, tanggal: e.target.value }))} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nama Member *</label>
                <input style={inputStyle} value={sesiForm.member} onChange={e => setSesiForm(p => ({ ...p, member: e.target.value }))} required placeholder="Nama member yang dilatih" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Catatan</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={sesiForm.catatan} onChange={e => setSesiForm(p => ({ ...p, catatan: e.target.value }))} placeholder="Program latihan, progress, dll" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowSesiForm(false)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
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
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#f0ede8", marginBottom: 12 }}>Hapus Pelatih?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data pelatih ini akan dihapus permanen.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={async () => { await deleteDoc(doc(db, "pelatih", deleteId)); setDeleteId(null); fetchData(); }} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
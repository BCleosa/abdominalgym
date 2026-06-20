import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";

const emptyForm = { nama: "", noHp: "", jenisKelamin: "Laki-laki", paket: "Monthly", tanggalMulai: "", tanggalAkhir: "", status: "aktif", catatan: "" };
const pakets = ["Monthly (Rp 160.000)", "Silver 3 Bulan (Rp 420.000)", "Gold 6 Bulan (Rp 730.000)", "Platinum 12 Bulan (Rp 1.240.000)"];

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "members"));
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateDoc(doc(db, "members", editId), { ...form, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "members"), { ...form, createdAt: serverTimestamp() });
    }
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    fetchMembers();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "members", deleteId));
    setDeleteId(null);
    fetchMembers();
  };

  const openEdit = (m) => { setForm({ nama: m.nama, noHp: m.noHp, jenisKelamin: m.jenisKelamin, paket: m.paket, tanggalMulai: m.tanggalMulai, tanggalAkhir: m.tanggalAkhir, status: m.status, catatan: m.catatan || "" }); setEditId(m.id); setShowForm(true); };

  const filtered = members.filter(m => m.nama?.toLowerCase().includes(search.toLowerCase()) || m.noHp?.includes(search));

  const inputStyle = { width: "100%", background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: 5 };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Member", val: members.length, color: "#f0ede8" },
          { label: "Aktif", val: members.filter(m => m.status === "aktif").length, color: "#4caf50" },
          { label: "Tidak Aktif", val: members.filter(m => m.status !== "aktif").length, color: "#f44336" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: s.color === "#f0ede8" ? "#1a1a1a" : s.color }}>{s.val}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari nama / no HP..."
          style={{ ...inputStyle, width: 240 }}
          onFocus={e => e.target.style.borderColor = "#555"}
          onBlur={e => e.target.style.borderColor = "#222"}
        />
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
          + Tambah Member
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#444", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Memuat data...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
            <thead>
              <tr>
                {["#", "Nama", "No HP", "Paket", "Tgl Mulai", "Tgl Akhir", "Status", "Aksi"].map(h => (
                  <th key={h} style={{ background: "#e8e8e8", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Tidak ada data</td></tr>
              ) : filtered.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                  onMouseOver={e => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 14px", color: "#333" }}>{i + 1}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{m.nama}</div>
                    <div style={{ fontSize: "0.75rem", color: "#444" }}>{m.jenisKelamin}</div>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#888" }}>{m.noHp}</td>
                  <td style={{ padding: "10px 14px", color: "#aaa", fontSize: "0.8rem" }}>{m.paket}</td>
                  <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{m.tanggalMulai}</td>
                  <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{m.tanggalAkhir}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: m.status === "aktif" ? "#e8f5e9" : "#ffebee", color: m.status === "aktif" ? "#2e7d32" : "#c62828", fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "3px 10px", borderRadius: 20, fontWeight: 600, border: `1px solid ${m.status === "aktif" ? "#a5d6a7" : "#ef9a9a"}` }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => setShowQR(m)} style={{ background: "none", border: "none", color: "#5ba3d9", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>QR</button>
                    <button onClick={() => openEdit(m)} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                    <button onClick={() => setDeleteId(m.id)} style={{ background: "none", border: "none", color: "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e1e1e" }}>
              {editId ? "Edit Member" : "Tambah Member Baru"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Nama Lengkap *</label>
                  <input style={inputStyle} value={form.nama} onChange={e => sf("nama", e.target.value)} required placeholder="Nama member" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
                <div>
                  <label style={labelStyle}>No HP / WA *</label>
                  <input style={inputStyle} value={form.noHp} onChange={e => sf("noHp", e.target.value)} required placeholder="08xx-xxxx-xxxx" onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Jenis Kelamin</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.jenisKelamin} onChange={e => sf("jenisKelamin", e.target.value)}>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Paket *</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.paket} onChange={e => sf("paket", e.target.value)}>
                    {pakets.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Tanggal Mulai</label>
                  <input style={inputStyle} type="date" value={form.tanggalMulai} onChange={e => sf("tanggalMulai", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal Akhir</label>
                  <input style={inputStyle} type="date" value={form.tanggalAkhir} onChange={e => sf("tanggalAkhir", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Status</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={form.status} onChange={e => sf("status", e.target.value)}>
                  <option value="aktif">Aktif</option>
                  <option value="tidak aktif">Tidak Aktif</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Catatan</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.catatan} onChange={e => sf("catatan", e.target.value)} placeholder="Opsional..." onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>
                  {editId ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowQR(null); }}>
          <div style={{ background: "#141414", border: "1px solid #222", padding: 32, textAlign: "center", maxWidth: 320 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#f0ede8", marginBottom: 4 }}>{showQR.nama}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#444", marginBottom: 20 }}>{showQR.noHp} · {showQR.paket}</div>
            <div style={{ background: "#fff", padding: 16, display: "inline-block", marginBottom: 16 }}>
              <QRCodeSVG value={showQR.id} size={180} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#333", marginBottom: 16 }}>ID: {showQR.id}</div>
            <button onClick={() => setShowQR(null)} style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 24px", cursor: "pointer" }}>Tutup</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#141414", border: "1px solid #222", padding: 28, maxWidth: 360 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#f0ede8", marginBottom: 12 }}>Hapus Member?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data member ini akan dihapus permanen dari database.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={handleDelete} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
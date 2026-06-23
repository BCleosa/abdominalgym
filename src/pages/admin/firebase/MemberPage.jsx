import { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import { exportToExcel } from "../../../utils/exportExcel";
import { QRCodeSVG } from "qrcode.react";

const emptyForm = { nama: "", noHp: "", jenisKelamin: "Laki-laki", paket: "Monthly", tanggalMulai: "", tanggalAkhir: "", status: "aktif", catatan: "" };
const pakets = ["Monthly (Rp 160.000)", "Silver 3 Bulan (Rp 420.000)", "Gold 6 Bulan (Rp 730.000)", "Platinum 12 Bulan (Rp 1.240.000)"];

// Deteksi durasi paket dari nama labelnya (cocok untuk format manual admin maupun dari pendaftaran online,
// karena keduanya selalu mengandung salah satu kata kunci ini).
function getDurasiPaket(paketStr) {
  const s = (paketStr || "").toLowerCase();
  if (s.includes("insidentil")) return { hari: 1 };
  if (s.includes("silver")) return { bulan: 3 };
  if (s.includes("gold")) return { bulan: 6 };
  if (s.includes("platinum")) return { bulan: 12 };
  return { bulan: 1 }; // default: Monthly / gak dikenali
}

function tambahDurasi(tanggalStr, durasi) {
  if (!tanggalStr) return "";
  const d = new Date(tanggalStr);
  if (isNaN(d.getTime())) return "";
  if (durasi.hari) d.setDate(d.getDate() + durasi.hari);
  if (durasi.bulan) d.setMonth(d.getMonth() + durasi.bulan);
  return d.toISOString().split("T")[0];
}

const todayStr = new Date().toISOString().split("T")[0];

export default function MemberPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterAwal, setFilterAwal] = useState("");
  const [filterAkhir, setFilterAkhir] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [perpanjangMember, setPerpanjangMember] = useState(null);
  const [perpanjangPaket, setPerpanjangPaket] = useState(pakets[0]);
  const [perpanjangLoading, setPerpanjangLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await api.get("/member");
      setMembers(data);
    } catch (err) {
      alert("Gagal memuat data member: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Status efektif: kalau status-nya masih aktif/pending tapi tanggal akhirnya udah lewat,
  // dianggap "tidak aktif" di tampilan (database-nya gak diubah otomatis, murni biar tampilannya akurat).
  const getEffectiveStatus = (m) => {
    if ((m.status === "aktif" || m.status === "pending") && m.tanggalAkhir && m.tanggalAkhir < todayStr) {
      return "tidak aktif";
    }
    return m.status;
  };

  const openPerpanjang = (m) => { setPerpanjangMember(m); setPerpanjangPaket(pakets[0]); };

  const handlePerpanjangSubmit = async (e) => {
    e.preventDefault();
    setPerpanjangLoading(true);
    try {
      const tanggalMulai = todayStr;
      const tanggalAkhir = tambahDurasi(tanggalMulai, getDurasiPaket(perpanjangPaket));
      await api.put(`/member/${perpanjangMember.id}`, {
        ...perpanjangMember,
        paket: perpanjangPaket,
        tanggalMulai,
        tanggalAkhir,
        status: "aktif",
      });
      setPerpanjangMember(null);
      fetchMembers();
    } catch (err) {
      alert("Gagal memperpanjang member: " + err.message);
    }
    setPerpanjangLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/member/${editId}`, form);
      } else {
        await api.post("/member", form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchMembers();
    } catch (err) {
      alert("Gagal menyimpan member: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/member/${deleteId}`);
      setDeleteId(null);
      fetchMembers();
    } catch (err) {
      alert("Gagal menghapus member: " + err.message);
    }
  };

  const openEdit = (m) => { setForm({ nama: m.nama, noHp: m.noHp, jenisKelamin: m.jenisKelamin, paket: m.paket, tanggalMulai: m.tanggalMulai, tanggalAkhir: m.tanggalAkhir, status: m.status, catatan: m.catatan || "" }); setEditId(m.id); setShowForm(true); };

  const filtered = members.filter(m => {
    const matchSearch = m.nama?.toLowerCase().includes(search.toLowerCase()) || m.noHp?.includes(search);
    const matchAwal = !filterAwal || m.tanggalMulai >= filterAwal;
    const matchAkhir = !filterAkhir || m.tanggalMulai <= filterAkhir;
    return matchSearch && matchAwal && matchAkhir;
  });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(m => m.id)));
  };

  const handleExport = () => {
    const source = selected.size > 0 ? filtered.filter(m => selected.has(m.id)) : filtered;
    const rows = source.map(m => ({
      "Nama": m.nama,
      "No HP": m.noHp,
      "Jenis Kelamin": m.jenisKelamin,
      "Paket": m.paket,
      "Tanggal Mulai": m.tanggalMulai,
      "Tanggal Akhir": m.tanggalAkhir,
      "Status": m.status,
      "Catatan": m.catatan || "",
    }));
    exportToExcel(rows, "Data_Member", "Member");
  };

  const inputStyle = { width: "100%", background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: 5 };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Member", val: members.length, color: "#f0ede8" },
          { label: "Aktif", val: members.filter(m => getEffectiveStatus(m) === "aktif").length, color: "#4caf50" },
          { label: "Pending", val: members.filter(m => getEffectiveStatus(m) === "pending").length, color: "#f57f17" },
          { label: "Tidak Aktif", val: members.filter(m => getEffectiveStatus(m) !== "aktif" && getEffectiveStatus(m) !== "pending").length, color: "#f44336" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: s.color === "#f0ede8" ? "#1a1a1a" : s.color }}>{s.val}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari nama / no HP..."
            style={{ ...inputStyle, width: 220 }}
            onFocus={e => e.target.style.borderColor = "#aaa"}
            onBlur={e => e.target.style.borderColor = "#ddd"}
          />
          <span style={{ color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Tgl Mulai</span>
          <input type="date" value={filterAwal} onChange={e => setFilterAwal(e.target.value)}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" }} />
          <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>s/d</span>
          <input type="date" value={filterAkhir} onChange={e => setFilterAkhir(e.target.value)}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" }} />
          {(filterAwal || filterAkhir) && (
            <button onClick={() => { setFilterAwal(""); setFilterAkhir(""); }}
              style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "8px 14px", cursor: "pointer" }}>Reset</button>
          )}
          {selected.size > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#1565c0" }}>{selected.size} dipilih</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleExport}
            style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "9px 16px", cursor: "pointer" }}>
            Export Excel
          </button>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
            + Tambah Member
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#444", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Memuat data...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
            <thead>
              <tr>
                <th style={{ background: "#e8e8e8", padding: "10px 14px", width: 36, borderBottom: "1px solid #f0ede8" }}>
                  <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleSelectAll} />
                </th>
                {["#", "Nama", "No HP", "Paket", "Tgl Mulai", "Tgl Akhir", "Status", "Aksi"].map(h => (
                  <th key={h} style={{ background: "#e8e8e8", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Tidak ada data</td></tr>
              ) : filtered.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #1a1a1a", background: selected.has(m.id) ? "#f5faff" : "transparent" }}
                  onMouseOver={e => e.currentTarget.style.background = selected.has(m.id) ? "#eef6ff" : "#f5f5f5"}
                  onMouseOut={e => e.currentTarget.style.background = selected.has(m.id) ? "#f5faff" : "transparent"}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} />
                  </td>
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
                    {(() => {
                      const eff = getEffectiveStatus(m);
                      return (
                        <span style={{
                          background: eff === "aktif" ? "#e8f5e9" : eff === "pending" ? "#fff8e1" : "#ffebee",
                          color: eff === "aktif" ? "#2e7d32" : eff === "pending" ? "#f57f17" : "#c62828",
                          fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                          border: `1px solid ${eff === "aktif" ? "#a5d6a7" : eff === "pending" ? "#ffe082" : "#ef9a9a"}`
                        }}>
                          {eff}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => setShowQR(m)} style={{ background: "none", border: "none", color: "#5ba3d9", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>QR</button>
                    <button onClick={() => openEdit(m)} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                    {getEffectiveStatus(m) !== "aktif" && (
                      <button onClick={() => openPerpanjang(m)} style={{ background: "none", border: "none", color: "#2e7d32", fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer", padding: "2px 6px" }}>Perpanjang</button>
                    )}
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
                  <select style={{ ...inputStyle, appearance: "none" }} value={form.paket}
                    onChange={e => setForm(p => ({ ...p, paket: e.target.value, tanggalAkhir: p.tanggalMulai ? tambahDurasi(p.tanggalMulai, getDurasiPaket(e.target.value)) : p.tanggalAkhir }))}>
                    {pakets.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Tanggal Mulai</label>
                  <input style={inputStyle} type="date" value={form.tanggalMulai}
                    onChange={e => setForm(p => ({ ...p, tanggalMulai: e.target.value, tanggalAkhir: tambahDurasi(e.target.value, getDurasiPaket(p.paket)) }))}
                    onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal Akhir</label>
                  <input style={inputStyle} type="date" value={form.tanggalAkhir} onChange={e => sf("tanggalAkhir", e.target.value)} onFocus={e => e.target.style.borderColor="#555"} onBlur={e => e.target.style.borderColor="#222"} />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#444", marginTop: 4 }}>Otomatis terisi sesuai Tanggal Mulai + durasi paket, tapi bisa diubah manual.</p>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Status</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={form.status} onChange={e => sf("status", e.target.value)}>
                  <option value="aktif">Aktif</option>
                  <option value="pending">Pending</option>
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

      {/* Perpanjang Modal */}
      {perpanjangMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setPerpanjangMember(null); }}>
          <div style={{ background: "#141414", border: "1px solid #222", width: "100%", maxWidth: 420, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 4 }}>Perpanjang / Tambah Langganan</div>
            <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: 20 }}>{perpanjangMember.nama}</p>
            <form onSubmit={handlePerpanjangSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Pilih Paket</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={perpanjangPaket} onChange={e => setPerpanjangPaket(e.target.value)}>
                  {pakets.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
                Tanggal mulai otomatis hari ini ({todayStr}), tanggal akhir otomatis dihitung sesuai durasi paket, status langsung jadi <strong style={{ color: "#4caf50" }}>aktif</strong>.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setPerpanjangMember(null)} style={{ background: "none", border: "1px solid #222", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={perpanjangLoading} style={{ background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: perpanjangLoading ? "default" : "pointer", opacity: perpanjangLoading ? 0.6 : 1 }}>
                  {perpanjangLoading ? "Memproses..." : "Konfirmasi Perpanjang"}
                </button>
              </div>
            </form>
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
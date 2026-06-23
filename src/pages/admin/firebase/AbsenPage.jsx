import { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import { exportToExcel } from "../../../utils/exportExcel";

const karyawan = ["Tyo", "Osa", "Wisnu", "Lutfi", "Galang"];
const shifts = ["Shift 1 (07.00-15.00)", "Shift 2 (15.00-22.00)", "Full Day"];
const statuses = ["hadir", "izin", "sakit", "alpha"];
const statusColors = {
  hadir: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  izin: { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  sakit: { bg: "#fff8e1", color: "#f57f17", border: "#ffe082" },
  alpha: { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" },
};
const emptyForm = { nama: "Tyo", tanggal: new Date().toISOString().split("T")[0], shift: "Shift 1 (07.00-15.00)", status: "hadir", keterangan: "" };

export default function AbsenPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterAwal, setFilterAwal] = useState("");
  const [filterAkhir, setFilterAkhir] = useState("");
  const [filterNama, setFilterNama] = useState("Semua");
  const [selected, setSelected] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.get("/absen");
      setData(result);
    } catch (err) {
      alert("Gagal memuat data absen: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/absen/${editId}`, form);
      } else {
        await api.post("/absen", form);
      }
      setShowForm(false); setEditId(null); setForm(emptyForm); fetchData();
    } catch (err) {
      alert("Gagal menyimpan absen: " + err.message);
    }
  };

  const openEdit = (d) => {
    setForm({ nama: d.nama, tanggal: d.tanggal, shift: d.shift, status: d.status, keterangan: d.keterangan || "" });
    setEditId(d.id); setShowForm(true);
  };

  const filtered = data.filter(d => {
    const matchAwal = !filterAwal || d.tanggal >= filterAwal;
    const matchAkhir = !filterAkhir || d.tanggal <= filterAkhir;
    const matchNama = filterNama === "Semua" || d.nama === filterNama;
    return matchAwal && matchAkhir && matchNama;
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
      "Nama Karyawan": d.nama,
      "Tanggal": d.tanggal,
      "Shift": d.shift,
      "Status": d.status,
      "Keterangan": d.keterangan || "",
    }));
    exportToExcel(rows, "Absen_Karyawan", "Absen");
  };

  // Summary hari ini
  const today = new Date().toISOString().split("T")[0];
  const todayData = data.filter(d => d.tanggal === today);

  // Distribusi kehadiran per karyawan (mengikuti filter tanggal, lepas dari filter nama)
  const hadirInRange = data.filter(d =>
    d.status === "hadir" &&
    (!filterAwal || d.tanggal >= filterAwal) &&
    (!filterAkhir || d.tanggal <= filterAkhir)
  );
  const totalHadir = hadirInRange.length;
  const distribusi = karyawan.map(k => {
    const count = hadirInRange.filter(d => d.nama === k).length;
    const persen = totalHadir > 0 ? (count / totalHadir) * 100 : 0;
    return { nama: k, count, persen };
  });

  const inputStyle = { width: "100%", background: "#f5f5f5", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 5 };

  return (
    <div>
      {/* Summary hari ini */}
      <div style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Hari Ini</div>
        {statuses.map(s => {
          const sc = statusColors[s];
          const count = todayData.filter(d => d.status === s).length;
          return (
            <div key={s} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 10px", borderRadius: 2, textTransform: "capitalize" }}>{s}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a" }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Distribusi kehadiran per karyawan */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>
            Distribusi Kehadiran {(filterAwal || filterAkhir) ? "(sesuai rentang tanggal dipilih)" : "(semua waktu)"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#aaa" }}>Total hadir: {totalHadir}</div>
        </div>
        {totalHadir === 0 ? (
          <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>Belum ada data kehadiran pada rentang ini.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {distribusi.map(d => (
              <div key={d.nama} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 70, fontWeight: 600, color: "#1a1a1a", fontSize: "0.825rem", flexShrink: 0 }}>{d.nama}</div>
                <div style={{ flex: 1, background: "#f0f0f0", height: 18, position: "relative", overflow: "hidden" }}>
                  <div style={{ width: `${d.persen}%`, height: "100%", background: "#1a1a1a", transition: "width 0.3s" }} />
                </div>
                <div style={{ width: 110, textAlign: "right", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#666" }}>
                  {d.count}x · {d.persen.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" value={filterAwal} onChange={e => setFilterAwal(e.target.value)}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" }} />
          <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>s/d</span>
          <input type="date" value={filterAkhir} onChange={e => setFilterAkhir(e.target.value)}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none" }} />
          <select value={filterNama} onChange={e => setFilterNama(e.target.value)}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none", appearance: "none" }}>
            <option>Semua</option>
            {karyawan.map(k => <option key={k}>{k}</option>)}
          </select>
          {(filterAwal || filterAkhir || filterNama !== "Semua") && (
            <button onClick={() => { setFilterAwal(""); setFilterAkhir(""); setFilterNama("Semua"); }}
              style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "8px 14px", cursor: "pointer" }}>Reset</button>
          )}
          <button onClick={handleExport}
            style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "9px 16px", cursor: "pointer" }}>
            Export Excel
          </button>
          {selected.size > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#1565c0" }}>{selected.size} dipilih</span>
          )}
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>
          + Tambah Absen
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
          <thead>
            <tr>
              <th style={{ background: "#f5f5f5", padding: "10px 14px", width: 36, borderBottom: "1px solid #1a1a1a" }}>
                <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleSelectAll} />
              </th>
              {["Nama", "Tanggal", "Shift", "Status", "Keterangan", "Aksi"].map(h => (
                <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data absensi</td></tr>
            ) : filtered.map(d => {
              const sc = statusColors[d.status] || statusColors.hadir;
              return (
                <tr key={d.id} style={{ borderBottom: "1px solid #f0f0f0", background: selected.has(d.id) ? "#f5faff" : "transparent" }}
                  onMouseOver={e => e.currentTarget.style.background = selected.has(d.id) ? "#eef6ff" : "#fafafa"}
                  onMouseOut={e => e.currentTarget.style.background = selected.has(d.id) ? "#f5faff" : "transparent"}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)} />
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a" }}>{d.nama}</td>
                  <td style={{ padding: "10px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{d.tanggal}</td>
                  <td style={{ padding: "10px 14px", color: "#555", fontSize: "0.8rem" }}>{d.shift}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 8px", borderRadius: 2, textTransform: "capitalize" }}>{d.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{d.keterangan || "-"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => openEdit(d)} style={{ background: "none", border: "none", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Edit</button>
                    <button onClick={() => setDeleteId(d.id)} style={{ background: "none", border: "none", color: "#c62828", fontFamily: "var(--font-mono)", fontSize: "0.65rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 500, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e0e0e0" }}>
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
                  <input style={inputStyle} type="date" value={form.tanggal} onChange={e => sf("tanggal", e.target.value)} required onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
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
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Keterangan</label>
                <input style={inputStyle} value={form.keterangan} onChange={e => sf("keterangan", e.target.value)} placeholder="Opsional" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 28, maxWidth: 360 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#1a1a1a", marginBottom: 12 }}>Hapus Data Absen?</div>
            <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: 20, fontWeight: 300 }}>Data absensi ini akan dihapus permanen.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
              <button onClick={async () => { try { await api.delete(`/absen/${deleteId}`); setDeleteId(null); fetchData(); } catch (err) { alert("Gagal menghapus absen: " + err.message); } }} style={{ background: "#c0392b", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
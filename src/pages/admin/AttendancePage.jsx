import { useState } from "react";
import { initialAttendances } from "../../data/initialData";
import { SearchBar, Modal, ConfirmModal, EmptyState, FormActions } from "./CrudComponents";

const STORAGE_KEY = "gym_attendance";
const shifts = ["Shift 1 (07:00-15:00)","Shift 2 (15:00-22:00)","Full Day"];
const emptyForm = {
  employeeId: "", name: "", role: "Trainer",
  date: new Date().toISOString().split("T")[0],
  checkIn: "", checkOut: "", status: "hadir", notes: ""
};
const roles = ["Trainer","Trainer / Karyawan","Karyawan","Manager"];
const statuses = ["hadir","izin","sakit","alpha"];

const statusColors = {
  hadir: { bg: "#1a3a1a", text: "#4caf50" },
  izin:  { bg: "#1a2a3a", text: "#5ba3d9" },
  sakit: { bg: "#3a3a1a", text: "#ffc107" },
  alpha: { bg: "#3a1a1a", text: "#f44336" },
};

export default function AttendancePage() {
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialAttendances; } catch { return initialAttendances; }
  });
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const save = (data) => { setRecords(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };
  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (r) => { setForm({...r}); setEditId(r.id); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      save(records.map(r => r.id === editId ? { ...form, id: editId } : r));
    } else {
      save([...records, { ...form, id: Math.max(0, ...records.map(r => r.id)) + 1 }]);
    }
    setShowModal(false);
  };

  const filtered = records.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDate = !filterDate || r.date === filterDate;
    const matchStatus = filterStatus === "Semua" || r.status === filterStatus;
    return matchSearch && matchDate && matchStatus;
  });

  // Summary stats for filtered/today
  const today = new Date().toISOString().split("T")[0];
  const todayRecs = records.filter(r => r.date === today);
  const summaryRecs = todayRecs.length > 0 ? todayRecs : records;

  const f = form;
  const sf = (k, v) => setForm(p => ({...p, [k]: v}));

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {statuses.map(s => {
          const sc = statusColors[s];
          const count = summaryRecs.filter(r => r.status === s).length;
          return (
            <div key={s} style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", padding: "12px 20px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 800, fontSize: "1.3rem", color: sc.text }}>{count}</span>
              <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "capitalize", color: "var(--gray-mid)" }}>{s}</span>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Cari karyawan..." />
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", color: "var(--white)", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", color: "var(--white)", fontFamily: "var(--font-condensed)", fontSize: "0.8rem", padding: "9px 14px", outline: "none" }}>
            <option>Semua</option>
            {statuses.map(s => <option key={s} style={{ textTransform: "capitalize" }}>{s}</option>)}
          </select>
          {filterDate && (
            <button onClick={() => setFilterDate("")}
              style={{ background: "none", border: "1px solid var(--gray-dark)", color: "var(--gray-mid)", fontFamily: "var(--font-condensed)", fontSize: "0.75rem", padding: "9px 12px", cursor: "pointer" }}>
              Reset
            </button>
          )}
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ fontSize: "0.8rem", padding: "10px 20px" }}>+ Tambah Absen</button>
      </div>

      {/* Table */}
      <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", overflow: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Karyawan</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Tanggal</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><EmptyState message="Tidak ada data absensi ditemukan" /></td></tr>
            ) : filtered.map((r) => {
              const sc = statusColors[r.status] || statusColors["hadir"];
              return (
                <tr key={r.id}>
                  <td style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, color: "var(--accent)", fontSize: "0.8rem" }}>{r.employeeId}</td>
                  <td style={{ fontWeight: 600, color: "var(--white)" }}>{r.name}</td>
                  <td style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: "var(--gray-light)" }}>{r.role}</td>
                  <td style={{ fontFamily: "var(--font-condensed)", fontSize: "0.85rem" }}>{r.date}</td>
                  <td style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.9rem", color: r.checkIn === "-" ? "var(--gray-mid)" : "#4caf50" }}>{r.checkIn || "-"}</td>
                  <td style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.9rem", color: r.checkOut === "-" ? "var(--gray-mid)" : "#5ba3d9" }}>{r.checkOut || "-"}</td>
                  <td>
                    <span style={{ background: sc.bg, color: sc.text, fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2 }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.825rem", color: "var(--gray-mid)" }}>{r.notes || "-"}</td>
                  <td>
                    <button className="action-btn action-btn-edit" onClick={() => openEdit(r)}>Edit</button>
                    <button className="action-btn action-btn-delete" onClick={() => { setDeleteId(r.id); setShowConfirm(true); }}>Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? "Edit Absensi" : "Tambah Data Absensi"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">ID Karyawan *</label>
                <input className="form-input" value={f.employeeId} onChange={e => sf("employeeId", e.target.value)} required placeholder="misal: EMP001" />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Karyawan *</label>
                <input className="form-input" value={f.name} onChange={e => sf("name", e.target.value)} required placeholder="Nama lengkap" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Jabatan</label>
                <select className="form-select" value={f.role} onChange={e => sf("role", e.target.value)}>
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal *</label>
                <input className="form-input" type="date" value={f.date} onChange={e => sf("date", e.target.value)} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Jam Check In</label>
                <input className="form-input" type="time" value={f.checkIn} onChange={e => sf("checkIn", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Jam Check Out</label>
                <input className="form-input" type="time" value={f.checkOut} onChange={e => sf("checkOut", e.target.value)} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select className="form-select" value={f.status} onChange={e => sf("status", e.target.value)}>
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Keterangan</label>
                <input className="form-input" value={f.notes} onChange={e => sf("notes", e.target.value)} placeholder="Opsional" />
              </div>
            </div>
            <FormActions onCancel={() => setShowModal(false)} submitLabel={editId ? "Simpan Perubahan" : "Tambah Absensi"} />
          </form>
        </Modal>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Yakin ingin menghapus data absensi ini?"
          onConfirm={() => { save(records.filter(r => r.id !== deleteId)); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

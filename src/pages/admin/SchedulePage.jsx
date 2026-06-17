import { useState } from "react";
import { initialSchedules } from "../../data/initialData";
import { SearchBar, Modal, ConfirmModal, EmptyState, FormActions } from "./CrudComponents";

const STORAGE_KEY = "gym_schedules";
const emptyForm = { className: "", trainer: "", day: "Senin", time: "", capacity: 20, enrolled: 0, room: "", level: "All Level" };
const days = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
const levels = ["All Level","Beginner","Intermediate","Advanced"];

const levelColors = { "All Level": { bg: "#1a2a3a", text: "#5ba3d9" }, "Beginner": { bg: "#1a3a1a", text: "#4caf50" }, "Intermediate": { bg: "#3a2a1a", text: "#ff9800" }, "Advanced": { bg: "#3a1a1a", text: "#f44336" } };

export default function SchedulePage() {
  const [schedules, setSchedules] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialSchedules; } catch { return initialSchedules; }
  });
  const [search, setSearch] = useState("");
  const [filterDay, setFilterDay] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const save = (data) => { setSchedules(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };
  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (s) => { setForm({...s}); setEditId(s.id); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      save(schedules.map(s => s.id === editId ? { ...form, id: editId } : s));
    } else {
      save([...schedules, { ...form, id: Math.max(0, ...schedules.map(s => s.id)) + 1 }]);
    }
    setShowModal(false);
  };

  const filtered = schedules.filter(s => {
    const matchSearch = s.className.toLowerCase().includes(search.toLowerCase()) || s.trainer.toLowerCase().includes(search.toLowerCase());
    const matchDay = filterDay === "Semua" || s.day === filterDay;
    return matchSearch && matchDay;
  });

  const f = form;
  const sf = (k, v) => setForm(p => ({...p, [k]: v}));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Cari kelas..." />
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)}
            style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", color: "var(--white)", fontFamily: "var(--font-condensed)", fontSize: "0.8rem", padding: "9px 14px", outline: "none" }}>
            <option>Semua</option>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ fontSize: "0.8rem", padding: "10px 20px" }}>+ Tambah Jadwal</button>
      </div>

      <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", overflow: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Kelas</th>
              <th>Pelatih</th>
              <th>Hari</th>
              <th>Waktu</th>
              <th>Ruangan</th>
              <th>Level</th>
              <th>Kapasitas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><EmptyState message="Tidak ada jadwal ditemukan" /></td></tr>
            ) : filtered.map((s, i) => {
              const lc = levelColors[s.level] || levelColors["All Level"];
              const pct = Math.round((s.enrolled / s.capacity) * 100);
              return (
                <tr key={s.id}>
                  <td style={{ color: "var(--gray-mid)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--white)" }}>{s.className}</td>
                  <td style={{ color: "var(--gray-light)" }}>{s.trainer}</td>
                  <td style={{ color: "var(--accent)", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>{s.day}</td>
                  <td style={{ fontFamily: "var(--font-condensed)", fontSize: "0.85rem" }}>{s.time}</td>
                  <td style={{ fontSize: "0.825rem" }}>{s.room}</td>
                  <td><span style={{ background: lc.bg, color: lc.text, fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", padding: "3px 8px" }}>{s.level}</span></td>
                  <td>
                    <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: pct >= 90 ? "#f44336" : "var(--gray-light)" }}>{s.enrolled}/{s.capacity}</div>
                    <div style={{ height: 3, background: "var(--gray-dark)", marginTop: 4, borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 90 ? "#f44336" : "var(--accent)", borderRadius: 2 }} />
                    </div>
                  </td>
                  <td>
                    <button className="action-btn action-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                    <button className="action-btn action-btn-delete" onClick={() => { setDeleteId(s.id); setShowConfirm(true); }}>Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editId ? "Edit Jadwal" : "Tambah Jadwal Baru"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nama Kelas *</label>
                <input className="form-input" value={f.className} onChange={e => sf("className", e.target.value)} required placeholder="misal: HIIT Blast" />
              </div>
              <div className="form-group">
                <label className="form-label">Pelatih *</label>
                <input className="form-input" value={f.trainer} onChange={e => sf("trainer", e.target.value)} required placeholder="Nama pelatih" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Hari *</label>
                <select className="form-select" value={f.day} onChange={e => sf("day", e.target.value)}>
                  {days.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Waktu *</label>
                <input className="form-input" value={f.time} onChange={e => sf("time", e.target.value)} required placeholder="misal: 07:00 - 08:00" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Ruangan</label>
                <input className="form-input" value={f.room} onChange={e => sf("room", e.target.value)} placeholder="misal: Ruang Yoga" />
              </div>
              <div className="form-group">
                <label className="form-label">Level</label>
                <select className="form-select" value={f.level} onChange={e => sf("level", e.target.value)}>
                  {levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Kapasitas</label>
                <input className="form-input" type="number" min={1} value={f.capacity} onChange={e => sf("capacity", parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Terdaftar</label>
                <input className="form-input" type="number" min={0} value={f.enrolled} onChange={e => sf("enrolled", parseInt(e.target.value))} />
              </div>
            </div>
            <FormActions onCancel={() => setShowModal(false)} submitLabel={editId ? "Simpan Perubahan" : "Tambah Jadwal"} />
          </form>
        </Modal>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Yakin ingin menghapus jadwal ini?"
          onConfirm={() => { save(schedules.filter(s => s.id !== deleteId)); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

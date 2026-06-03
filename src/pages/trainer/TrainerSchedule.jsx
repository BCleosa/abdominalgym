import { useState } from "react";

const DAYS = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
const ROOMS = ["Area Utama","Area Beban","Area Cardio","Area Yoga","Area Fungsional"];
const LEVELS = ["All Level","Beginner","Intermediate","Advanced"];

const emptyForm = {
  className: "", day: "Senin", timeStart: "07:00", timeEnd: "08:00",
  room: "Area Utama", level: "All Level", slots: 10, notes: ""
};

function getKey(trainerId) {
  return `trainer_schedule_${trainerId}`;
}

function loadSchedule(trainerId) {
  try {
    return JSON.parse(localStorage.getItem(getKey(trainerId))) || [];
  } catch { return []; }
}

function saveSchedule(trainerId, data) {
  localStorage.setItem(getKey(trainerId), JSON.stringify(data));
}

const levelColors = {
  "All Level":    { bg: "#1a2a3a", text: "#5ba3d9" },
  "Beginner":     { bg: "#1a3a1a", text: "#4caf50" },
  "Intermediate": { bg: "#3a2a1a", text: "#ff9800" },
  "Advanced":     { bg: "#3a1a1a", text: "#f44336" },
};

export default function TrainerSchedule({ trainer, onLogout, onBack }) {
  const [schedules, setSchedules] = useState(() => loadSchedule(trainer.id));
  const [activeDay, setActiveDay] = useState("Senin");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saved, setSaved] = useState(false);

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const persist = (data) => {
    setSchedules(data);
    saveSchedule(trainer.id, data);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, day: activeDay });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    const [timeStart, timeEnd] = item.time.split(" - ");
    setForm({ ...item, timeStart, timeEnd });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const entry = {
      ...form,
      time: `${form.timeStart} - ${form.timeEnd}`,
      trainer: trainer.name,
      id: editId ?? Date.now(),
    };
    // remove timeStart/timeEnd from stored object
    delete entry.timeStart;
    delete entry.timeEnd;

    let updated;
    if (editId) {
      updated = schedules.map(s => s.id === editId ? entry : s);
    } else {
      updated = [...schedules, entry];
    }
    persist(updated);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = (id) => {
    persist(schedules.filter(s => s.id !== id));
    setDeleteId(null);
  };

  const daySchedules = schedules.filter(s => s.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const total = schedules.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: "var(--dark)", borderBottom: "1px solid var(--gray-dark)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src="/logo.jpg" alt="Abdominal Gym" style={{ height: 32, objectFit: "contain" }} />
          <div style={{ width: 1, height: 24, background: "var(--gray-dark)" }} />
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-mid)" }}>Portal Pelatih · </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: trainer.color }}>{trainer.name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-mid)", marginLeft: 6 }}>— {trainer.role}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saved && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#4caf50", letterSpacing: "0.1em" }}>
              ✓ Tersimpan
            </span>
          )}
          <button onClick={onLogout}
            style={{ background: "none", border: "1px solid var(--gray-dark)", color: "var(--gray-mid)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer", borderRadius: "var(--radius)", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "var(--gray)"; e.currentTarget.style.color = "var(--white)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "var(--gray-dark)"; e.currentTarget.style.color = "var(--gray-mid)"; }}
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "32px", maxWidth: 900, width: "100%", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: 6 }}>
              Jadwal Mingguanmu
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "var(--white)", letterSpacing: "-0.02em" }}>
              {trainer.name}'s Schedule
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-mid)", marginTop: 4 }}>
              {total} sesi terjadwal · Kamu bisa tambah, ubah, atau hapus kapan saja
            </div>
          </div>
          <button onClick={openAdd} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "11px 22px" }}>
            + Tambah Sesi
          </button>
        </div>

        {/* Day tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--gray-dark)", marginBottom: 20, overflowX: "auto" }}>
          {DAYS.map(day => {
            const count = schedules.filter(s => s.day === day).length;
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                style={{
                  background: "none", border: "none",
                  borderBottom: activeDay === day ? `2px solid ${trainer.color}` : "2px solid transparent",
                  padding: "10px 18px", marginBottom: -1,
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.82rem",
                  color: activeDay === day ? trainer.color : "var(--gray-mid)",
                  cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {day}
                {count > 0 && (
                  <span style={{ background: activeDay === day ? trainer.color : "var(--gray-dark)", color: activeDay === day ? "var(--black)" : "var(--gray-mid)", fontFamily: "var(--font-mono)", fontSize: "0.55rem", width: 16, height: 16, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Schedule list */}
        {daySchedules.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 0", color: "var(--gray-mid)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.4 }}>📋</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--gray-mid)", marginBottom: 8 }}>
              Belum ada sesi di hari {activeDay}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "var(--gray)", marginBottom: 20, fontWeight: 300 }}>
              Tambahkan sesi baru untuk hari ini
            </div>
            <button onClick={openAdd} className="btn btn-ghost" style={{ fontSize: "0.8rem" }}>
              + Tambah Sesi {activeDay}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {daySchedules.map(item => {
              const lc = levelColors[item.level] || levelColors["All Level"];
              return (
                <div key={item.id}
                  style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", padding: "18px 22px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", transition: "border-color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = trainer.color}
                  onMouseOut={e => e.currentTarget.style.borderColor = "var(--gray-dark)"}
                >
                  {/* Time */}
                  <div style={{ minWidth: 120 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--white)" }}>{item.time}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-mid)", marginTop: 2 }}>{item.room}</div>
                  </div>

                  {/* Divider */}
                  <div style={{ width: 2, height: 34, background: trainer.color, flexShrink: 0, borderRadius: 2 }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--white)" }}>{item.className}</span>
                      <span style={{ background: lc.bg, color: lc.text, fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "20px" }}>{item.level}</span>
                    </div>
                    {item.notes && (
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--gray-mid)", fontWeight: 300, fontStyle: "italic" }}>{item.notes}</div>
                    )}
                  </div>

                  {/* Slots */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--gray-light)", lineHeight: 1 }}>{item.slots}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray-mid)" }}>Slot</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button className="action-btn action-btn-edit" onClick={() => openEdit(item)}>Edit</button>
                    <button className="action-btn action-btn-delete" onClick={() => setDeleteId(item.id)}>Hapus</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-box">
            <div className="modal-title">{editId ? "Edit Sesi" : "Tambah Sesi Baru"}</div>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Sesi / Kelas *</label>
                <input className="form-input" value={form.className} onChange={e => sf("className", e.target.value)} required placeholder="Contoh: Morning Workout, HIIT, Strength..." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Hari *</label>
                  <select className="form-select" value={form.day} onChange={e => sf("day", e.target.value)}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={form.level} onChange={e => sf("level", e.target.value)}>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Jam Mulai *</label>
                  <input className="form-input" type="time" value={form.timeStart} onChange={e => sf("timeStart", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Selesai *</label>
                  <input className="form-input" type="time" value={form.timeEnd} onChange={e => sf("timeEnd", e.target.value)} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Ruangan</label>
                  <select className="form-select" value={form.room} onChange={e => sf("room", e.target.value)}>
                    {ROOMS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kapasitas Slot</label>
                  <input className="form-input" type="number" min={1} max={50} value={form.slots} onChange={e => sf("slots", parseInt(e.target.value) || 1)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Catatan (opsional)</label>
                <input className="form-input" value={form.notes} onChange={e => sf("notes", e.target.value)} placeholder="Contoh: Bawa matras sendiri, sepatu wajib, dll." />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--gray-dark)" }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "10px 20px" }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "10px 24px" }}>
                  {editId ? "Simpan Perubahan" : "Tambah Sesi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-title">Hapus Sesi?</div>
            <p style={{ color: "var(--gray-light)", fontSize: "0.875rem", marginBottom: 24, fontWeight: 300 }}>
              Sesi ini akan dihapus dari jadwalmu. Tidak bisa dibatalkan.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "9px 18px" }}>Batal</button>
              <button onClick={() => handleDelete(deleteId)}
                style={{ background: "#c0392b", color: "var(--white)", border: "none", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer", borderRadius: "var(--radius)" }}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { initialTrainers } from "../../data/initialData";
import { SearchBar, Modal, ConfirmModal, EmptyState, FormActions } from "./CrudComponents";

const STORAGE_KEY = "gym_trainers";
const emptyForm = { name: "", specialization: "", phone: "", email: "", experience: "", certifications: "", status: "active", schedule: "" };

export default function TrainersPage() {
  const [trainers, setTrainers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialTrainers; } catch { return initialTrainers; }
  });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const save = (data) => { setTrainers(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };
  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (t) => { setForm({...t}); setEditId(t.id); setShowModal(true); };
  const openDelete = (id) => { setDeleteId(id); setShowConfirm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      save(trainers.map(t => t.id === editId ? { ...form, id: editId } : t));
    } else {
      save([...trainers, { ...form, id: Math.max(0, ...trainers.map(t => t.id)) + 1 }]);
    }
    setShowModal(false);
  };

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const f = form;
  const sf = (k, v) => setForm(p => ({...p, [k]: v}));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Cari pelatih..." />
        <button onClick={openAdd} className="btn-primary" style={{ fontSize: "0.8rem", padding: "10px 20px" }}>+ Tambah Pelatih</button>
      </div>

      <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", overflow: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Pelatih</th>
              <th>Spesialisasi</th>
              <th>Kontak</th>
              <th>Pengalaman</th>
              <th>Sertifikasi</th>
              <th>Jadwal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><EmptyState message="Tidak ada pelatih ditemukan" /></td></tr>
            ) : filtered.map((t, i) => (
              <tr key={t.id}>
                <td style={{ color: "var(--gray-mid)" }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600, color: "var(--white)" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-mid)" }}>{t.email}</div>
                </td>
                <td style={{ color: "var(--accent)", fontFamily: "var(--font-condensed)", fontSize: "0.825rem", fontWeight: 600 }}>{t.specialization}</td>
                <td>{t.phone}</td>
                <td>{t.experience}</td>
                <td style={{ fontSize: "0.8rem", maxWidth: 160 }}>{t.certifications}</td>
                <td style={{ fontSize: "0.8rem" }}>{t.schedule}</td>
                <td><span className={`badge badge-${t.status === "active" ? "active" : "inactive"}`}>{t.status === "active" ? "Aktif" : "Tidak Aktif"}</span></td>
                <td>
                  <button className="action-btn action-btn-edit" onClick={() => openEdit(t)}>Edit</button>
                  <button className="action-btn action-btn-delete" onClick={() => openDelete(t.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editId ? "Edit Pelatih" : "Tambah Pelatih Baru"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input className="form-input" value={f.name} onChange={e => sf("name", e.target.value)} required placeholder="Nama pelatih" />
              </div>
              <div className="form-group">
                <label className="form-label">Spesialisasi *</label>
                <input className="form-input" value={f.specialization} onChange={e => sf("specialization", e.target.value)} required placeholder="misal: Strength & Powerlifting" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nomor HP *</label>
                <input className="form-input" value={f.phone} onChange={e => sf("phone", e.target.value)} required placeholder="08xx-xxxx-xxxx" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={f.email} onChange={e => sf("email", e.target.value)} placeholder="email@ironforge.com" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Pengalaman</label>
                <input className="form-input" value={f.experience} onChange={e => sf("experience", e.target.value)} placeholder="misal: 5 tahun" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={f.status} onChange={e => sf("status", e.target.value)}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Sertifikasi</label>
              <input className="form-input" value={f.certifications} onChange={e => sf("certifications", e.target.value)} placeholder="misal: NASM-CPT, ACE" />
            </div>
            <div className="form-group">
              <label className="form-label">Jadwal Mengajar</label>
              <input className="form-input" value={f.schedule} onChange={e => sf("schedule", e.target.value)} placeholder="misal: Senin, Rabu, Jumat" />
            </div>
            <FormActions onCancel={() => setShowModal(false)} submitLabel={editId ? "Simpan Perubahan" : "Tambah Pelatih"} />
          </form>
        </Modal>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Yakin ingin menghapus data pelatih ini?"
          onConfirm={() => { save(trainers.filter(t => t.id !== deleteId)); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

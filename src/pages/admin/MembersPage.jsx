import { useState } from "react";
import { initialMembers } from "../../data/initialData";
import { SearchBar, Modal, ConfirmModal, PageHeader, EmptyState, FormActions } from "./CrudComponents";

const STORAGE_KEY = "gym_members";

const emptyForm = { name: "", email: "", phone: "", package: "Basic", joinDate: "", expiry: "", status: "active" };

export default function MembersPage() {
  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialMembers; } catch { return initialMembers; }
  });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const save = (data) => {
    setMembers(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (m) => { setForm({...m}); setEditId(m.id); setShowModal(true); };
  const openDelete = (id) => { setDeleteId(id); setShowConfirm(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      save(members.map(m => m.id === editId ? { ...form, id: editId } : m));
    } else {
      const newId = Math.max(0, ...members.map(m => m.id)) + 1;
      save([...members, { ...form, id: newId }]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    save(members.filter(m => m.id !== deleteId));
    setShowConfirm(false);
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  );

  const f = form;
  const sf = (k, v) => setForm(p => ({...p, [k]: v}));

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total", value: members.length, color: "var(--accent)" },
          { label: "Aktif", value: members.filter(m => m.status === "active").length, color: "#4caf50" },
          { label: "Tidak Aktif", value: members.filter(m => m.status === "inactive").length, color: "#f44336" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", padding: "12px 20px", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 800, fontSize: "1.3rem", color: s.color }}>{s.value}</span>
            <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-mid)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Cari member..." />
        <button onClick={openAdd} className="btn-primary" style={{ fontSize: "0.8rem", padding: "10px 20px" }}>+ Tambah Member</button>
      </div>

      {/* Table */}
      <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", overflow: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Member</th>
              <th>Kontak</th>
              <th>Paket</th>
              <th>Bergabung</th>
              <th>Kadaluarsa</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8}><EmptyState message="Tidak ada member ditemukan" /></td></tr>
            ) : filtered.map((m, i) => (
              <tr key={m.id}>
                <td style={{ color: "var(--gray-mid)", width: 40 }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600, color: "var(--white)" }}>{m.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-mid)" }}>{m.email}</div>
                </td>
                <td>{m.phone}</td>
                <td>
                  <span style={{
                    background: m.package === "VIP" ? "rgba(156,39,176,0.15)" : m.package === "Premium" ? "rgba(232,200,74,0.12)" : "var(--dark3)",
                    color: m.package === "VIP" ? "#ce93d8" : m.package === "Premium" ? "var(--accent)" : "var(--gray-light)",
                    fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.1em", padding: "3px 10px",
                  }}>{m.package}</span>
                </td>
                <td>{m.joinDate}</td>
                <td>{m.expiry}</td>
                <td><span className={`badge badge-${m.status === "active" ? "active" : "inactive"}`}>{m.status === "active" ? "Aktif" : "Tidak Aktif"}</span></td>
                <td>
                  <button className="action-btn action-btn-edit" onClick={() => openEdit(m)}>Edit</button>
                  <button className="action-btn action-btn-delete" onClick={() => openDelete(m.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? "Edit Member" : "Tambah Member Baru"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input className="form-input" value={f.name} onChange={e => sf("name", e.target.value)} required placeholder="Nama member" />
              </div>
              <div className="form-group">
                <label className="form-label">Nomor HP *</label>
                <input className="form-input" value={f.phone} onChange={e => sf("phone", e.target.value)} required placeholder="08xx-xxxx-xxxx" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={f.email} onChange={e => sf("email", e.target.value)} placeholder="email@contoh.com" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Paket *</label>
                <select className="form-select" value={f.package} onChange={e => sf("package", e.target.value)}>
                  <option>Basic</option>
                  <option>Premium</option>
                  <option>VIP</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={f.status} onChange={e => sf("status", e.target.value)}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tanggal Bergabung</label>
                <input className="form-input" type="date" value={f.joinDate} onChange={e => sf("joinDate", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Kadaluarsa</label>
                <input className="form-input" type="date" value={f.expiry} onChange={e => sf("expiry", e.target.value)} />
              </div>
            </div>
            <FormActions onCancel={() => setShowModal(false)} submitLabel={editId ? "Simpan Perubahan" : "Tambah Member"} />
          </form>
        </Modal>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Yakin ingin menghapus data member ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
